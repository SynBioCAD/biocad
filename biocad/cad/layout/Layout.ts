import { Versioned }  from '@biocad/jfw/util';

import Depiction, { Opacity, Orientation } from './Depiction'

import {
    Graph,
    S3Component,
    S3SubComponent,
    S3SequenceFeature,
    S3Range,
    sbol3,
    S3Feature
} from "sboljs"

import DetailPreset from '../detail-preset/DetailPreset'
import levelToPreset from '../detail-preset/levelToPreset'

import ComponentDepiction from './ComponentDepiction'
import BackboneDepiction from './BackboneDepiction'

import { Specifiers } from 'bioterms'

import { Vec2, Rect, LinearRange } from '@biocad/jfw/geom'

import configurateLayout from './configurator/configurate'
import LabelDepiction from "biocad/cad/layout/LabelDepiction";
import LayoutPOD from "biocad/cad/layout/LayoutPOD";
import FeatureLocationDepiction from "biocad/cad/layout/FeatureLocationDepiction";

import assert = require('assert')
import { Watcher, S3Identified, S3Constraint, S3Location, S3OrientedLocation, S3Interaction } from "sboljs"
import InteractionDepiction from './InteractionDepiction'
import Instruction from 'biocad/cad/layout-instruction/Instruction';
import InstructionSet from 'biocad/cad/layout-instruction/InstructionSet';
import IdentifiedChain from '../../IdentifiedChain';
import WhitelistInstruction from '../layout-instruction/WhitelistInstruction';
import S3ComponentReference from 'sboljs/dist/sbol3/S3ComponentReference';
import syncDepictions from './sync/syncDepictions';


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

    graph:Graph
    graphWatcher:Watcher|null
    detailLevel:number

    bpToGridScale:number
    minGlyphWidth:number

    constructor(graph:Graph) {

        super()

        this.graph = graph

        this.depictions = new Array<Depiction>()
        this.uriToDepictions = new Map<string, Depiction[]>()
        this.identifiedChainToDepiction = new Map<string, Depiction>()
        this.uidToDepiction = new Map<number, Depiction>()
        this.gridSize = Vec2.fromXY(16, 16)

        this.bpToGridScale = 0.02
        this.minGlyphWidth = 2

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

    detachFromParent(depiction:Depiction) {

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

    attachToParent(depiction:Depiction, parent:Depiction) {

        if(depiction.isDescendentOf(parent)) {
            if(! (depiction.parent === parent)) {

                // setting parent to a former grandparent
                // adjust offset to include former intermediates (i.e. a no longer needed BackboneDepiction)

                for(let p = depiction.parent; p && p !== parent; p = p.parent) {
                    depiction.offset = depiction.offset.add(p.offset)
                }


            }
        }

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

    removeDepiction(depiction:Depiction) {

        let removedDepiction = false

        for(var i = 0; i < this.depictions.length; ++ i) {

            if(this.depictions[i] === depiction) {

                this.depictions.splice(i, 1)
                removedDepiction = true
                break

            }

        }

        if(!removedDepiction) {
            throw new Error('I tried to remove a depiction but it wasn\'t there')
        }

        let parent = depiction.parent

        for(let child of depiction.children) {
            child.offset = child.offset.add(depiction.offset)
            if (parent) {
                this.attachToParent(child, parent)
            } else {
                child.parent = null
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

    cloneWithNewGraph(newGraph:Graph):Layout {

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
         * So,
         * skip any where the version is different from the
         * layout version.
         */

        console.log('layout: version changed...')

        const instructions:InstructionSet = new InstructionSet([])

        // ideally would just sync the one that changed, but never mind
        //
        this.syncAllDepictions(5)

        let toConfigurateUIDs:Set<number> = new Set<number>()
        
        for(let depiction of this.depictions) {
            toConfigurateUIDs.add(depiction.uid)
        }

        this.configurate([
            new WhitelistInstruction(toConfigurateUIDs)
        ])

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

    syncDepictions(detailLevel: number, URIs: string[]): void {
	syncDepictions(this, detailLevel, URIs)
    }

    syncAllDepictions(detailLevel:number): void {

        let graph:Graph = this.graph
        let rootComponents:Array<S3Component> = sbol3(graph).rootComponents

	console.log('syncAllDepictions: rootComponents are ' + rootComponents.map(c => c.uri).join(','))

        this.syncDepictions(detailLevel, rootComponents.map((c) => c.uri))
    }


//     startWatchingGraph(updateContext:App) {
//     startWatchingGraph(updateContext:App) {

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


    configurate(instructions:Array<Instruction>) {

        console.log('Layout::configurate')

        configurateLayout(this, new InstructionSet(instructions))

    }


    createInteractionDepiction(preset:DetailPreset, interaction:S3Interaction, chain:IdentifiedChain, parent:ComponentDepiction) {

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

            let d = this.depictions[i]

            let bbox = d.absoluteBoundingBox

            if(d instanceof LabelDepiction)
                d = d.labelFor

            if((bSelectableOnly === false || d.isSelectable()) && d.isVisible() && bbox.intersectsPoint(pos))
                return d

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
