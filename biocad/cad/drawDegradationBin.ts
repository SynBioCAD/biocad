
import { Rect, getEllipsePoint } from '@biocad/jfw/geom'
import { VNode, svg } from '@biocad/jfw/vdom'

export default function drawDegradationBin(rect:Rect, stroke:string, color:string):VNode {

    let c = rect.center()
    let r = rect.size().divideScalar(2)

    let start = getEllipsePoint(c, r, 0.875)
    let end = getEllipsePoint(c, r, 0.375)

    return svg('g', [
        svg('ellipse', {
            cx: c.x,
            cy: c.y,
            rx: r.x,
            ry: r.y,
            stroke: stroke,
            color: color,
            fill: 'none'
        }),
        svg('line', {
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
            stroke: stroke,
            color: color,
            fill: 'none'
        })

    ])


}