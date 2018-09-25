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

import { Vec2, Rect } from 'jfw/geom'

import configurateLayout from 'biocad/configurator/configurate'
import LabelDepiction from "biocad/cad/LabelDepiction";
import configurateComponent from "biocad/configurator/configurateComponent";
import configurateFeatureLocation from "biocad/configurator/configurateFeatureLocation";
import configurateLabel from "biocad/configurator/configurateLabel";
import configurateLabelled from "biocad/configurator/configurateLabelled";
import configurateBackbone from "biocad/configurator/configurateBackbone";
import LayoutPOD from "biocad/cad/LayoutPOD";
import FeatureLocationDepiction from "biocad/cad/FeatureLocationDepiction";

import assert from 'power-assert'
import ComponentDisplayList from "biocad/cad/ComponentDisplayList";
import { Watcher, SXIdentified, SXSequenceConstraint, SXLocation, SXOrientedLocation, SXInteraction } from "sbolgraph"
import InteractionDepictionFactory from './InteractionDepictionFactory'
import InteractionDepiction from './InteractionDepiction'
import BiocadApp from 'biocad/BiocadApp';
import App from 'jfw/App';
import CircularBackboneDepiction from 'biocad/cad/CircularBackboneDepiction';
import Instruction from 'biocad/cad/layout-instruction/Instruction';
import InstructionSet from 'biocad/cad/layout-instruction/InstructionSet';
import LabelledDepiction from './LabelledDepiction';
import IdentifiedChain from '../IdentifiedChain';


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

    app:BiocadApp
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
        this.size = Vec2.fromXY(window.innerWidth, window.innerHeight).divide(this.gridSize)
        this.graphWatcher = null
        this.detailLevel = 5

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

        depiction.parent = parent
        parent.children.push(depiction)

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

        depiction.children.forEach((child:Depiction) => {

            this.addDepiction(child, depiction)

        })

        this.depthSort()
    }

    changeDepictionOf(depiction:Depiction, newDepictionOf:SXIdentified) {

        if(depiction.depictionOf !== undefined) {

            const utd:Depiction[]|undefined = this.uriToDepictions.get(depiction.depictionOf.uri)

            if(utd !== undefined) {
                for(var i = 0; i < utd.length; ++ i) {
                    if(utd[i] === depiction) {
                        utd.splice(i, 1)
                        break
                    }
                }
                if (utd.length === 0) {
                    this.uriToDepictions.delete(depiction.depictionOf.uri)
                }
            }

            if(!depiction.identifiedChain) {
                throw new Error('???')
            }

            this.identifiedChainToDepiction.delete(depiction.identifiedChain.stringify())
        }


        const utd = this.uriToDepictions.get(newDepictionOf.uri)

        if (!utd)
            this.uriToDepictions.set(newDepictionOf.uri, [depiction])
        else
            utd.push(depiction)


        depiction._depictionOf = newDepictionOf

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

            if(!depiction.identifiedChain) {
                throw new Error('???')
            }

            this.identifiedChainToDepiction.delete(depiction.identifiedChain.stringify())

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
        
        this.depictions.forEach((depiction:Depiction) => {

            if(depiction.isSameVersionAs(this)) {

                console.log('layout onVersionChanged: reconfigurating ' + depiction.debugName)

                if(depiction instanceof LabelledDepiction) {

                    configurateLabelled(depiction as LabelledDepiction, instructions)

                } else if(depiction instanceof ComponentDepiction) {

                    configurateComponent(depiction as ComponentDepiction, instructions)

                } else if(depiction instanceof BackboneDepiction) {

                    configurateBackbone(depiction as BackboneDepiction, instructions)

                } else if(depiction instanceof FeatureLocationDepiction) {

                    configurateFeatureLocation(depiction as FeatureLocationDepiction, instructions)

                } else if(depiction instanceof LabelDepiction) {

                    configurateLabel(depiction as LabelDepiction, instructions)

                }

            }

        })
    }

    depthSort():void {

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

        ++ Layout.nextStamp

        this.detailLevel = detailLevel

        const graph:SBOLXGraph = this.graph

        /* Create depictions for anything that doesn't already have one
         */

        const preset:DetailPreset = levelToPreset(detailLevel)

        const rootComponents:Array<SXComponent> = graph.rootComponents

        //console.log('Layout: I have ' + rootComponents.length + ' root component(s)')
        //console.dir(rootComponents)

        rootComponents.forEach((component:SXComponent) => {

            let chain = new IdentifiedChain()
            chain = chain.extend(component)

            const opacity:Opacity = preset.getComponentOpacity(component, 0)

            var cdDepiction:ComponentDepiction

            var depiction:Depiction|undefined = this.identifiedChainToDepiction.get(chain.stringify())

            if(depiction !== undefined) {

                //console.log(component.uri + ' found in depictionMap')

                assert(depiction instanceof LabelledDepiction)

                depiction.stamp = Layout.nextStamp
                ;(depiction as LabelledDepiction).getLabel().stamp = Layout.nextStamp
                ;(depiction as LabelledDepiction).getLabelled().stamp = Layout.nextStamp

                let labelled = (depiction as LabelledDepiction).getLabelled()

                if(! (labelled instanceof ComponentDepiction)) {
                    throw new Error('???')
                }

                cdDepiction = labelled

                depiction.parent = null

                // TODO label?

            } else {

                //console.log(component.uri + ' not found in depictionMap')

                const labelled:LabelledDepiction = new LabelledDepiction(this, component, chain, undefined)

                cdDepiction = new ComponentDepiction(this, labelled)
                labelled.addChild(cdDepiction)

                const label: LabelDepiction = new LabelDepiction(this, labelled)
                labelled.addChild(label)

                this.addDepiction(labelled, undefined)


                cdDepiction.opacity = opacity
            }

            cdDepiction.orientation = Orientation.Forward
            cdDepiction.isExpandable = component.subComponents.length > 0

            var displayList:ComponentDisplayList = ComponentDisplayList.fromComponent(component)

            displayList.backboneGroups.forEach((backboneGroup:Array<SXIdentified>) => {
                //console.log('BB GROUP LEN ' + backboneGroup.length)
                this.syncBackbone(preset, backboneGroup, chain, cdDepiction, 1, Orientation.Forward)
            })

            displayList.ungrouped.forEach((child:SXIdentified) => {

                if(! (child instanceof SXSubComponent))
                    throw new Error('???')

                let nextChain = chain.extend(child)

                this.syncComponentInstanceDepiction(preset, child as SXSubComponent, nextChain, cdDepiction, 1, Orientation.Forward)

            })

            //console.log(component.displayName + ' has ' + component.interactions.length + ' interactions')

            component.interactions.forEach((interaction:SXInteraction) => {

                let nextChain = chain.extend(interaction)

                this.createInteractionDepiction(preset, interaction, nextChain, cdDepiction)
            })
        })



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






        this.depthSort()
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

    private syncSequenceAnnotationDepiction(preset:DetailPreset, location:SXLocation, chain:IdentifiedChain, parent:Depiction, nestDepth:number, orientation:Orientation) {

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

            const cDepiction:ComponentDepiction = this.syncComponentInstanceDepiction(preset, containingObject as SXSubComponent, chain, parent, nestDepth, nestedOrientation)
            cDepiction.location = location

        } else if(containingObject instanceof SXSequenceFeature) {

            var depiction:Depiction|undefined = this.identifiedChainToDepiction.get(chain.stringify())
            var salDepiction

            if(depiction !== undefined) {

                assert(depiction instanceof LabelledDepiction)

                depiction.stamp = Layout.nextStamp
                ;(depiction as LabelledDepiction).getLabel().stamp = Layout.nextStamp
                ;(depiction as LabelledDepiction).getLabelled().stamp = Layout.nextStamp
    
                let thingThatIsLabelled = (depiction as LabelledDepiction).getLabelled()
    
                assert(thingThatIsLabelled instanceof FeatureLocationDepiction)
    
                salDepiction = thingThatIsLabelled as FeatureLocationDepiction
    
                this.attachToParent(depiction, parent)

            } else {

                let labelled:LabelledDepiction = new LabelledDepiction(this, containingObject, chain, parent)

                salDepiction = new FeatureLocationDepiction(this, labelled)
                labelled.addChild(salDepiction)

                const label: LabelDepiction = new LabelDepiction(this, labelled)
                labelled.addChild(label)

                this.addDepiction(labelled, parent)

                salDepiction.opacity = Opacity.Blackbox

            }

            salDepiction.location = location

            salDepiction.depictionOf = containingObject as SXSequenceFeature
            salDepiction.orientation = nestedOrientation
            salDepiction.isExpandable = false

        } else {

            throw new Error('???')

        }

    }

    private syncComponentInstanceDepiction(preset:DetailPreset, component:SXSubComponent, chain:IdentifiedChain, parent:Depiction, nestDepth:number, orientation:Orientation):ComponentDepiction {

        if(!component.instanceOf)
            throw new Error('Component has no definition')

        const opacity:Opacity = preset.getComponentOpacity(component.instanceOf, nestDepth)

        //console.error('syncing CID with orientation ' + orientation)
        
        const definition:SXComponent = component.instanceOf


        var cDepiction:ComponentDepiction

        var depiction:Depiction|undefined = this.identifiedChainToDepiction.get(chain.stringify())

        if(depiction !== undefined) {

            assert(depiction instanceof LabelledDepiction)

            depiction.stamp = Layout.nextStamp
            ;(depiction as LabelledDepiction).getLabel().stamp = Layout.nextStamp
            ;(depiction as LabelledDepiction).getLabelled().stamp = Layout.nextStamp

            let thingThatIsLabelled = (depiction as LabelledDepiction).getLabelled()

            assert(thingThatIsLabelled instanceof ComponentDepiction)

            cDepiction = thingThatIsLabelled as ComponentDepiction

            this.attachToParent(depiction, parent)

        } else {

            let labelled: LabelledDepiction = new LabelledDepiction(this, component, chain, parent)

            cDepiction = new ComponentDepiction(this, labelled)
            labelled.addChild(cDepiction)

            const label:LabelDepiction = new LabelDepiction(this, labelled)
            labelled.addChild(label)

            this.addDepiction(labelled, parent)

            cDepiction.opacity = opacity

        }

        cDepiction.orientation = orientation
        cDepiction.isExpandable = definition.subComponents.length > 0


        var displayList:ComponentDisplayList = ComponentDisplayList.fromComponent(component.instanceOf)

        //console.log(displayList.backboneGroups.length + ' bb groups for ' + component.uriChain)

        displayList.backboneGroups.forEach((backboneGroup:Array<SXIdentified>) => {
            this.syncBackbone(preset, backboneGroup, chain, cDepiction, nestDepth + 1, orientation)
        })

        displayList.ungrouped.forEach((child:SXIdentified) => {

            if(! (child instanceof SXSubComponent))
                throw new Error('???')

            this.syncComponentInstanceDepiction(preset, child as SXSubComponent, chain, cDepiction, nestDepth + 1, orientation)

        })

        //console.log(definition.displayName + ' has ' + definition.interactions.length + ' interactions')

        definition.interactions.forEach((interaction:SXInteraction) => {

            let newChain = chain.extend(interaction)

            this.createInteractionDepiction(preset, interaction, newChain, cDepiction)
        })

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

            iDepiction = InteractionDepictionFactory.fromInteraction(this, interaction, chain, parent)

            if(iDepiction)
                this.addDepiction(iDepiction, parent)
        }
    }


    private syncBackbone(preset:DetailPreset, children:Array<SXIdentified>, chain:IdentifiedChain, parent:Depiction, nestDepth:number, orientation:Orientation):void {

        console.log('sync backbone children ', children.map((child) => child.uri).join(' '))


        // parent is a cd, c, or fc

        if(! (parent instanceof ComponentDepiction)) {
            throw new Error('???')
        }

        var c:ComponentDepiction = parent as ComponentDepiction



        const backbone:BackboneDepiction =
                    c.getDefinition().hasType(Specifiers.SBOL2.Type.Circular) ?
                        new CircularBackboneDepiction(this, parent) :
                        new BackboneDepiction(this, parent)

        backbone.stamp = Layout.nextStamp

        this.addDepiction(backbone, parent)





        children = this.sortBackboneChildren(children, orientation)



            //console.log('BB FOR ' + parent.depictionOf.uriChain + ' HAS ' + children.length + ' CHILDREN')

        children.forEach((child:SXIdentified) => {

            var effectiveThing:SXIdentified|undefined = undefined
            
            /*
            if(child instanceof SXLocation) {
                
                effectiveThing = (child as SXLocation).containingObject

            } else {

                effectiveThing = child

            }*/
            
            effectiveThing = child

            if(effectiveThing === undefined) {
                throw new Error('???')
            }

            let newChain = chain.extend(effectiveThing)

            if(effectiveThing instanceof SXSubComponent) {

                console.error('SYNCING CI DEPCT')

                this.syncComponentInstanceDepiction(preset, effectiveThing as SXSubComponent, newChain, backbone, nestDepth + 1, orientation)


            } else if(effectiveThing instanceof SXSequenceFeature) {

                console.error('SYNCING SEQFEATURE DEPCT')

                /*
                var nestedOrientation: Orientation

                if (child instanceof OrientedLocation) {

                    nestedOrientation = (child as OrientedLocation).orientation ===
                        Specifiers.SBOL2.Orientation.ReverseComplement ?
                        reverse(orientation) : orientation

                } else {

                    nestedOrientation = orientation

                }*/

            } else if(effectiveThing instanceof SXLocation) {

                console.error('SYNCING LOC DEPCT')

                this.syncSequenceAnnotationDepiction(preset, effectiveThing, newChain, backbone, nestDepth + 1, orientation)

            } else {

                throw new Error('???')
            
            }

        })


    }


    private sortBackboneChildren(children:Array<SXIdentified>, orientation:Orientation):Array<SXIdentified> {

        //console.log('sorting ' + children.length + ' children')

        var fixedChildren:Array<SXIdentified> = children.filter((child:SXIdentified) => {

            if(child instanceof SXSubComponent) {

                const componentInstance:SXSubComponent = child as SXSubComponent

                if (componentInstance.hasFixedLocation())
                    return true
            }

            if(child instanceof SXLocation) {

                return (child as SXLocation).isFixed()

            }

            return false

        })

        //console.error(fixedChildren.length + ' fixed children')

        fixedChildren = fixedChildren.sort((a:SXIdentified, b:SXIdentified) => {

            return start(a) - start(b)

            function start(child:SXIdentified):number {

                const locations:Array<SXLocation> = []

                if(child instanceof SXLocation) {

                    if((child as SXLocation).isFixed()) {
                        locations.push(child as SXLocation)
                    }

                } else if(child instanceof SXSubComponent) {

                    child.locations.forEach((location:SXLocation) => {

                        if(location.isFixed()) {

                            locations.push(location)

                        }

                    })
                                

                } else {

                    throw new Error('???')
                
                }

                var minStart = 999999
                //var maxEnd = -999999

                locations.forEach((location) => {

                    if(location instanceof SXRange) {

                        const range:SXRange = location as SXRange

                        if (range.start === undefined)
                            throw new Error('???')

                        minStart = Math.min(range.start, minStart)
                        //maxEnd = Math.max(location.end, maxEnd)
                    }


                })

                return minStart
            }
        
        })


        var resultChildren:Array<SXIdentified> = fixedChildren.slice(0)


        /* now for those mucky "constraint" children
        * also includes children with no fixed locations AND no constraints
        */


        var constraintChildren:Array<SXIdentified> = children.filter((child:SXIdentified) => {

            return fixedChildren.indexOf(child) === -1

        })


        function childrenMatchingComponent(children:Array<SXIdentified>, component:SXSubComponent):Array<SXIdentified> {

            return children.filter((child:SXIdentified) => {

                if(child instanceof SXLocation) {

                    const location:SXLocation = child as SXLocation

                    const containingObject:SXIdentified|undefined = location.containingObject

                    return containingObject && containingObject.uri === component.uri

                } else if(child instanceof SXSubComponent) {

                    return child.uri === component.uri

                }

            })

        }
        

        const doneDepictions:Set<SXIdentified> = new Set()

        constraintChildren.forEach((child:SXIdentified) => {
            positionConstraintChild(child)
        })

        function positionConstraintChild(child:SXIdentified):void {

            if(doneDepictions.has(child))
                return



            var c:SXSubComponent|undefined = undefined


            // might be a location!

            if(child instanceof SXLocation) {

                const cc:SXIdentified|undefined = (child as SXLocation).containingObject

                if(cc === undefined)
                    throw new Error('????')

                if(! (cc instanceof SXSubComponent))
                    throw new Error('????')

                c = cc

            } else if(child instanceof SXSubComponent) {

                c = child as SXSubComponent

            } else {

                throw new Error('???')

            }


            const constraints:Array<SXSequenceConstraint> = c.sequenceConstraints

            if(constraints.length === 0) {
                resultChildren.push(child)
                doneDepictions.add(child)
                return
            }

            for(var i = 0; i < constraints.length; ++ i) {

                const constraint:SXSequenceConstraint = constraints[i]

                let otherChildren:Array<SXIdentified> = childrenMatchingComponent(resultChildren, constraint.object)

                if(otherChildren.length === 0) {

                    childrenMatchingComponent(constraintChildren, constraint.object).forEach((otherChild:SXIdentified) => {
                        positionConstraintChild(otherChild)
                    })

                    otherChildren = childrenMatchingComponent(resultChildren, constraint.object)

                    if(otherChildren.length === 0) {

                        throw new Error('Cannot find object of constraint: ' + constraint.object.uri + ' for subject ' + constraint.subject.uri)

                    }
                }

                if(constraint.restriction === Specifiers.SBOLX.SequenceConstraint.Precedes) {

                    for(var j:number = 0; j < resultChildren.length; ++ j) {

                        if(otherChildren.indexOf(resultChildren[j]) !== -1) {

                            resultChildren.splice(j, 0, child)
                            doneDepictions.add(child)

                            break

                        }
                    }


                }

            }
        }

        function reverse(orientation: Orientation): Orientation {

            return orientation === Orientation.Forward ?
                Orientation.Reverse :
                Orientation.Forward

        }


        //console.log('original children length ' + children.length)
        //console.log('result children length ' + resultChildren.length)

        return resultChildren


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
                return boundingBox

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

}


function reverse(orientation:Orientation):Orientation {

    return orientation === Orientation.Forward ?
                Orientation.Reverse :
                Orientation.Forward

}
