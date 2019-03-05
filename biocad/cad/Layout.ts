import Versioned  from 'jfw/Versioned';

import Depiction, { Opacity, Orientation } from './Depiction'

import {
    SBOLXGraph,
    SXComponent,
    SXSubComponent,
    SXSequenceFeature,
    SXRange
} from "sbolgraph"

import DetailPreset from './detail-preset/DetailPreset'
import levelToPreset from './detail-preset/levelToPreset'

import ComponentDepiction from './ComponentDepiction'
import BackboneDepiction from './BackboneDepiction'

import { Specifiers } from 'bioterms'

import { Vec2, Rect, LinearRange } from 'jfw/geom'

import configurateLayout from 'biocad/configurator/configurate'
import LabelDepiction from "biocad/cad/LabelDepiction";
import configurateComponent from "biocad/configurator/configurateComponent";
import configurateFeatureLocation from "biocad/configurator/configurateFeatureLocation";
import configurateLabel from "biocad/configurator/configurateLabel";
import configurateBackbone from "biocad/configurator/configurateBackbone";
import LayoutPOD from "biocad/cad/LayoutPOD";
import FeatureLocationDepiction from "biocad/cad/FeatureLocationDepiction";

import assert from 'power-assert'
import ComponentDisplayList, { BackboneGroup, Backbone, BackboneChild, OmittedSpace } from "biocad/cad/ComponentDisplayList";
import { Watcher, SXIdentified, SXSequenceConstraint, SXLocation, SXOrientedLocation, SXInteraction } from "sbolgraph"
import InteractionDepiction from './InteractionDepiction'
import BiocadApp from 'biocad/BiocadApp';
import App from 'jfw/App';
import CircularBackboneDepiction from 'biocad/cad/CircularBackboneDepiction';
import Instruction from 'biocad/cad/layout-instruction/Instruction';
import InstructionSet from 'biocad/cad/layout-instruction/InstructionSet';
import IdentifiedChain from '../IdentifiedChain';
import BackboneGroupDepiction from './BackboneGroupDepiction';


export default class Layout extends Versioned {

    static nextStamp:number = 1
    
    depictions:Array<Depiction>
    uriToDepictions:Map<string, Depiction[]>
    identifiedChainToDepiction:Map<string, Depiction>
    uidToDepiction:Map<number, Depiction>

    // important to know in the layout to work out the bbox of text in cell terms
    // otherwise it could be specific to the renderer
    gridSize:Vec2

    size:Vec2

    graph:SBOLXGraph
    graphWatcher:Watcher|null
    detailLevel:number

    constructor(graph:SBOLXGraph) {

        super()

        this.graph = graph

        this.depictions = new Array<Depiction>()
        this.uriToDepictions = new Map<string, Depiction[]>()
        this.identifiedChainToDepiction = new Map<string, Depiction>()
        this.uidToDepiction = new Map<number, Depiction>()
        this.gridSize = Vec2.fromXY(16, 16)

        if(typeof window !== 'undefined') {
            this.size = Vec2.fromXY(window.innerWidth, window.innerHeight).divide(this.gridSize)
        } else {
            this.size = Vec2.fromXY(16, 16)
        }

        this.graphWatcher = null
        this.detailLevel = 5

    }

    cleanup() {
        for(let d of this.depictions) {
            d.cleanup()
        }
    }

    private detachFromParent(depiction:Depiction) {

        if(!depiction.parent)
            return

        for(let i:number = 0; i < depiction.parent.children.length; ++ i) {

            if(depiction.parent.children[i] === depiction) {

                depiction.parent.children.splice(i, 1)
                break

            }

        }

        depiction.parent = null

    }

    private attachToParent(depiction:Depiction, parent:Depiction) {

        this.detachFromParent(depiction)

        parent.addChild(depiction)
        depiction.parent = parent

    }

