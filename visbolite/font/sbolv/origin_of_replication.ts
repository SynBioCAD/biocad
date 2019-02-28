
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size) {

    var centerPoint = Vec2.fromXY(size.x / 2, size.y / 2);

    return {
        centerPoint: centerPoint,
        radius: Vec2.fromXY(size.x / 2, size.y /2)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    return svg('ellipse', {
        cx: geom.centerPoint.x,
        cy: geom.centerPoint.y,
        rx: geom.radius.x,
        ry: geom.radius.y,
        stroke: renderOpts.stroke || 'black',
        fill: renderOpts.color || 'blue'
    });
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    scale: Vec2.fromXY(0.4, 0.4)
}


