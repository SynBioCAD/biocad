
import { svg, VNode } from 'jfw/vdom'

import { Vec2, Matrix, LinearRange, Rect } from 'jfw/geom'

import SequenceEditorLine from './SequenceEditorLine'
import LinearRangeSet from "jfw/geom/LinearRangeSet";
import IdentifiedLinearRange from "biocad/mode/sequence/IdentifiedLinearRange";
import getNameFromRole from 'biocad/util/getNameFromRole'
import { SXSequenceFeature, SXRange, SXLocation, SXThingWithLocation, SXSubComponent } from "sbolgraph"
import LinearRangeTree, { LinearRangeTreeNode } from 'jfw/geom/LinearRangeTree';

export default function renderAnnotations(sequenceEditor) {

    const renderState = sequenceEditor.currentRenderState

    const {

        rangeColors,
        marginWidth,
        paddingTop,
        rings,
        charSize,
        charsPerRow,
        lineWidth,
        annotationHeight,
        annotatedRanges

    } = renderState

        
    const lines:Array<SequenceEditorLine> = renderState.lines

    const svgElements:VNode[] = []

    const labelsRendered = Object.create(null)
    const labelsPerLine = Object.create(null)

    var ySet:LinearRangeSet = new LinearRangeSet()


    renderState.annoLabelBBoxes = []


    const rangeTree:LinearRangeTree = LinearRangeTree.fromSet(annotatedRanges)



    for(let node of rangeTree.nodes) {

        renderNode(node, 0)

    }

    function renderNode(node:LinearRangeTreeNode, indent:number) {

        const _range:LinearRange = node.range

        if(! (_range instanceof IdentifiedLinearRange))
            throw new Error('???')

        const range:IdentifiedLinearRange = _range as IdentifiedLinearRange

        const line:SequenceEditorLine|null = renderState.elementOffsetToLine(range.start)

        if(line === null)
            return

        const shouldBeHereY = line.bbox.topLeft.y + charSize + renderState.paddingBetweenStrands + charSize + renderState.annotationOffset + annotationHeight / 2
        var goingHereY = shouldBeHereY

        while (ySet.intersectsRange(new LinearRange(goingHereY - 1, goingHereY + 31))) {
            goingHereY += 1 // TODO
        }

        ySet.push(new LinearRange(goingHereY, goingHereY + 30))

        if(!labelsRendered[range.thing.uri]) {

            //const curLabelsOnThisLine = labelsPerLine[line.seqOffset] || 0
                
            const goingHereX = line.bbox.bottomRight.x + 16 + (16 * indent)

            const bbox = Rect.fromPosAndSize(Vec2.fromXY(goingHereX, goingHereY), Vec2.fromXY(200, 30))

            renderState.annoLabelBBoxes.push([
                range.thing,
                bbox
            ])

            svgElements.push(svg('text', {
                x: goingHereX,
                y: goingHereY,
                stroke: 'none',
                'font-weight': 'bold',
                'font-family': 'sans-serif',
                'dominant-baseline': 'middle',
                fill: sequenceEditor.darkMode ? 'white' : 'black'

            }, [
                svg('tspan', {
                        fill: rangeColors[range.thing.uri],
                }, String.fromCharCode(0x25A0)),
                svg('tspan', ' ' + range.label + '')
            ]))

            if(renderState.annoHoverUris.has(range.thing.uri)) {

                svgElements.push(svg('rect', {
                    x: bbox.topLeft.x,
                    y: bbox.topLeft.y,
                    width: bbox.width(),
                    height: bbox.height(),
                    fill: 'red'
                }))

            }

            var roles:Array<string>|undefined

            if(range.thing instanceof SXSubComponent)
                roles = (range.thing as SXSubComponent).instanceOf.roles
            else if(range.thing instanceof SXSequenceFeature)
                roles = (range.thing as SXSequenceFeature).roles

            if(roles === undefined)
                throw new Error('???')

            svgElements.push(svg('text', {

                x: line.bbox.bottomRight.x + 16 + (16 * indent),
                y: goingHereY + 15,
                stroke: 'none',
                fill: sequenceEditor.darkMode ? 'white' : 'black',
                'font-weight': 'bold',
                'font-family': 'sans-serif',
                'dominant-baseline': 'middle',
                'font-size': '7pt'

            }, [
                [
                    renderState.rangeDescriptors.get(range.thing.uri) || '???',
                    roles.map(getNameFromRole).join(', ')
                ].filter((s) => s !== '').join('; ')
            ]))

            labelsRendered[range.thing.uri] = true

            labelsPerLine[line.seqOffset] =
                labelsPerLine[line.seqOffset] ?
                    labelsPerLine[line.seqOffset] + 1 : 1

            for(let subnode of node.children) {

                renderNode(subnode, indent + 1)

            }
        }
    }



    for(let line of lines) {

        for(var ringN:number = 0; ringN < line.annoRings.length; ++ ringN) {

            const ring:LinearRangeSet = line.annoRings[ringN]

            ring.forEach((_range:LinearRange) => {

                if(! (_range instanceof IdentifiedLinearRange))
                    throw new Error('???')

                const range:IdentifiedLinearRange = _range as IdentifiedLinearRange

                const seqRange:LinearRange = new LinearRange(line.seqOffset, line.seqOffset + renderState.charsPerRow)

                const intersection:LinearRange|null = range.intersection(seqRange)

                if(intersection !== null) {

                    const start:number = intersection.start - line.seqOffset
                    const end:number = intersection.end - line.seqOffset
    
                    const y:number = line.bbox.topLeft.y + renderState.charSize + renderState.paddingBetweenStrands + renderState.charSize + renderState.annotationOffset + (ringN * renderState.annotationHeight)

                    svgElements.push(svg('line', {
                        x1: line.bbox.topLeft.x + (start * renderState.charSize),
                        y1: y + annotationHeight / 2,
                        x2: line.bbox.topLeft.x + (end * renderState.charSize),
                        y2: y + annotationHeight / 2,
                        stroke: rangeColors[range.thing.uri],
                        'stroke-width': annotationHeight + 'px'
                    }))
                } else {
                    console.warn('intersection was null')
                    console.dir(range)
                    console.dir(seqRange)
                }

            })


        }

    }


    return svgElements

}