    addDepiction(depiction:Depiction, parent:Depiction|undefined) {

        //console.warn('********* ADD DEPICION ' + depiction.debugName)

        if(this.uidToDepiction.get(depiction.uid) !== undefined)
            return

        if(depiction._depictionOf !== undefined) {

            if(!depiction.identifiedChain) {
                throw new Error('???')
            }

            const identifiedChain:string = depiction.identifiedChain.stringify()

            if(this.identifiedChainToDepiction.get(identifiedChain) !== undefined)
                return

            const utd = this.uriToDepictions.get(depiction._depictionOf.uri)

            if (!utd)
                this.uriToDepictions.set(depiction._depictionOf.uri, [depiction])
            else
                utd.push(depiction)

            this.identifiedChainToDepiction.set(identifiedChain, depiction)

        }

        this.depictions.push(depiction)
        this.uidToDepiction.set(depiction.uid, depiction)

        if(parent !== undefined)
            parent.addChild(depiction)

        for(let child of depiction.children) {

            this.addDepiction(child, depiction)

        }

        this.verifyAcyclic()

        this.depthSort()
    }

    changeDepictionOf(depiction:Depiction, newDepictionOf:SXIdentified, newChain:IdentifiedChain) {

        if(depiction._depictionOf === undefined)
            throw new Error('???')

        const utd:Depiction[]|undefined = this.uriToDepictions.get(depiction._depictionOf.uri)

        if(utd !== undefined) {
            for(var i = 0; i < utd.length; ++ i) {
                if(utd[i] === depiction) {
                    utd.splice(i, 1)
                    break
                }
            }
            if (utd.length === 0) {
                this.uriToDepictions.delete(depiction._depictionOf.uri)
            }
        }

        if(!depiction.identifiedChain) {
            throw new Error('???')
        }

        this.identifiedChainToDepiction.delete(depiction.identifiedChain.stringify())


        const newUtd = this.uriToDepictions.get(newDepictionOf.uri)

        if (!newUtd)
            this.uriToDepictions.set(newDepictionOf.uri, [depiction])
        else
            newUtd.push(depiction)


        this.identifiedChainToDepiction.set(newChain.stringify(), depiction)

        depiction._depictionOf = newDepictionOf

        depiction.identifiedChain = newChain

    }

    removeDepiction(depiction:Depiction) {

        for(var i = 0; i < this.depictions.length; ++ i) {

            if(this.depictions[i] === depiction) {

                this.depictions.splice(i, 1)
                break

            }

        }

        if(depiction.parent)
            depiction.parent.removeChild(depiction)

        if(depiction.depictionOf !== undefined) {

            const utd:Depiction[]|undefined = this.uriToDepictions.get(depiction.depictionOf.uri)

            if(utd === undefined)
                throw new Error('???')

            for(var i = 0; i < utd.length; ++ i) {
                if(utd[i] === depiction) {
                    utd.splice(i, 1)
                    break
                }
            }

            if(utd.length === 0) {
                this.uriToDepictions.delete(depiction.depictionOf.uri)
            }

            if(depiction.identifiedChain) {
                this.identifiedChainToDepiction.delete(depiction.identifiedChain.stringify())
            }
        }

        this.uidToDepiction.delete(depiction.uid)

    }

    removeDepictionRecursive(depiction:Depiction) {

        while(depiction.children.length > 0) {
            this.removeDepictionRecursive(depiction.children[0])
        }

        this.removeDepiction(depiction)
    }

    getRootDepictions():Array<Depiction> {
        return this.depictions.filter((depiction) => !depiction.parent)
    }

    clone():Layout {

        return LayoutPOD.deserialize(this.graph, LayoutPOD.serialize(this))

    }

    cloneWithNewGraph(newGraph:SBOLXGraph):Layout {

        return LayoutPOD.deserialize(newGraph, LayoutPOD.serialize(this))

    }

    getVersionedParent():Versioned|undefined {
        return undefined
    }

