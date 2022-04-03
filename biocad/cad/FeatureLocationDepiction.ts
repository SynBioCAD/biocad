
import Depiction, { Opacity, Orientation }  from './Depiction'
import LocationableDepiction from './LocationableDepiction'

import { VNode, svg } from '@biocad/jfw/vdom'

import { Matrix, Vec2 } from '@biocad/jfw/geom'

import {
    S3Identified,
    S3SequenceFeature
} from "sbolgraph"


import Layout from './Layout'

import visbolite from 'visbolite'

import parts, { shortNameFromTerm } from 'data/parts'

import RenderContext from './RenderContext'
import CircularBackboneDepiction from 'biocad/cad/CircularBackboneDepiction';
import IdentifiedChain from '../IdentifiedChain';

export default class FeatureLocationDepiction extends LocationableDepiction {

    constructor(layout:Layout, depictionOf:S3Identified|undefined, identifiedChain:IdentifiedChain|undefined, parent?:Depiction, uid?:number) {

        super(layout, depictionOf, identifiedChain, parent, uid)

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

        if(! (this.depictionOf instanceof S3SequenceFeature))
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
                size: size
            })
        ])

    }

    renderThumb(size:Vec2):VNode {
        return svg('g', [])
    }
}


