
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function renderGlyph(renderOpts) {

    return svg('rect', {
        width: renderOpts.size.x,
        height: renderOpts.size.y,
        'stroke': 'black',
        'fill': renderOpts.color || '#cee'
    })
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.5),

}