    getVersionedChildren():Versioned[] {
        return this.depictions
    }

    versionChangedCallback:()=>void

    onVersionChanged():void {

        /* If the version of the layout changes, it means that one of our depictions
         * changed and it propagated upwards.  We now need to reconfigurate the layout
         * to accommodate for the changes to that depiction.
         * 
         * Any depictions that still have the old version attached to them don't need
         * to be configurated, because they and nothing under them have changed.
         * 
         * So, start with the lowest-depth (most-nested) objects and configurate them
         * working outwards, but skip any where the version is different from the
         * layout version.
         */

        console.log('layout: version changed...')

        const instructions:InstructionSet = new InstructionSet([])

        // ideally would just sync the one that changed, but never mind
        //
        this.syncAllDepictions(5)
        
        for(let depiction of this.depictions) {

            if(depiction.isSameVersionAs(this)) {

                console.log('layout onVersionChanged: reconfigurating ' + depiction.debugName)

                if(depiction instanceof ComponentDepiction) {

                    configurateComponent(depiction as ComponentDepiction, instructions)

                } else if(depiction instanceof BackboneDepiction) {

                    configurateBackbone(depiction as BackboneDepiction, instructions)

                } else if(depiction instanceof FeatureLocationDepiction) {

                    configurateFeatureLocation(depiction as FeatureLocationDepiction, instructions)

                } else if(depiction instanceof LabelDepiction) {

                    configurateLabel(depiction as LabelDepiction, instructions)

                }

            } 

        }

        if(this.versionChangedCallback)
            this.versionChangedCallback()
    }

    depthSort():void {

        //this.dump()

        /* -> lowest depth first
         */
        this.depictions = this.depictions.sort((a:Depiction, b:Depiction) => {
            return a.calcDepth() - b.calcDepth()
        })

    }


    getDepictionForUid(uid:number):Depiction|undefined {

        return this.uidToDepiction.get(uid)

    }

    getDepictionsForUri(uri:string):Depiction[] {

        return this.uriToDepictions.get(uri) || []

    }

    getDepictionForIdentifiedChain(identifiedChain:IdentifiedChain):Depiction|undefined {

        return this.identifiedChainToDepiction.get(identifiedChain.stringify())

    }

    syncAllDepictions(detailLevel:number): void {

        let graph:SBOLXGraph = this.graph
        let rootComponents:Array<SXComponent> = graph.rootComponents

        this.syncDepictions(detailLevel, rootComponents.map((c) => c.uri))
    }

