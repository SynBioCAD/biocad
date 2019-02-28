
import LabelDepiction from 'biocad/cad/LabelDepiction';

import Depiction, { Opacity, Orientation }  from './Depiction'

import { VNode, svg } from 'jfw/vdom'

import { Matrix, Vec2 } from 'jfw/geom'

import {
    SXIdentified,
    SXSequenceFeature
} from "sbolgraph"

import { Types } from 'bioterms'

import Layout from './Layout'

import visbolite from 'visbolite'

import parts, { shortNameFromTerm } from 'data/parts'

import RenderContext from './RenderContext'
import { SXRange, SXLocation } from "sbolgraph"
import CircularBackboneDepiction from 'biocad/cad/CircularBackboneDepiction';
import IdentifiedChain from '../IdentifiedChain';
import { LinearRange } from 'jfw/geom'

export default class FeatureLocationDepiction extends Depiction {

    orientation: Orientation
    range: LinearRange
    location: SXIdentified|null
    backbonePlacement:string

    constructor(layout:Layout, depictionOf:SXIdentified|undefined, identifiedChain:IdentifiedChain|undefined, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)

        this.orientation = Orientation.Forward

    }

    render(renderContext:RenderContext):VNode {

        if(CircularBackboneDepiction.ancestorOf(this)) {
            return this.renderCircular(renderContext)
        } else {
            return this.renderLinear(renderContext)
        }

    }

    private renderCircular(renderContext:RenderContext):VNode {

        var transform = Matrix.identity()
        
        var offset = this.absoluteOffset.multiply(renderContext.layout.gridSize)

        transform = transform.multiply(Matrix.translation(offset))

        if(!this.parent)
            throw new Error('need parent')

        return svg('g', {
            transform: transform.toSVGString()
        }, [
            visbolite.render({
                type: 'plasmid-annotation',
                startPoint: Vec2.fromXY(0, 0),
                endPoint: this.size.multiply(renderContext.layout.gridSize),
                plasmidMetrics: {
                    radius: this.parent.size.multiply(renderContext.layout.gridSize).multiplyScalar(0.5)
                },
                height: 30
            })
        ])

    }

    private renderLinear(renderContext:RenderContext):VNode {

        var type = 'user-defined'

        if(! (this.depictionOf instanceof SXSequenceFeature))
            throw new Error('???')

        const orientation = this.orientation

        const roles = this.depictionOf.roles

        for(let role of roles) {

            const shortName = shortNameFromTerm(role)

            if(shortName)
                type = shortName
        }

        var offset = this.absoluteOffset.multiply(renderContext.layout.gridSize)
        const size = this.size.multiply(renderContext.layout.gridSize)

        const anchorY = this.getAnchorY() * renderContext.layout.gridSize.y

        const anchorYScaled = size.y * (anchorY / size.y)

        offset = offset.add(
            Vec2.fromXY(
                (size.x - size.x) / 2,
                (size.y - size.y) * (anchorY / size.y)
            )
        )

        var transform = Matrix.identity()
        
        transform = transform.multiply(Matrix.translation(offset))

        if(orientation === Orientation.Reverse) {
            transform = transform.rotate(180, Vec2.fromXY(size.x * 0.5, size.y * 0.5))
        }

             

        
        return svg('g', {
            transform: transform.toSVGString()
        }, [
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

    renderThumb(size:Vec2):VNode {
        return svg('g', [])
    }

    getAnchorY():number {

        if(this.backbonePlacement === 'mid') {

           return this.size.y / 2

        } else if(this.backbonePlacement === 'top') {

            return this.size.y

        } else {

            return 0

        }
    }
}


