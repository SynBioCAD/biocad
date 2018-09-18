
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size) {

    return {
        topLeft: Vec2.fromXY(0, 0),
        topRight: Vec2.fromXY(size.x, 0),
        bottomRight: Vec2.fromXY(size.x, size.y),
        bottomLeft: Vec2.fromXY(0, size.y),
        mid: Vec2.fromXY(size.x * 0.5, size.y * 0.5),
        midLeft: Vec2.fromXY(0, size.y * 0.5),
        midRight: Vec2.fromXY(size.x, size.y * 0.5)
    }
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.midLeft.toPathString(),
        'L' + geom.bottomLeft.toPathString(),
        'L' + geom.topRight.toPathString(),
        'L' + geom.midRight.toPathString(),

    ].join('');

    return svg('g', [

        svg('path', {
            'd': path,
            'stroke': renderOpts.color || renderOpts.defaultColor || 'black',
            'stroke-width': renderOpts.thickness || '3px',
            'stroke-linejoin': 'round',
            'fill': 'none'
        }),

    ])
}

export default {

    render: renderGlyph,
    backbonePlacement: 'mid',
    isContainer: true,
    scale: Vec2.fromXY(0.5, 0.5),
    interruptsBackbone: true,
    resizable: false,
    hasLabel: false,
}
