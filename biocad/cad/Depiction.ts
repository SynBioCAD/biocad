
import { VNode } from 'jfw/vdom'

import { Vec2 } from 'jfw/geom'
import Layout from 'biocad/cad/Layout'
import { S3Identified, Watcher, S3Location, S3SubComponent } from "sbolgraph"
import Rect from "jfw/geom/Rect";
import Versioned from "jfw/Versioned";
import RenderContext from './RenderContext'
import CircularBackboneDepiction from './CircularBackboneDepiction'
import IdentifiedChain from '../IdentifiedChain';
import LabelDepiction from './LabelDepiction';
import { sbol3 } from 'sbolgraph'

export enum Opacity {
    Blackbox,
    Whitebox
}

export enum Fade {
    Full,
    Partial,
    None
}

export enum Orientation {
    Forward,
    Reverse
}

var lastUID = 0

function nextUID() {

    return ++ lastUID

}

export default abstract class Depiction extends Versioned {

    layout:Layout

    offset: Vec2 = new Vec2(0, 0)
    offsetExplicit:boolean

    size: Vec2 = new Vec2(0, 0)
    minSize:Vec2 = new Vec2(0, 0)


    uid:number
    stamp:number

    opacity: Opacity

    isExpandable: boolean = true

    fade:Fade

    parent: Depiction|null
    children: Array<Depiction>

    _depictionOf:S3Identified|undefined
    identifiedChain:IdentifiedChain|undefined

    label:LabelDepiction|null

    //graphWatcher:Watcher|undefined

    constructor(layout:Layout, depictionOf:S3Identified|undefined, identifiedChain:IdentifiedChain|undefined, parent?:Depiction, uid?:number) {

        super()

        this.uid = uid !== undefined ? uid : nextUID()
        this.stamp = Layout.nextStamp

        this.layout = layout
        this.opacity = Opacity.Whitebox
        this.parent = parent ? parent : null
        this.children = []
        this.depictionOf = depictionOf
        this.offsetExplicit = false
        this.identifiedChain = identifiedChain
        this.label = null
    }

    cleanup() {
        /*
        if(this.graphWatcher) {
            this.graphWatcher.unwatch()
            this.graphWatcher = undefined
        }*/
    }

    get depictionOf():S3Identified|undefined {

        let dOf = this._depictionOf

        if(dOf)
            return dOf

        if(this.parent)
            return this.parent.depictionOf

        return undefined
    }

    set depictionOf(dOf:S3Identified|undefined) {

        this._depictionOf = dOf

        /*
        if(dOf) {
            if(this.graphWatcher) {
                this.graphWatcher.unwatch()
            }
            this.graphWatcher = dOf.graph.watchSubject(dOf.uri, () => {
                this.touch()
            })
        }*/
    }

    getVersionedParent():Versioned|undefined {
        console.log('gvp')
        return this.parent ? this.parent : this.layout
    }

    getVersionedChildren():Versioned[] {
        return this.children as Versioned[]
    }

    onVersionChanged() {
    }

    abstract render(renderContext:RenderContext):VNode

    abstract renderThumb(size:Vec2):VNode

    getAnchorY():number {
        return 0
    }

    isSelectable():boolean {

        return true

    }

    isResizeable():boolean {
        return true
    }

    isVisible():boolean {

        if(!this.parent)
            return true

        if(this.parent.opacity === Opacity.Blackbox)
            return false

        return this.parent.isVisible()
    }

    get absoluteOffset():Vec2 {

        const parent:Depiction|null = this.parent

        if(parent) {
            return parent.absoluteOffset.add(this.offset)
        } else {
            return this.offset
        }

    }

    set absoluteOffset(offset:Vec2) {

        const parent:Depiction|null = this.parent

        //console.log('setass')

        if(parent) {
            let relativeOffset = offset.subtract(parent.absoluteOffset)
            this.offset = relativeOffset
        } else {
            this.offset = offset
        }

    }

    getOffsetRelativeTo(ancestor:Depiction|null) {

        if(ancestor === null) {
            return this.absoluteOffset
        }

        let offset = this.offset

        for(let p = this.parent; p !== ancestor; p = p.parent) {
            if(!p) {
                throw new Error('offsetRelativeTo ran out of parents before it found the ancestor')
            }
            offset = offset.add(p.offset)
        }

        return offset
    }

    calcDepth():number {

        ///console.log('calcDepth ' + this.uid + ' ' + this.constructor.name + ' ' + (this.depictionOf ? this.depictionOf.uri : '?'))

        if(this.children.length === 0)
            return 1

        return Math.max.apply(Math, this.children.map((depiction) => {

            return depiction.calcDepth()

        })) + 1
    }