    syncDepictions(detailLevel:number, URIs:string[]): void {

        console.time('syncAllDepictions')

        ++ Layout.nextStamp

        this.detailLevel = detailLevel

        const graph:SBOLXGraph = this.graph

        /* Create depictions for anything that doesn't already have one
         */

        const preset:DetailPreset = levelToPreset(detailLevel)

        let components:Array<SXComponent> = []

        for(let uri of URIs) {

            let c = graph.uriToFacade(uri)

            if(c instanceof SXComponent) {
                components.push(c)
            }
        }

        //console.log('Layout: I have ' + rootComponents.length + ' root component(s)')
        //console.dir(rootComponents)

        for(let component of components) {

            let chain = new IdentifiedChain()
            chain = chain.extend(component)

            const opacity:Opacity = preset.getComponentOpacity(component, 0)

            var cdDepiction:ComponentDepiction

            var depiction:Depiction|undefined = this.identifiedChainToDepiction.get(chain.stringify())

            if(depiction !== undefined) {

                console.log(component.uri + ' found in depictionMap; uid ' + depiction.uid)

                assert(depiction instanceof ComponentDepiction)

                depiction.stamp = Layout.nextStamp

                cdDepiction = depiction

                depiction.parent = null

                // TODO label?

            } else {

                console.log(component.uri + ' not found in depictionMap')

                cdDepiction = new ComponentDepiction(this, component, chain, undefined)
                cdDepiction.setSameVersionAs(this)

                this.addDepiction(cdDepiction, undefined)

                cdDepiction.opacity = opacity
            }

            cdDepiction.orientation = Orientation.Forward
            cdDepiction.isExpandable = component.subComponents.length > 0

            if(cdDepiction.opacity === Opacity.Whitebox) {

                var displayList:ComponentDisplayList = ComponentDisplayList.fromComponent(component, { omitEmptySpace: true, forceMinWidth: true })

                for(let backboneGroup of displayList.backboneGroups) {
                    //console.log('BB GROUP LEN ' + backboneGroup.length)
                    this.syncBackboneGroup(preset, backboneGroup, chain, cdDepiction, 1, Orientation.Forward)
                }

                for(let child of displayList.ungrouped) {

                    if(! (child instanceof SXSubComponent))
                        throw new Error('???')

                    let nextChain = chain.extend(child)

                    this.syncComponentInstanceDepiction(preset, child as SXSubComponent, nextChain, cdDepiction, 1, Orientation.Forward, null)

                }

                //console.log(component.displayName + ' has ' + component.interactions.length + ' interactions')

                for(let interaction of component.interactions) {

                    let nextChain = chain.extend(interaction)

                    this.createInteractionDepiction(preset, interaction, nextChain, cdDepiction)
                }
            }
        }



        /// remove any depictions that weren't touched by this sweep

        for(var i = 0; i < this.depictions.length; ) {

            if(this.depictions[i].stamp !== Layout.nextStamp) {

                console.log(this.depictions[i].debugName + ' is gone')

                this.removeDepiction(this.depictions[i])

            } else {

                console.log(this.depictions[i].debugName + ' is still here')

                ++ i

            }

        }


        ///






        this.verifyAcyclic()

        this.depthSort()

        console.timeEnd('syncAllDepictions')

    }

    startWatchingGraph(updateContext:App) {

        /*

        if(this.graphWatcher) {
            this.graphWatcher.unwatch()
        }

        this.graphWatcher = this.graph.watch(() => {
            requestAnimationFrame(() => {
                this.syncAllDepictions(this.detailLevel)
                this.configurate([])
                updateContext.update()
            })
        })*/

    }

    configurate(instructions:Array<Instruction>) {

        configurateLayout(this, new InstructionSet(instructions))

    }

    private syncSequenceAnnotationDepiction(preset:DetailPreset, location:SXLocation, chain:IdentifiedChain, parent:BackboneDepiction, nestDepth:number, orientation:Orientation, range:LinearRange) {

        //const sequenceAnnotation:SXSequenceFeature = location.containingSequenceFeature

        const containingObject:SXIdentified|undefined = location.containingObject

        if(containingObject === undefined)
            throw new Error('???')

        //const opacity:Opacity = preset.getSequenceFeatureOpacity(sequenceAnnotation, nestDepth)

        const opacity = Opacity.Blackbox

        var nestedOrientation:Orientation

        if(location instanceof SXOrientedLocation) {

            nestedOrientation = (location as SXOrientedLocation).orientation ===
                Specifiers.SBOLX.Orientation.ReverseComplement ?
                    reverse(orientation) : orientation

        } else {

            nestedOrientation = orientation

        }


        if(containingObject instanceof SXSubComponent) {

            const cDepiction:ComponentDepiction = this.syncComponentInstanceDepiction(preset, containingObject as SXSubComponent, chain, parent, nestDepth, nestedOrientation, range)
            cDepiction.location = location

            return cDepiction

        } else if(containingObject instanceof SXSequenceFeature) {

            var depiction:Depiction|undefined = this.identifiedChainToDepiction.get(chain.stringify())
            var salDepiction

            if(depiction !== undefined) {

                assert(depiction instanceof FeatureLocationDepiction)

                depiction.stamp = Layout.nextStamp
    
                salDepiction = depiction as FeatureLocationDepiction
    
                this.attachToParent(depiction, parent)

            } else {

                depiction = salDepiction = new FeatureLocationDepiction(this, containingObject, chain, parent)
                salDepiction.setSameVersionAs(this)

                this.addDepiction(depiction, parent)

                salDepiction.opacity = Opacity.Blackbox
            }

            salDepiction.location = location

            salDepiction.depictionOf = containingObject as SXSequenceFeature

            salDepiction.orientation = nestedOrientation
            salDepiction.range = range

            salDepiction.isExpandable = false

            return salDepiction

        } else {

            throw new Error('???')

        }

    }

