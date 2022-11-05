import { S3Identified, S3Component, S3SubComponent, S3Location, S3SequenceFeature } from "sboljs";

import Layout from 'biocad/cad/layout/Layout';

import { VNode } from '@biocad/jfw/vdom';

import Depiction, { Opacity, Orientation, Fade } from 'biocad/cad/layout/Depiction';

import { Matrix, Vec2, Line } from '@biocad/jfw/geom'

import { svg } from '@biocad/jfw/vdom'

import ComponentDepiction from 'biocad/cad/layout/ComponentDepiction';

import { Specifiers } from 'bioterms'

import extend = require('xtend')

import RenderContext from '../RenderContext'

import CircularBackboneDepiction from 'biocad/cad/layout/CircularBackboneDepiction';
import Glyph from "biocad/glyph/Glyph";

export default class LabelDepiction extends Depiction {

    attr:any

    labelFor:Depiction

    constructor(layout:Layout, labelFor:Depiction, parent?:Depiction, uid?:number) {

        super(layout, undefined, undefined, parent, uid);

        this.labelFor = labelFor
        labelFor.label = this

        this.attr = {
            'font-family': 'sans-serif',
            'font-size': (layout.gridSize.x * 0.6) + 'pt'
        }
    }

    isVisible():boolean {
        return this.labelFor.isVisible()
    }

    render(renderContext:RenderContext):VNode {

        const labelFor:Depiction = this.labelFor

        if(labelFor && CircularBackboneDepiction.ancestorOf(labelFor)) {
            return this.renderCircular(renderContext)
        }

        return this.renderLinear(renderContext)
    }

    private renderCircular(renderContext:RenderContext):VNode {

        const layout:Layout = this.layout

        const labelFor:Depiction = this.labelFor
        const depictionOf:S3Identified|undefined = labelFor.depictionOf

        if(depictionOf === undefined)
            throw new Error('???')

        const outmostCircular:Depiction|null = CircularBackboneDepiction.ancestorOf(this)

        if(!outmostCircular) {
            throw new Error('no outmost circular?')
        }

        const centerPoint:Vec2 = outmostCircular.size.multiply(renderContext.layout.gridSize).multiplyScalar(0.5)
        const radius:Vec2 = outmostCircular.size.multiply(renderContext.layout.gridSize).multiplyScalar(0.5)

        var transform:Matrix = Matrix.identity()
        transform = transform.translate(this.absoluteOffset.multiply(renderContext.layout.gridSize))

        if(!this.parent) {
            throw new Error('?????')
        }

        return svg('g', {
            transform: transform.toSVGString()
        }, [
            Glyph.render(
                 'plasmid-annotation-label'
                , {

                uri: depictionOf.uri,
                plasmidMetrics: {
                    centerPoint: centerPoint,
                    radius: radius,
                },

                startPoint: Vec2.fromXY(0, 0),
                endPoint: this.parent.size.multiply(renderContext.layout.gridSize),

                height: 30,

                label: depictionOf.displayName
            })
        ])

    }

