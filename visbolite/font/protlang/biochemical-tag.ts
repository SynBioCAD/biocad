
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

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

    geom = extend(geom, {

    })


    return geom
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.top.toPathString(),
        'L' + geom.right.toPathString(),
        'L' + geom.bottom.toPathString(),
        'L' + geom.left.toPathString(),
        'Z',

    ].join('');

    var letter = renderOpts.label

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
    scale: Vec2.fromXY(0.5, 0.5),
    interruptsBackbone: true,
    resizable: false,
    hasLabel: true,
    defaultLabel: 'H'
}


