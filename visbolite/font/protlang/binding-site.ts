
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size) {

    return {
        topLeft: Vec2.fromXY(0, 0),
        topRight: Vec2.fromXY(size.x, 0),
        bottomRight: Vec2.fromXY(size.x, size.y),
        bottomLeft: Vec2.fromXY(0, size.y),
        mid: Vec2.fromXY(size.x * 0.5, size.y * 0.5)
    }
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.topLeft.toPathString(),
        'L' + geom.bottomLeft.toPathString(),
        'L' + geom.bottomRight.toPathString(),
        'L' + geom.topRight.toPathString()

    ].join('');

    var letter = renderOpts.label.toLowerCase()

    return svg('g', [

        svg('path', {
            'd': path,
            'stroke': renderOpts.defaultColor || 'black',
            'stroke-width': renderOpts.thickness || '3px',
            'stroke-linejoin': 'round',
            'fill': renderOpts.color || 'none'
        }),

        svg('text', {
            x: geom.mid.x,
            y: geom.mid.y,
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
    isContainer: true,
    scale: Vec2.fromXY(0.5, 0.5),
    interruptsBackbone: true,
    resizable: false,
    hasLabel: true,
    defaultLabel: 'B'
}



