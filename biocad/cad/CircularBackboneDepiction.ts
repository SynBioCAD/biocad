

import LabelDepiction from 'biocad/cad/LabelDepiction';

import Depiction, { Opacity, Orientation }  from './Depiction'

import { VNode, svg } from 'jfw/vdom'

import { Matrix, Vec2 } from 'jfw/geom'

import {
    SXIdentified,
    SXSubComponent,
    SXComponent
} from 'sbolgraph'

import { Types } from 'bioterms'

import Layout from './Layout'

import visbolite from 'visbolite'

import parts, { shortNameFromTerm } from 'data/parts'

import RenderContext from './RenderContext'
import { SXRange, Watcher } from "sbolgraph";
import BackboneDepiction from 'biocad/cad/BackboneDepiction';

export default class CircularBackboneDepiction extends BackboneDepiction {

    orientation: Orientation
    location: SXIdentified|null

    constructor(layout:Layout, parent?:Depiction, uid?:number) {

        super(layout, parent, uid)

        this.orientation = Orientation.Forward
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


