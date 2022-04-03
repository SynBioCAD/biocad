
import { Vec2, Line } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

export enum ArrowheadType {
    None,
    Fork,
    FilledTriangle,
    UnfilledTriangle,
    Line,
    Diamond
}


const arrowheadHeight = 7
const arrowheadWidth = 10

export default function drawArrow(waypoints:Vec2[], head:ArrowheadType, color:string, thickness:string) {

    if(waypoints.length < 2) {
        throw new Error('need at least 2 waypoints')
    }

    const d:string[] = []

    d.push('M' + waypoints[0].toPathString())

    for(let i:number = 1; i < waypoints.length; ++ i) {
        d.push('L' + waypoints[i].toPathString())
    }


    let finalPoint = waypoints[waypoints.length - 1]
    let prevPoint = waypoints[waypoints.length - 2]

    let line = new Line(prevPoint, finalPoint)

    let lineDirection = line.getDirectionVector()
    let invLineDirection = Vec2.fromScalar(0).subtract(lineDirection)

    let arrowheadOrigin = line.b.add(invLineDirection.multiplyScalar(arrowheadHeight))

    let forkEndTop = arrowheadOrigin.add(
        invLineDirection.rightPerpendicular.multiplyScalar(arrowheadWidth * 0.5)
    )

    let forkEndBottom = arrowheadOrigin.add(
        invLineDirection.leftPerpendicular.multiplyScalar(arrowheadWidth * 0.5)
    )

    let diamondTop = arrowheadOrigin.add(
        invLineDirection.multiplyScalar(arrowheadHeight)
    )

    switch(head) {
        case ArrowheadType.None:
            return svg('path', {
                d: d.join(''),
                'stroke': color,
                'stroke-width': thickness,
                'fill': 'none'
            })

        case ArrowheadType.Fork:

            d.push('M' + finalPoint.toPathString())
            d.push('L' + forkEndTop.toPathString())
            d.push('M' + finalPoint.toPathString())
            d.push('L' + forkEndBottom.toPathString())

            return svg('path', {
                d: d.join(''),
                'stroke': color,
                'stroke-width': thickness,
                'fill': 'none'
            })

        case ArrowheadType.Line:

            let headLineStart = finalPoint.add(
                invLineDirection.rightPerpendicular.multiplyScalar(arrowheadWidth * 0.5)
            )
            let headLineEnd = finalPoint.add(
                invLineDirection.leftPerpendicular.multiplyScalar(arrowheadWidth * 0.5)
            )
            d.push('M' + headLineStart.toPathString())
            d.push('L' + headLineEnd.toPathString())

            return svg('path', {
                d: d.join(''),
                'stroke': color,
                'stroke-width': thickness,
                'fill': 'none'
            })

        case ArrowheadType.FilledTriangle:

            return svg('g', [
                svg('path', {
                    d: d.join(''),
                    'stroke': color,
                    'stroke-width': thickness,
                    'fill': 'none'
                }),
                svg('path', {
                    d: 'M' + finalPoint.toPathString() +
                        'L' + forkEndTop.toPathString() +
                        'L' + forkEndBottom.toPathString() +
                        'Z',
                    'fill': color
                })
            ])

        case ArrowheadType.Diamond:

            return svg('g', [
                svg('path', {
                    d: d.join(''),
                    'stroke': color,
                    'stroke-width': thickness,
                    'fill': 'none'
                }),
                svg('path', {
                    d: 'M' + finalPoint.toPathString() +
                        'L' + forkEndTop.toPathString() +
                        'L' + diamondTop.toPathString() +
                        'L' + forkEndBottom.toPathString() +
                        'Z',
                    'fill': color
                })
            ])

        default:
            throw new Error('unknown arrowhead type')
    }

}
