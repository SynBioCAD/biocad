import LabelDepiction from 'biocad/cad/LabelDepiction';

import Depiction, { Opacity, Orientation, Fade }  from './Depiction'

import { VNode, svg } from 'jfw/vdom'

import { Matrix, Vec2 } from 'jfw/geom'

import {
    SXIdentified,
    SXComponent,
    SXSubComponent
} from "sbolgraph"

import { Types } from 'bioterms'

import Layout from './Layout'

import visbolite from 'visbolite'

import parts, { shortNameFromTerm } from 'data/parts'

import RenderContext from './RenderContext'
import { SXRange, Watcher } from "sbolgraph";
import CircularBackboneDepiction from 'biocad/cad/CircularBackboneDepiction';
import BackboneDepiction from 'biocad/cad/BackboneDepiction';
import { LinearRange } from 'jfw/geom'

import extend = require('xtend')
import IdentifiedChain from '../IdentifiedChain';

export default class ComponentDepiction extends Depiction {

    orientation: Orientation
    range:LinearRange|undefined

    location: SXIdentified|null
    backbonePlacement:string

    constructor(layout:Layout, depictionOf:SXIdentified|undefined, identifiedChain:IdentifiedChain|undefined, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)

        this.orientation = Orientation.Forward
    }

    render(renderContext:RenderContext):VNode {

        if(CircularBackboneDepiction.ancestorOf(this)) {
            if(this.opacity === Opacity.Whitebox) {
                return this.renderCircularWhitebox(renderContext)
            } else {
                return this.renderCircularBlackbox(renderContext)
            }
        } else {
            if(this.opacity === Opacity.Whitebox) {
                return this.renderWhitebox(renderContext)
            } else {
                return this.renderBlackbox(renderContext)
            }
        }
    }

    private renderWhitebox(renderContext:RenderContext):VNode {

        const children:Array<Depiction> = this.children

        const offset = this.absoluteOffset.multiply(renderContext.layout.gridSize)
        const size = this.size.multiply(renderContext.layout.gridSize)

        const transform = Matrix.translation(offset)


        let attr = {}

        if(this.fade === Fade.Full) {
            attr['opacity'] = '0.2'
        } else if(this.fade === Fade.Partial) {
            attr['opacity'] = '0.5'
        }

        return svg('rect', extend(attr, {
            transform: transform.toSVGString(),
            width: size.x,
            height: size.y,
            fill: 'none',
            stroke: '#333',
            rx: '4px',
            ry: '4px',
            'stroke-width': '2px'
        }))

    }

    public getDefinition():SXComponent {

        const depictionOf:SXIdentified|undefined = this.depictionOf

        if(depictionOf === undefined)
            throw new Error('???')

        var definition
        
        if(depictionOf instanceof SXSubComponent) {
            definition = (depictionOf as SXSubComponent).instanceOf
        } else if(depictionOf instanceof SXSubComponent) {
            definition = (depictionOf as SXSubComponent).instanceOf
        } else if(depictionOf instanceof SXComponent) {
            definition = depictionOf as SXComponent
        } else {
            throw new Error('???')
        }

        return definition
    }

    private getGlyphType():string {

        const definition:SXComponent = this.getDefinition()

        const roles = definition.roles

        for(var i = 0; i < roles.length; ++ i) {

            const shortName = shortNameFromTerm(roles[i])

            if(shortName)
                return shortName
        }

        return 'user-defined'
    }

    private renderBlackbox(renderContext:RenderContext):VNode {

        const depictionOf:SXIdentified|undefined = this.depictionOf

        if(depictionOf === undefined)
            throw new Error('???')


        const orientation = this.orientation


        const definition:SXComponent = this.getDefinition()

        const type = this.getGlyphType()

        var offset = this.absoluteOffset.multiply(renderContext.layout.gridSize)
        const size = this.size.multiply(renderContext.layout.gridSize)

        const scale = this.scale
        const anchorY = this.getAnchorY() * renderContext.layout.gridSize.y

        const renderSize = size.multiply(scale)

        const anchorYScaled = renderSize.y * (anchorY / size.y)

        offset = offset.add(
            Vec2.fromXY(
                (size.x - renderSize.x) / 2,
                (size.y - renderSize.y) * (anchorY / size.y)
            )
        )

        var transform = Matrix.identity()
        
        transform = transform.multiply(Matrix.translation(offset))

        if(orientation === Orientation.Reverse) {
            transform = transform.rotate(180, Vec2.fromXY(renderSize.x * 0.5, renderSize.y * 0.5))
        }

             

        const attr = {
            transform: transform.toSVGString()
        }

        if(this.fade === Fade.Full) {
            attr['opacity'] = '0.2'
        } else if(this.fade === Fade.Partial) {
            attr['opacity'] = '0.5'
        }
        
        return svg('g', attr, [
            visbolite.render({
                type: type,
                size: renderSize
            })
        ])

    }


    get label():LabelDepiction|undefined {

        for(var i:number = 0; i < this.children.length; ++ i) {
            if(this.children[i] instanceof LabelDepiction) {
                return this.children[i] as LabelDepiction
            }
        }
    }



    private renderCircularBlackbox(renderContext:RenderContext):VNode {


        return visbolite.render({
            type: 'plasmid-annotation',
            startPoint: Vec2.fromXY(0, 0),
            endPoint: this.size
        })


    }

    private renderCircularWhitebox(renderContext:RenderContext):VNode {

        const children:Array<Depiction> = this.children

        const offset = this.absoluteOffset.multiply(renderContext.layout.gridSize)
        const size = this.size.multiply(renderContext.layout.gridSize)

        const transform = Matrix.translation(offset)

        return svg('rect', {
            transform: transform.toSVGString(),
            width: size.x,
            height: size.y,
            fill: 'none',
            stroke: '#333',
            rx: '4px',
            ry: '4px',
            'stroke-width': '2px'
        })

    }


    renderThumb(size:Vec2):VNode {

        const orientation = this.orientation

        const definition:SXComponent = this.getDefinition()

        const type = this.getGlyphType()


        return svg('g', [
            visbolite.render({
                color: 'white',
                stroke: 'none',
                type: type,
                size: size,
                autoApplyScale: true
            })
        ])
    }


    getAnchorY():number {

        // TODO: Best effort to align to a parent backbone, if exists.
        // If there are multiple BackboneDepiction children, only aligns to the first
        for(var i = 0; i < this.children.length; ++ i) {

            let child:Depiction = this.children[i]

            if(child instanceof BackboneDepiction) {
                return child.offset.y + child.getAnchorY()
            }

        }



        if(this.backbonePlacement === 'mid') {

           return this.size.y / 2

        } else if(this.backbonePlacement === 'top') {

            return this.size.y

        } else {

            return 0

        }
    }

    isSelectable():boolean {
        return false
    }
}


