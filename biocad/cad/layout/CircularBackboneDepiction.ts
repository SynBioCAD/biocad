

import LabelDepiction from 'biocad/cad/layout/LabelDepiction';

import Depiction, { Opacity, Orientation }  from './Depiction'

import { VNode, svg } from 'jfw/vdom'

import { Matrix, Vec2 } from 'jfw/geom'

import {
    S3Identified,
    S3SubComponent,
    S3Component
} from 'sbolgraph'

import { Types } from 'bioterms'

import Layout from './Layout'

import parts, { shortNameFromTerm } from 'data/parts'

import RenderContext from '../RenderContext'
import { S3Range, Watcher } from "sbolgraph";
import BackboneDepiction from 'biocad/cad/layout/BackboneDepiction';

export default class CircularBackboneDepiction extends BackboneDepiction {

    orientation: Orientation
    location: S3Identified|null

    constructor(layout:Layout, parent?:Depiction, uid?:number) {

        super(layout, parent, uid)

    }

    render(renderContext:RenderContext):VNode {

        const centerPoint:Vec2 = this.boundingBox.center().multiply(renderContext.layout.gridSize)
        const radius:Vec2 = centerPoint.subtract(this.offset.multiply(renderContext.layout.gridSize))

        const ellipse = svg('ellipse', {

            cx: centerPoint.x,
            cy: centerPoint.y, 
            rx: radius.x,
            ry: radius.y,
            stroke: 'black',
            'stroke-width': 3,
            'fill': 'none'

        })

        return ellipse



    }

    static ancestorOf(d:Depiction):CircularBackboneDepiction|null {

        for(;;) {

            if(d instanceof CircularBackboneDepiction)
                return d


            var p = d.parent

            if(!p)
                return null

            d = p
        }
    }

}


