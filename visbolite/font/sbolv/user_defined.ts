
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

    var fill = renderOpts.color || 'blue'

    if(renderOpts.fill === false) {

        fill = 'none'

    } else {

        if(renderOpts.fill !== undefined)
            fill = renderOpts.fill
    }

    return svg('rect', {
        stroke: renderOpts.border ? 'black' : 'none',
        fill: fill,
        width: geom.width,
        height: geom.height
    });
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.5)
    
}


