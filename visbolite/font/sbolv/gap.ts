
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size) {

    return {
        width: size.x,
        height: size.y
    }
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    return svg('rect', {
        stroke: 'none',
        fill: 'none',
        width: geom.width,
        height: geom.height
    });
}

export default {

    render: renderGlyph,
    backbonePlacement: 'mid',
    scale: Vec2.fromXY(1.0, 1.0)
    
}


