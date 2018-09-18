
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

    geom = extend(geom, {

        topLeftSpikeOrigin: geom.left.midPointTo(geom.top),
        topRightSpikeOrigin: geom.top.midPointTo(geom.right),
        bottomRightSpikeOrigin: geom.right.midPointTo(geom.bottom),
        bottomLeftSpikeOrigin: geom.bottom.midPointTo(geom.left),

    })


    return geom
}

function renderGlyph(renderOpts) {

    var geom:any = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.top.toPathString(),
        'L' + geom.right.toPathString(),
        'L' + geom.bottom.toPathString(),
        'L' + geom.left.toPathString(),
        'Z',


        'M' + geom.topLeftSpikeOrigin.toPathString(),
        'L' + geom.topLeft.toPathString(),
        'M' + geom.topRightSpikeOrigin.toPathString(),
        'L' + geom.topRight.toPathString(),
        'M' + geom.bottomRightSpikeOrigin.toPathString(),
        'L' + geom.bottomRight.toPathString(),
        'M' + geom.bottomLeftSpikeOrigin.toPathString(),
        'L' + geom.bottomLeft.toPathString(),

    ].join('');

    var letter = renderOpts.label

    return svg('g', [

        svg('path', {
            'd': path,
            'stroke': renderOpts.stroke || renderOpts.defaultColor || 'black',
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
    defaultLabel: 'N'
}


