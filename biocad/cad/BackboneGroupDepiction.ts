
import Depiction from "./Depiction";
import { VNode, svg } from 'jfw/vdom'
import RenderContext from "./RenderContext";
import Layout from "./Layout";
import { Vec2, LinearRangeSet } from 'jfw/geom'
import { BackboneGroup, Backbone } from "./ComponentDisplayList";
import BackboneDepiction from "./BackboneDepiction";

export default class BackboneGroupDepiction extends Depiction {

    static extensionLength:number = 3

    backboneLength:number

    locationsOfOmittedRegions:LinearRangeSet

    constructor(layout:Layout, parent?:Depiction, uid?:number) {

        super(layout, undefined, undefined, parent, uid)

    }

    render(renderContext:RenderContext):VNode {

        let offset = this.absoluteOffset

        let leftOrigin:Vec2 = Vec2.fromXY(offset.x + 1, offset.y)

        for(let backbone of this.children) {
            if(! (backbone instanceof BackboneDepiction)) {
                throw new Error('???')
            }
            if(backbone.backboneIndex === 0) {
                let bbStart = Vec2.fromXY(backbone.offset.x, backbone.offset.y + backbone.getAnchorY())
                leftOrigin = Vec2.fromXY(leftOrigin.x, offset.y + bbStart.y)
            }
        }

        let elements:VNode[] = []

        elements.push(svg('path', {
            d: [
                'M' + Vec2.fromXY(offset.x, leftOrigin.y).multiply(renderContext.layout.gridSize).toPathString(),
                'L' + Vec2.fromXY(offset.x, leftOrigin.y).add(Vec2.fromXY(this.size.x, 0)).multiply(renderContext.layout.gridSize).toPathString()
            ].join(''),
            stroke: 'black',
            fill: 'none',
            'stroke-width': '2px'
        }))


        for(let backbone of this.children) {
            if(! (backbone instanceof BackboneDepiction)) {
                throw new Error('???')
            }

            let bbStart = Vec2.fromXY(backbone.offset.x, backbone.offset.y + backbone.getAnchorY())

            if(backbone.backboneIndex === 0) {
                continue
            }

            let point = offset.add(bbStart)
            let end = point.add(Vec2.fromXY(backbone.size.x, 0))

            //let yDir = point.y > leftOrigin.y ? 1 : -1

            elements.push(
                svg('path', {
                    d: [
                        'M' + leftOrigin.multiply(renderContext.layout.gridSize).toPathString(),
                        'L' + point.multiply(renderContext.layout.gridSize).toPathString(),
                        'M' + end.multiply(renderContext.layout.gridSize).toPathString(),
                        'L' + Vec2.fromXY(end.x + 2, leftOrigin.y).multiply(renderContext.layout.gridSize).toPathString(),
                    ].join(''),
                    stroke: 'black',
                    fill: 'none',
                    'stroke-width': '2px',
                    'stroke-dasharray': '1, 2'
                })
            )

            elements.push(
                svg('path', {
                    d: [
                        'M' + point.multiply(renderContext.layout.gridSize).toPathString(),
                        'L' + end.multiply(renderContext.layout.gridSize).toPathString()
                    ].join(''),
                    stroke: 'black',
                    fill: 'none',
                    'stroke-width': '2px'
                })
            )

            this.locationsOfOmittedRegions.forEach((range) => {
                let from = offset.add(Vec2.fromXY(bbStart.x + range.start, bbStart.y)).multiply(renderContext.layout.gridSize)
                let to = offset.add(Vec2.fromXY(bbStart.x + range.end, bbStart.y)).multiply(renderContext.layout.gridSize)
                elements.push(svg('line', {
                    x1: from.x,
                    y1: from.y,
                    x2: to.x,
                    y2: to.y,
                    stroke: 'red',
                    'stroke-width': '3px',
                    fill: 'none'
                }))
            })
        }



        return svg('g', elements)
    }

    renderThumb(size:Vec2) {
        return svg('g')
    }

    closenessScoreToDisplayList(dlGroup: BackboneGroup) {

        let score = 0

        for(let dlBackbone of dlGroup.backbones.values()) {

            let backbone = this.closestBackboneToDisplayList(dlBackbone)

            if(!backbone) {
                continue
            }

            score += backbone.closenessScoreToDisplayList(dlBackbone)
        }

        return score
    }

    closestBackboneToDisplayList(dlBackbone:Backbone) {

        let bestScore = -1
        let bestBackbone:BackboneDepiction|null = null

        for(let child of this.children) {
            if(! (child instanceof BackboneDepiction)) {
                throw new Error('???')
            }
            let score = child.closenessScoreToDisplayList(dlBackbone)
            if(score > bestScore) {
                bestScore = score
                bestBackbone = child
            }
        }

        return bestBackbone
    }

    getBackboneForIndex(index:number):BackboneDepiction|null {

        for(let child of this.children) {
            if(child instanceof BackboneDepiction && child.backboneIndex === index) {
                return child
            }
        }

        return null
    }
}

