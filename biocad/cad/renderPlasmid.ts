
import { svg, h, VNode } from '@biocad/jfw/vdom'
import { Vec2, Matrix, LinearRange, LinearRangeSet } from '@biocad/jfw/geom'

import { getEllipsePoint } from '@biocad/jfw/geom';

class LinearRangeWithHeight extends LinearRange {

    height:number

}

export default function renderPlasmid(transform:Matrix, diameter:Vec2, numBp:number, name:string, annotations:any[]) {

    //console.log('render plasmid')

    const radius = diameter.multiplyScalar(0.5)

    const centerPoint = transform.transformVec2(radius)

    const ellipse = svg('ellipse', {

        cx: centerPoint.x,
        cy: centerPoint.y, 
        rx: radius.x,
        ry: radius.y,
        stroke: 'black',
        'stroke-width': 3,
        'fill': 'none'

    })
    
    const rings = [
        new LinearRangeSet()
    ]

    const glyphs:VNode[] = []


    /* longest annotations first (we start with the outer ring)
     */
    const sortedAnnotations = annotations.sort((a, b) => {

        const lenA = Math.abs(a.start - a.end)
        const lenB = Math.abs(b.start - b.end)

        return lenB - lenA

    })

    const ringPadding = 8 

    var n = 0

    for(let annotation of sortedAnnotations) {

        var ringN = 0

        var contractHeight = 0

        for(;;) {

            var ring = rings[ringN]

            var intersectingRanges = ring.intersectingRangesWithRange(annotation)

            if(intersectingRanges.length === 0)
                break

            var maxHeight = Number.MIN_VALUE

            for(let _range of intersectingRanges) {

                const range:LinearRangeWithHeight = _range as LinearRangeWithHeight

                if(range.height > maxHeight)
                    maxHeight = range.height

            }

            contractHeight += maxHeight * 0.5 + ringPadding

            ++ ringN

            if(rings[ringN] === undefined)
                rings[ringN] = new LinearRangeSet()

        }

        rings[ringN].push(annotation)



        const contractedRadius = radius.subtractScalar(contractHeight)

        const normalizedStart = annotation.start / numBp
        const normalizedEnd = annotation.end / numBp

        var startPoint = getEllipsePoint(centerPoint, contractedRadius, normalizedStart)
        var endPoint = getEllipsePoint(centerPoint, contractedRadius, normalizedEnd)

        // glyphs.push(visbolite.render({

        //     uri: annotation.uri,

        //     type: annotation.type,

        //     plasmidMetrics: {

        //         centerPoint: centerPoint,
        //         radius: contractedRadius,

        //     },

        //     normalizedStart: normalizedStart,
        //     normalizedEnd: normalizedEnd,

        //     startPoint: startPoint,
        //     endPoint: endPoint,

        //     height: annotation.height,

        //     /*
        //     attr: {

        //         title: 'moo',
        //         /className: 'hint--top',
        //         dataset: {
        //             hint: 'moo'
        //         }

        //     }*/
        // }))


        if(annotation.label) {

            //const labelOffset = 15

            //const labelRingRadius = Vec2.add(contractedRadius, labelOffset)

            //startPoint = getEllipsePoint(centerPoint, labelRingRadius, normalizedStart)
            //endPoint = getEllipsePoint(centerPoint, labelRingRadius, normalizedEnd)

            // glyphs.push(visboli.render({

            //     uri: annotation.uri,

            //     type: 'plasmid-annotation-label',

            //     plasmidMetrics: {

            //         centerPoint: centerPoint,
            //         radius: contractedRadius,

            //     },

            //     normalizedStart: normalizedStart,
            //     normalizedEnd: normalizedEnd,

            //     startPoint: startPoint,
            //     endPoint: endPoint,

            //     height: annotation.height,

            //     label: annotation.label
            // }))

        }

    }


    const label = svg('text', {

        transform: Matrix.translation(centerPoint).toSVGString(),

        'text-anchor': 'middle',
        'alignment-baseline': 'middle',
        'dominant-baseline': 'text-before-edge',
        'pointer-events': 'none',

        'font-size': '16pt',

    }, name + ' (' + numBp + ' bp)')

    return svg('g', [

        ellipse,
        label

    ].concat(glyphs))

}



