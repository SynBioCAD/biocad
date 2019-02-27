
import LabelDepiction from 'biocad/cad/LabelDepiction';

import Depiction, { Opacity, Orientation, Fade }  from './Depiction'

import { VNode, svg } from 'jfw/vdom'

import { Matrix, Vec2, LinearRangeSet } from 'jfw/geom'

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

import extend = require('xtend')
import IdentifiedChain from '../IdentifiedChain';
import { Backbone, BackboneChild } from './ComponentDisplayList';

export default class BackboneDepiction extends Depiction {

    orientation: Orientation
    location: SXIdentified|null
    backboneY:number

    backboneIndex:number

    constructor(layout:Layout, backboneIndex:number, parent?:Depiction, uid?:number) {

        super(layout, undefined, undefined, parent, uid)

        this.orientation = Orientation.Forward
        this.backboneIndex = backboneIndex
    }

    render(renderContext:RenderContext):VNode {

        /*
        const offset = this.absoluteOffset.multiply(renderContext.layout.gridSize)
        const size = this.size.multiply(renderContext.layout.gridSize)

        //const anchorY = this.anchorY * circuitView.gridSize
        //offset -= Vec2.fromXY(offset.x, offset.y - anchorY)


        const anchorY = this.getAnchorY() * renderContext.layout.gridSize.y


        const transform = Matrix.translation(offset)


        var svgAttr = {}

        if(this.fade === Fade.Full) {
            svgAttr['opacity'] = '0.2'
        } else if(this.fade === Fade.Partial) {
            svgAttr['opacity'] = '0.5'
        }

        return svg('g', extend(svgAttr, {
            transform: transform.toSVGString()
        }), [
            svg('line', {
                x1: 0,
                y1: anchorY,
                x2: size.x,
                y2: anchorY,
                stroke: 'black',
                'stroke-width': '2px'
            })
        ])*/

        return svg('g', [])

    }

    isSelectable():boolean {

        return false

    }






    get label():LabelDepiction|undefined {

        return undefined

    }


    renderThumb(size:Vec2):VNode {

        return svg('g', [
        ])
    }

    getAnchorY():number {
        return this.backboneY
    }

    closenessScoreToDisplayList(dlBackbone:Backbone) {

        let score = 0

        for(let dlChild of dlBackbone.children) {
            if(! (dlChild instanceof BackboneChild)) {
                continue
            }
            for(let child of this.children) {
                let dOf = child.depictionOf
                if(dOf && dlChild.object.uri === dOf.uri) {
                    ++ score
                }
            }
        }

        return score
    }

}