    private renderLinear(renderContext:RenderContext):VNode {

        const layout:Layout = this.layout

        /*
        const labelFor:Depiction = this.parent

        const svgAttr = this.attr


        var offset
        
        var cDepiction

        if(labelFor instanceof ComponentDepiction) {

            cDepiction = labelFor as ComponentDepiction

            if(cDepiction.depictionOf.hasRole(Specifiers.SBOL2.Role.CDS)) {
                svgAttr['font-style'] = 'italic'
            }

            offset =
                cDepiction.orientation === Specifiers.Visual.Reverse ?
                    labelFor.absoluteInnerOffset.add(Vec2.fromXY(0, labelFor.innerSize.y)).multiply(renderContext.layout.gridSize) :
                    labelFor.absoluteOffset.multiply(renderContext.layout.gridSize)

        } else {

            offset = labelFor.absoluteOffset.multiply(renderContext.layout.gridSize)

        }*/

        const labelFor:Depiction = this.labelFor
        const depictionOf:S3Identified|undefined = labelFor.depictionOf

        const svgAttr = this.attr

        var cDepiction

        if(labelFor instanceof ComponentDepiction) {

            cDepiction = labelFor as ComponentDepiction

        }

        var pointer

        if(renderContext.interactive && labelFor.isExpandable) {

            if(labelFor.opacity === Opacity.Blackbox) {

                if(cDepiction && cDepiction.orientation === Orientation.Reverse) {
                    //text = String.fromCharCode(0x25c0) + ' ' + text
                    pointer = String.fromCharCode(0x25C2) // <
                } else {
                    pointer = String.fromCharCode(0x25B8) // >
                }

            } else {

                if(cDepiction && cDepiction.orientation === Orientation.Reverse) {
                    pointer = String.fromCharCode(0x25B4) // ^
                } else {
                    pointer = String.fromCharCode(0x25BE) // v
                }

            }

        }


        if(labelFor.depictionOf === undefined)
            throw new Error('???')

        const transform = Matrix.translation(this.absoluteOffset.multiply(this.layout.gridSize))

        let dOf = labelFor.depictionOf

        let name = dOf.displayName

        let italic = false

        if(dOf.getBoolProperty('http://biocad.io/terms/untitled') === true) {
            name = 'Untitled part'
            italic = true
        }

        let roles:string[] = []

        if(dOf instanceof S3Component) {
            roles = dOf.soTerms
        } else if(dOf instanceof S3SubComponent) {
            let def = dOf.instanceOf
            roles = def.soTerms
        } else if(dOf instanceof S3SequenceFeature) {
            roles = dOf.soTerms
        } else if(dOf instanceof S3Location) {
            let container = dOf.containingObject
            if(container instanceof S3SequenceFeature) {
                roles = container.soTerms
            }
            if(container instanceof S3SubComponent) {
                let def = container.instanceOf
                roles = def.soTerms
            }
        }

        if(roles.indexOf('SO:0000316') !== -1) {
            italic = true
        }

        if(this.fade === Fade.Full) {
            svgAttr['opacity'] = '0.2'
        } else if(this.fade === Fade.Partial) {
            svgAttr['opacity'] = '0.5'
        }

        let svgText = svg('text', extend(svgAttr, {

            transform: transform.toSVGString(),
            'text-anchor': 'start',
            'alignment-baseline': 'start',
            'dominant-baseline': 'text-before-edge',
            'pointer-events': 'visible',
            'font-style': italic ? 'italic' : 'normal'

        }), [
            svg('tspan', {
                class: 'sf-glyph-expand-icon'
            }, [
                pointer
            ]),
            ' ',
            name
        ])

        let direction = this.boundingBox.center().direction(this.labelFor.boundingBox.center())

        let from = this.boundingBox.edgePointForDirectionVector(direction)
        let to = this.labelFor.boundingBox.edgePointForDirectionVector(Vec2.fromScalar(0.0).subtract(direction))

        let distance = from.distanceTo(to)

        if(false && distance > 2) {
            /*

            let parent = this.parent

            if(!parent) {
                throw new Error('???')
            }

            console.log('dir from to', direction, from, to)

            let line = new Line(from, to)

            let a = parent.absoluteOffset.add(line.a).multiply(this.layout.gridSize)
            let b = parent.absoluteOffset.add(line.b).multiply(this.layout.gridSize)

            let svgArrow = svg('path', {
                d: [
                    'M' + a.toPathString(),
                    'L' + b.toPathString()
                ].join(''),
                stroke: 'black',
                'stroke-width': '1px'
            })

            return svg('g', [
                svgText,
                svgArrow
            ])*/

            return svg('g', [])

        } else {

            return svgText

        }

    }

    renderThumb(size:Vec2):VNode {
        return svg('g', [])
    }

    isSelectable():boolean {
        return false
    }
}


