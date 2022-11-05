
import LabelDepiction from './LabelDepiction';

import Depiction, { Opacity, Orientation, Fade }  from './Depiction'

import { VNode, svg } from '@biocad/jfw/vdom'

import { Matrix, Vec2 } from '@biocad/jfw/geom'

import {
    S3Identified,
    S3Component,
    S3SubComponent
} from "sboljs"

import Layout from './Layout'

import { shortNameFromTerm } from 'data/parts'
import RenderContext from '../RenderContext'
import CircularBackboneDepiction from 'biocad/cad/layout/CircularBackboneDepiction';
import BackboneDepiction from 'biocad/cad/layout/BackboneDepiction';

import extend = require('xtend')
import IdentifiedChain from '../../IdentifiedChain';

import LocationableDepiction from './LocationableDepiction'
import Glyph from 'biocad/glyph/Glyph';
import colors from '../../../data/colors';

export default class ComponentDepiction extends LocationableDepiction {

    constructor(layout:Layout, depictionOf:S3Identified|undefined, identifiedChain:IdentifiedChain|undefined, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)

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

    getAnchorY():number {

	if(this.opacity === Opacity.Blackbox
		&& !CircularBackboneDepiction.ancestorOf(this)
	)
	{
		let gt = this.getGlyphType()
		let glyph = Glyph.getGlyph(gt)
		if(glyph) {
			return glyph.getAscent({
				color: 'white',
				lineColor: 'white',
				backgroundFill: 'none',
				thickness: 2,
				width: this.size.x,
				height: this.size.y,
				params: {}
			})
		}
	}

	return super.getAnchorY()
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

    public getDefinition():S3Component {

        const depictionOf:S3Identified|undefined = this.depictionOf

        if(depictionOf === undefined)
            throw new Error('???')

        var definition
        
        if(depictionOf instanceof S3SubComponent) {
            definition = (depictionOf as S3SubComponent).instanceOf
        } else if(depictionOf instanceof S3SubComponent) {
            definition = (depictionOf as S3SubComponent).instanceOf
        } else if(depictionOf instanceof S3Component) {
            definition = depictionOf as S3Component
        } else {
            throw new Error('???')
        }

        return definition
    }

    private getGlyphType():string {

        const definition:S3Component = this.getDefinition()

        const roles = definition.roles

        for(var i = 0; i < roles.length; ++ i) {

            const shortName = shortNameFromTerm(roles[i])

            if(shortName !== 'Unspecified')
                return shortName
        }

        return 'Unspecified'
    }

    private renderBlackbox(renderContext:RenderContext):VNode {

        const depictionOf:S3Identified|undefined = this.depictionOf

        if(depictionOf === undefined)
            throw new Error('???')


        const orientation = this.orientation

        const type = this.getGlyphType()

        var offset = this.absoluteOffset.multiply(renderContext.layout.gridSize)
        const size = this.size.multiply(renderContext.layout.gridSize)

        var transform = Matrix.identity()
        
        transform = transform.multiply(Matrix.translation(offset))

        if(orientation === Orientation.Reverse) {
            transform = transform.rotate(180, Vec2.fromXY(size.x * 0.5, size.y * 0.5))
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
            Glyph.render(type, {
		color: colors[type] || 'black',
		lineColor: 'black',
		backgroundFill: 'none',
                thickness: 2,
		width: size.x,
		height: size.y,
		params: {}
            })
        ])

    }


    private renderCircularBlackbox(renderContext:RenderContext):VNode {


        return Glyph.render('plasmid-annotation', {
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

        const definition:S3Component = this.getDefinition()

        const type = this.getGlyphType()


        return svg('g', [
            Glyph.render(type, {
		color: colors[type] || 'white',
		lineColor: 'white',
		backgroundFill: 'none',
                thickness: 2,
		width: size.x,
		height: size.y,
		params: {}
            })
        ])
    }


    isSelectable():boolean {
        return true
    }

    getConstrainedSiblings():Depiction[] {

        let dOf = this.depictionOf

        if(!dOf) 
            return []

        let s:Depiction[] = []

        if(dOf instanceof S3SubComponent) {
            let constrainedSCs =
                dOf.getConstraintsWithThisSubject().map((c) => c.constraintObject)
                    .concat(
                        dOf.getConstraintsWithThisObject().map((c) => c.constraintSubject)
                    )

            for(let sc of constrainedSCs) {

                let depictions = this.layout.getDepictionsForUri(sc.uri)

                let siblingDepictions = depictions.filter((d) => {
                    return d.parent === this.parent
                })

                s = s.concat(siblingDepictions)
            }
        }

        return s
    }
}


