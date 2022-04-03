
import { Rect, Vec2 } from "jfw/geom";
import { svg, VNode } from "jfw/vdom";
import { drag as dragEvent } from '@biocad/jfw/event'

export default function renderHandles(rect:Rect, bHover:boolean, bResizeable:boolean, callback:(pos:Vec2, dimensions:string[]) => void, color ?:string) {

    const center = rect.center()

    let handles:VNode[] = []

    if(bResizeable) {
        handles.push(
            renderHandle(rect.topLeft, 'nw-resize', ['north', 'west']),
            renderHandle(rect.bottomRight, 'se-resize', ['south', 'east']),
            renderHandle(Vec2.fromXY(rect.topLeft.x, rect.bottomRight.y), 'sw-resize', ['south', 'west']),
            renderHandle(Vec2.fromXY(rect.bottomRight.x, rect.topLeft.y), 'ne-resize', ['north', 'east']),
            renderHandle(Vec2.fromXY(center.x, rect.topLeft.y), 'n-resize', ['north']),
            renderHandle(Vec2.fromXY(rect.topLeft.x, center.y), 'w-resize', ['west']),
            renderHandle(Vec2.fromXY(center.x, rect.bottomRight.y), 's-resize', ['south']),
            renderHandle(Vec2.fromXY(rect.bottomRight.x, center.y), 'e-resize', ['east'])
        )
    }

    return svg('g', [
        svg('rect', {
            x: rect.topLeft.x,
            y: rect.topLeft.y,
            width: rect.width(),
            height: rect.height(),
            fill: 'none',
            stroke: color || '#AAF',
            'stroke-width': '1px',
            'stroke-dasharray': bHover ? '2, 2' : ''
        })
    ].concat(handles))

    function renderHandle(pos, cursor, dimensions) {

        return svg('g', [
            svg('circle', {
                cx: pos.x,
                cy: pos.y,
                fill: color || '#AAF',
                r: 3
            }),
            svg('circle', {
                cx: pos.x,
                cy: pos.y,
                fill: 'none',
                'pointer-events': 'visible',
                r: 6,
                'ev-mousedown': dragEvent(dragHandle, { dimensions: dimensions, callback: callback }),
                style: {
                    cursor: cursor
                }
            })
        ])

    }

}

function dragHandle(data) {

    const dimensions:string[] = data.dimensions

    data.callback(Vec2.fromXY(data.x, data.y), dimensions)

}

