
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

        let leftOrigin:Vec2 = Vec2.fromXY(offset.x, offset.y)

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

            console.dir(omitted)

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

        drawSingleBackbone(leftOrigin.add(Vec2.fromXY(BackboneGroupDepiction.extensionLength, 0)), leftOrigin, Vec2.fromXY(leftOrigin.x + this.size.x, leftOrigin.y))

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

            drawSingleBackbone(point, point, end)
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

    isSelectable():boolean {

        return false

    }
}