    private syncComponentInstanceDepiction(preset:DetailPreset, component:SXSubComponent, chain:IdentifiedChain, parent:Depiction, nestDepth:number, orientation:Orientation, range:LinearRange|null):ComponentDepiction {

        if(!component.instanceOf)
            throw new Error('Component has no definition')

        const opacity:Opacity = preset.getComponentOpacity(component.instanceOf, nestDepth)

        //console.error('syncing CID with orientation ' + orientation)
        
        const definition:SXComponent = component.instanceOf


        var cDepiction:ComponentDepiction

        var depiction:Depiction|undefined = this.identifiedChainToDepiction.get(chain.stringify())

        if(depiction !== undefined) {

            depiction.stamp = Layout.nextStamp

            assert(depiction instanceof ComponentDepiction)

            depiction.stamp = Layout.nextStamp

            cDepiction = depiction as ComponentDepiction

            this.attachToParent(depiction, parent)

        } else {

            cDepiction = new ComponentDepiction(this, component, chain, parent)
            cDepiction.setSameVersionAs(this)

            this.addDepiction(cDepiction, parent)

            cDepiction.opacity = opacity

        }

        cDepiction.orientation = orientation

        if(range)
            cDepiction.range = range

        cDepiction.isExpandable = definition.subComponents.length > 0

        if(cDepiction.opacity === Opacity.Whitebox) {

            var displayList:ComponentDisplayList = ComponentDisplayList.fromComponent(component.instanceOf, { omitEmptySpace: true, forceMinWidth: true })

            //console.log(displayList.backboneGroups.length + ' bb groups for ' + component.uriChain)

            for(let backboneGroup of displayList.backboneGroups) {
                this.syncBackboneGroup(preset, backboneGroup, chain, cDepiction, nestDepth + 1, orientation)
            }

            for(let child of displayList.ungrouped) {

                if(! (child instanceof SXSubComponent))
                    throw new Error('???')

                let nextChain = chain.extend(child)

                this.syncComponentInstanceDepiction(preset, child as SXSubComponent, nextChain, cDepiction, nestDepth + 1, orientation, null)

            }

            //console.log(definition.displayName + ' has ' + definition.interactions.length + ' interactions')

            for(let interaction of definition.interactions) {

                let newChain = chain.extend(interaction)

                this.createInteractionDepiction(preset, interaction, newChain, cDepiction)
            }
        }

        return cDepiction
    }

    createInteractionDepiction(preset:DetailPreset, interaction:SXInteraction, chain:IdentifiedChain, parent:ComponentDepiction) {

        var iDepiction:InteractionDepiction|null

        var depiction:Depiction|undefined = this.identifiedChainToDepiction.get(chain.stringify())

        if(depiction !== undefined) {

            iDepiction = depiction as InteractionDepiction

            depiction.stamp = Layout.nextStamp

            this.attachToParent(iDepiction, parent)

        } else {

            iDepiction = new InteractionDepiction(this, interaction, chain, parent)

            if(iDepiction)
                this.addDepiction(iDepiction, parent)
        }
    }


