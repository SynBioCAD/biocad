
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

import extend = require('xtend')

function createGeometry(size) {

    var centerPoint = Vec2.fromXY(size.x / 2, size.y / 2);

    return {
        centerPoint: centerPoint,
        radius: Vec2.fromXY(size.x / 2, size.y / 2)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    return svg('ellipse', {
        cx: geom.centerPoint.x,
        cy: geom.centerPoint.y,
        rx: geom.radius.x,
        ry: geom.radius.y,
        stroke: renderOpts.defaultColor || 'black',
        'stroke-width': 3,
        fill: renderOpts.color || 'none'
    });
}

export default {

    render: renderGlyph,
    backbonePlacement: 'mid',
    scale: Vec2.fromXY(0.5, 0.5),
    interruptsBackbone: true,
    resizable: false,
}


