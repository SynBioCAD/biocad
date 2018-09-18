
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

import extend = require('xtend')

function createGeometry(size) {

    var geom = {
        top: Vec2.fromXY(size.x * 0.5, 0),
        right: Vec2.fromXY(size.x, size.y * 0.5),
        bottom: Vec2.fromXY(size.x * 0.5, size.y),
        left: Vec2.fromXY(0, size.y * 0.5),
        topLeft: Vec2.fromXY(0, 0),
        topRight: Vec2.fromXY(size.x, 0),
        bottomRight: Vec2.fromXY(size.x, size.y),
        bottomLeft: Vec2.fromXY(0, size.y),
        mid: Vec2.fromXY(size.x * 0.5, size.y * 0.5)
    }



    return geom
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.mid.toPathString(),
        'L' + geom.right.toPathString(),
        'L' + geom.mid.toPathString(),
        'L' + geom.left.toPathString(),
        'Z',

        'M' + geom.bottom.toPathString(),
        'L' + geom.top.toPathString(),
        'Z',

        'M' + geom.mid.toPathString(),
        'L' + geom.topLeft.toPathString(),
        'M' + geom.mid.toPathString(),
        'L' + geom.topRight.toPathString(),
        'M' + geom.mid.toPathString(),
        'L' + geom.bottomRight.toPathString(),
        'M' + geom.mid.toPathString(),
        'L' + geom.bottomLeft.toPathString(),

    ].join('');

    var letter = renderOpts.proteinLetter || 'N'

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
    scale: Vec2.fromXY(0.5, 0.5),
    interruptsBackbone: true,
    resizable: false,
}