    private syncBackboneGroup(preset:DetailPreset, dlGroup:BackboneGroup, chain:IdentifiedChain, parent:Depiction, nestDepth:number, orientation:Orientation):void {

        // parent is a depiction of an SXComponent or SXSubComponent (i.e., a ComponentDepiction)

        if(! (parent instanceof ComponentDepiction)) {
            throw new Error('???')
        }

        let group:BackboneGroupDepiction|null = null
        let bestGroupScore = -1

        for(let child of parent.children) {
            if(child instanceof BackboneGroupDepiction) {
                let score = child.closenessScoreToDisplayList(dlGroup) 
                if(score > bestGroupScore) {
                    group = child
                    bestGroupScore = score
                }
            }
        }

        if(!group) {
            group = new BackboneGroupDepiction(this, parent)
            group.setSameVersionAs(this)
            this.addDepiction(group, parent)
        }

        group.stamp = Layout.nextStamp

        group.backboneLength = dlGroup.backboneLength
        group.locationsOfOmittedRegions = dlGroup.locationsOfOmittedRegions

        var c:ComponentDepiction = parent as ComponentDepiction

        let circular:boolean = c.getDefinition().hasType(Specifiers.SBOL2.Type.Circular)

        let backbones:Map<Backbone,BackboneDepiction> = new Map()

        for(let [ backboneIndex, dlBackbone ] of dlGroup.backbones) {

            let backbone = group.getBackboneForIndex(backboneIndex)

            if(!backbone) {
                backbone =
                    circular ?
                        new CircularBackboneDepiction(this, backboneIndex, parent) :
                        new BackboneDepiction(this, backboneIndex, parent)
                backbone.setSameVersionAs(this)
                this.addDepiction(backbone, group)
            }

            backbones.set(dlBackbone, backbone)
            backbone.stamp = Layout.nextStamp
        }

        for(let [ dlBackbone, backbone ] of backbones) {

            for(let child of dlBackbone.children) {

                let { object, range, forward } = child

                /*
                if(!forward) {
                    orientation = reverse(orientation)
                }*/

                let newChain = chain.extend(object)

                var obj

                if(object instanceof SXSubComponent) {
                    obj = this.syncComponentInstanceDepiction(preset, object, newChain, backbone, nestDepth + 1, orientation, range)
                } else if (object instanceof SXLocation) {
                    obj = this.syncSequenceAnnotationDepiction(preset, object, newChain, backbone, nestDepth + 1, orientation, range)
                } else {
                    throw new Error('???')
                }

                this.syncLabel(preset, backbone, obj, nestDepth)
            }

        }

    }

    private syncLabel(preset:DetailPreset, parent:Depiction, labelFor:Depiction, nestDepth:number):void {

        let label:LabelDepiction|undefined = undefined

        for(let child of parent.children) {
            if(child instanceof LabelDepiction && child.labelFor) {
                let existingChain = child.labelFor.identifiedChain
                let newChain = labelFor.identifiedChain
                if(existingChain && newChain && existingChain.stringify() === newChain.stringify()) {
                    label = child
                    break
                }
            }
        }

        if(label) {
            label.labelFor = labelFor
            label.setSameVersionAs(this)
            label.stamp = Layout.nextStamp
        } else {
            label = new LabelDepiction(this, labelFor, parent)
            this.addDepiction(label, parent)
        }
    }

    getIntersectingDepictions(pos:Vec2, bSelectableOnly:boolean):Depiction[] {

        return this.depictions.filter((depiction:Depiction) => {
            return (bSelectableOnly === false || depiction.isSelectable()) && depiction.isVisible() && depiction.absoluteBoundingBox.intersectsPoint(pos)
        })

    }

    getDepictionsContainedByRect(rect:Rect, bSelectableOnly:boolean):Depiction[] {

        return this.depictions.filter((depiction:Depiction) => {
            return (bSelectableOnly === false || depiction.isSelectable()) && depiction.isVisible() && rect.contains(depiction.absoluteBoundingBox)
        })

    }