    get boundingBox():Rect {
        return new Rect(this.offset, this.offset.add(this.size))
    }

    get absoluteBoundingBox():Rect {
        const absOffset:Vec2 = this.absoluteOffset
        return new Rect(absOffset, absOffset.add(this.size))
    }

    getBoundingBoxRelativeTo(ancestor:Depiction|null) {
        let offset = this.getOffsetRelativeTo(ancestor)
        return new Rect(offset, offset.add(this.size))
    }

    get boundingBoxWithLabel():Rect {
        let r = this.boundingBox
        if(this.label) {
            r = r.surround(this.label.boundingBox)
        }
        return r
    }

    get absoluteBoundingBoxWithLabel():Rect {
        let r = this.absoluteBoundingBox
        if(this.label) {
            r = r.surround(this.label.absoluteBoundingBox)
        }
        return r
    }

    getBoundingBoxWithLabelRelativeTo(ancestor:Depiction|null) {
        if(ancestor === null) {
            return this.absoluteBoundingBoxWithLabel
        }
        let r = this.getBoundingBoxRelativeTo(ancestor)
        if(this.label) {
            r = r.surround(this.label.getBoundingBoxRelativeTo(ancestor))
        }
        return r
    }

    get width():number {
        return this.size.x
    }

    get height():number {
        return this.size.y
    }

    toggleOpacity():void {

        this.opacity = this.opacity === Opacity.Blackbox ? Opacity.Whitebox : Opacity.Blackbox

        this.touch()
    }

    addChild(child:Depiction) {

        for(let p:Depiction|null = this; p; p = p.parent) {
            if(p === child) {
                throw new Error('addChild: ' + child.debugName + ' is an ancestor of ' + this.debugName)
            }
        }
        
        for(var i = 0; i < this.children.length; ++ i) {
            if(this.children[i] === child) {
                return
            }
        }

        this.children.push(child)
        child.parent = this

    }

    removeChild(child:Depiction) {

        for(var i = 0; i < this.children.length; ++ i) {

            if(this.children[i] === child) {

                this.children.splice(i, 1)
                break

            }

        }

        child.parent = null

    }

    zeroifyOrigin() {

        let min = Vec2.fromXY(0, 0)

        for(let child of this.children) {
            min = min.min(child.offset)
        }

        for(let child of this.children) {
            child.offset = child.offset.subtract(min)
        }

        return min
    }

    isDescendentOf(d:Depiction) {

        for(let p:any = this; p; p = p.parent) {
            if(p === d) {
                return true
            }
        }

        return false
    }

    isSiblingOf(d:Depiction) {

        if(d !== this && d.parent === this.parent)
            return true

        return false
    }

    getOverlappingSiblings():Depiction[] {

        if(!this.parent)
            return []

        let s:Depiction[] = []

        for(let child of this.parent.children) {
            if(child === this)
                continue
            if(child.boundingBox.intersects(this.boundingBox)) {
                s.push(child)
            }
        }

        return s
    }

    hasOverlappingSiblings():boolean {

        if(!this.parent)
            return false

        for(let child of this.parent.children) {
            if(child === this)
                continue
            if(child.boundingBox.intersects(this.boundingBox)) {
                return true
            }
        }

        return false
    }

    get debugName() {
        return this.safeGetDebugName(0)
    }

    private safeGetDebugName(recursionDepth:number)  {

        if(recursionDepth > 5) {
            return '<recursed too deep>'
        }

        let s = this.constructor.name

        if(this.depictionOf)
            s +=  ':' + this.depictionOf.displayName + ''

        s += '#' + this.uid

        if(this.parent) {
            s += ' <child of: ' + this.parent.safeGetDebugName(recursionDepth + 1) + '> '
        }

        if(!s)
            s = '<depiction>'

        return s

    }


    setFade(fade:Fade) {

        this.fade = fade

        for(let child of this.children) {
            child.setFade(fade)
        }

    }

    // delete along with associated sbol
    hardDelete() {

        let dOf = this.depictionOf

        if (!dOf)
            return

        if(dOf instanceof S3SubComponent) {

            let def = dOf.instanceOf

            if(def) {

                let instantiations = sbol3(dOf.graph).getInstancesOfComponent(def)

                if(instantiations.length === 1) {
                    def.destroy()
                }
            }
        }

        dOf.destroy()
    }



}

