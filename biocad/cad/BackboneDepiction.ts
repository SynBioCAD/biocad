
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

export default class BackboneDepiction extends Depiction {

    static extensionLength:number = 3

    orientation: Orientation
    location: SXIdentified|null
    backboneY:number

    locationsOfOmittedRegions:LinearRangeSet

    constructor(layout:Layout, parent?:Depiction, uid?:number) {

        super(layout, undefined, undefined, parent, uid)

    }

    render(renderContext:RenderContext):VNode {

        let offset = this.absoluteOffset

        let leftOrigin:Vec2 = Vec2.fromXY(offset.x, offset.y + this.backboneY)

        let elements:VNode[] = []


        let drawSingleBackbone = (start:Vec2, startWithExtension:Vec2, end:Vec2) => {

            let drawSolidLine = (start:Vec2, end:Vec2) => {
                elements.push(
                    svg('path', {
                        d: [
                            'M' + start.multiply(renderContext.layout.gridSize).toPathString(),
                            'L' + end.multiply(renderContext.layout.gridSize).toPathString()
                        ].join(''),
                        stroke: 'black',
                        fill: 'none',
                        'stroke-width': '2px'
                    })
                )
            }

            let drawDottedLine = (start:Vec2, end:Vec2) => {
                elements.push(
                    svg('path', {
                        d: [
                            'M' + start.multiply(renderContext.layout.gridSize).toPathString(),
                            'L' + end.multiply(renderContext.layout.gridSize).toPathString()
                        ].join(''),
                        stroke: 'black',
                        fill: 'none',
                        'stroke-width': '2px',
                        'stroke-dasharray': '2 2'
                    })
                )
            }


            let omitted = this.locationsOfOmittedRegions.sort().ranges

            if(omitted.length === 0) {
                drawSolidLine(startWithExtension, end)
                return
            }


            let cur = startWithExtension

            for(let i = 0; i < omitted.length; ++ i) {
                let omittedStart = start.add(Vec2.fromXY(omitted[i].start, 0))
                drawSolidLine(cur, omittedStart)
                let omittedEnd = start.add(Vec2.fromXY(omitted[i].end, 0))
                drawDottedLine(omittedStart, omittedEnd)
                cur = omittedEnd
            }

            drawSolidLine(cur, end)
        }

        drawSingleBackbone(leftOrigin.add(Vec2.fromXY(BackboneDepiction.extensionLength, 0)), leftOrigin, Vec2.fromXY(leftOrigin.x + this.size.x, leftOrigin.y))

        return svg('g', elements)
    }

    isSelectable():boolean {

        return false

    }

    renderThumb(size:Vec2):VNode {

        return svg('g', [
        ])
    }

    getAnchorY():number {
        return this.backboneY
    }

}


