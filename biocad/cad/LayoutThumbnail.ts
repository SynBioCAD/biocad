
import Depiction from 'biocad/cad/layout/Depiction';

import { View } from 'jfw/ui'
import { createGrid } from 'jfw/graphics'

import { h, svg, VNode } from 'jfw/vdom'

import { Types } from 'bioterms'
import Layout from "biocad/cad/layout/Layout";
import BiocadApp from "biocad/BiocadApp";
import Vec2 from "jfw/geom/Vec2";
import Rect from "jfw/geom/Rect";
import SVGDefs from "biocad/cad/SVGDefs";

import extend = require('xtend')

export default class LayoutThumbnail extends View {

    layout:Layout

    scrollOffset:Vec2
    scaleFactor:number
    interactive:boolean
    attr:any

    constructor(app:BiocadApp, layout:Layout) {

        super(app)

        this.layout = layout
        this.scrollOffset = Vec2.fromScalar(0)
        this.scaleFactor = 1.0
        this.interactive = false
        this.attr = {}

    }

    render():VNode {

        const svgElements:any[] = [
            SVGDefs.render()
        ]

        for(let depiction of this.layout.depictions) {

            if(depiction.isVisible()) {
                svgElements.push(depiction.render(this))
            }
        }

        let size:Vec2 = this.layout.getSize()

        size = size.multiply(this.layout.gridSize)

        return svg('svg.sf-circuit-view', extend({
            width: size.x + 'px',
            height: size.y + 'px',
        }, this.attr), svgElements)

    }

}


