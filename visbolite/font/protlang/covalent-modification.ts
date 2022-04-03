
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(size) {

    var centerPoint = Vec2.fromXY(size.x / 2, size.y / 2);

    return {
        centerPoint: centerPoint,
        radius: Vec2.fromXY(size.x / 2, size.y / 2)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var letter = renderOpts.label

    return svg('g', [
       
        svg('ellipse', {
            cx: geom.centerPoint.x,
            cy: geom.centerPoint.y,
            rx: geom.radius.x,
            ry: geom.radius.y,
            stroke: renderOpts.defaultColor || 'black',
            'stroke-width': 3,
            fill: renderOpts.color || 'none'
        }),

        svg('text', {
            x: geom.centerPoint.x,
            y: geom.centerPoint.y,
            'alignment-baseline': 'central',
            'dominant-baseline': 'middle',
            'text-anchor': 'middle',
            'font-family': 'Helvetica',
            'font-size': '12pt',
            fill: renderOpts.color || renderOpts.defaultColor || 'black'
        }, letter)

    ])

}

export default {

    render: renderGlyph,
    backbonePlacement: 'mid',
    scale: Vec2.fromXY(0.5, 0.5),
    interruptsBackbone: true,
    resizable: false,
    hasLabel: true,
    defaultLabel: 'I'
}


