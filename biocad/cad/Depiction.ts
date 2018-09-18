
import { VNode } from 'jfw/vdom'

import { Vec2 } from 'jfw/geom'
import Layout from 'biocad/cad/Layout'
import { SXIdentified } from "sbolgraph"
import Rect from "jfw/geom/Rect";
import Versioned from "jfw/Versioned";
import RenderContext from './RenderContext'
import CircularBackboneDepiction from './CircularBackboneDepiction'
import IdentifiedChain from '../IdentifiedChain';

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
    size: Vec2 = new Vec2(0, 0)

    sizeExplicit:boolean
    offsetExplicit:boolean

    uid:number
    stamp:number

    opacity: Opacity
    isExpandable: boolean = true

    fade:Fade

    scale: Vec2 = Vec2.fromXY(1.0, 1.0)

    parent: Depiction|null
    children: Array<Depiction>

    _depictionOf:SXIdentified|undefined
    identifiedChain:IdentifiedChain|undefined

    constructor(layout:Layout, depictionOf:SXIdentified|undefined, identifiedChain:IdentifiedChain|undefined, parent?:Depiction, uid?:number) {

        super()

        this.uid = uid !== undefined ? uid : nextUID()
        this.stamp = Layout.nextStamp

        this.layout = layout
        this.opacity = Opacity.Whitebox
        this.parent = parent ? parent : null
        this.children = []
        this._depictionOf = depictionOf
        this.offsetExplicit = false
        this.sizeExplicit = false
        this.identifiedChain = identifiedChain
    }


    get depictionOf():SXIdentified|undefined {

        let dOf = this._depictionOf

        if(dOf)
            return dOf

        if(this.parent)
            return this.parent.depictionOf

        return undefined
    }

    set depictionOf(dOf:SXIdentified|undefined) {

        this._depictionOf = dOf

    }

    getVersionedParent():Versioned|undefined {
        return this.parent ? this.parent : this.layout
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

    calcDepth():number {

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


    touchRecursive():void {

        this.touch()

        this.children.forEach((child:Depiction) => {

            child.touchRecursive()

        })

    }


    addChild(child:Depiction) {
        
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

    isDescendentOf(d:Depiction) {

        for(let p:any = this; p; p = p.parent) {
            if(p === d) {
                return true
            }
        }

        return false
    }

    get debugName() {

        let s = this.constructor.name

        if(this.depictionOf)
            s +=  ':' + this.depictionOf.displayName + ''

        s += '#' + this.uid

        if(this.parent)
            s += ' <child of: ' + this.parent.debugName + '> '

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

}