    getDepictionsIntersectingRect(rect:Rect, bSelectableOnly:boolean):Depiction[] {

        return this.depictions.filter((depiction:Depiction) => {
            return (bSelectableOnly === false || depiction.isSelectable()) && depiction.isVisible() && rect.intersects(depiction.absoluteBoundingBox)
        })

    }

    getDepictionsIntersectingPoint(point:Vec2, bSelectableOnly:boolean):Depiction[] {

        return this.depictions.filter((depiction:Depiction) => {
            return (bSelectableOnly === false || depiction.isSelectable()) && depiction.isVisible() && depiction.absoluteBoundingBox.intersectsPoint(point)
        })

    }

    getTopIntersectingDepiction(pos:Vec2, bSelectableOnly:boolean):Depiction|null {

        //for(var i:number = this.depictions.length - 1; i >= 0; -- i) {
        for(var i:number = 0; i < this.depictions.length; ++ i) {
            if((bSelectableOnly === false || this.depictions[i].isSelectable()) && this.depictions[i].isVisible() && this.depictions[i].absoluteBoundingBox.intersectsPoint(pos))
                return this.depictions[i]

        }

        return null
    }

    // returns the actual bbox of the layout
    // note that topleft might not be and probably isn't 0,0!
    // so if you want to know how big a layout is the size of getBoundingBox isn't enough
    // you need to getBoundingBox and then change the topLeft to 0,0 and then get the size
    getBoundingBox():Rect|null {

        var boundingBox:Rect|null = null

        if(this.depictions.length === 0) {
            // who gives a shit
            //console.warn('No depictions; Layout::getBoundingBox is going to return null')
        }

        for(var i:number = this.depictions.length - 1; i >= 0; -- i) {

            const depiction = this.depictions[i]

            if(depiction.parent)
                continue

            if(!boundingBox)
                boundingBox = depiction.boundingBox
            else
                boundingBox = boundingBox.surround(depiction.boundingBox)
        }

        return boundingBox
    }

    getBoundingSize():Vec2 {

        let bbox = this.getBoundingBox()

        if(bbox === null)
            return Vec2.fromXY(0, 0)

        bbox.topLeft = Vec2.fromXY(0, 0)
        return bbox.size()
    }

    getSize():Vec2 {

        return this.size

    }

    crop(padding?:Vec2) {

        let bbox = this.getBoundingBox()

        if(!bbox)
            return

        this.size = bbox.size()

        for(let depiction of this.getRootDepictions()) {
            depiction.offset = depiction.offset.subtract(bbox.topLeft)
        }

        if(padding !== undefined) {
            for (let depiction of this.getRootDepictions()) {
                depiction.offset = depiction.offset.add(padding)
            }
            this.size = this.getBoundingSize().add(padding)
        }

    }

    verifyAcyclic() {

        //this.dump()

        for(let d of this.depictions)
            check(d, new Set<number>())

        function check(d, visited) {
            if(visited.has(d.uid)) {
                console.error(d.debugName + ' is an ancestor of itself')
                throw new Error('Cyclic depiction graph')
            } else {
                visited.add(d.uid)
            }

            for(let child of d.children) {
                check(child, visited)

                let visitedParents = new Set<number>()

                for(let ch = child; ch; ch = ch.parent) {
                    if(visitedParents.has(ch.uid))
                        throw new Error('Cyclic ancestry')
                    else
                        visitedParents.add(ch.uid)
                }
            }
        }
    }

    dump() {

        for(let d of this.getRootDepictions()) {
            dump(d, 0)
        }

        function dump(d, indent:number) {
            console.log('      '.slice(5 - indent)  + d.debugName + ' (' + d.children.length + ' children)')
            for(let child of d.children) {
                dump(child, indent + 1)
            }
        }
    }

}


function reverse(orientation:Orientation):Orientation {

    return orientation === Orientation.Forward ?
                Orientation.Reverse :
                Orientation.Forward

}
