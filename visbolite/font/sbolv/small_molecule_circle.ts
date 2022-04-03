
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function renderGlyph(renderOpts) {

    return svg('circle', {
        r: renderOpts.size.x / 2,
        cx: renderOpts.size.x / 2, 
        cy: renderOpts.size.y / 2,
        'stroke': 'black',
        'fill': renderOpts.size.color || '#85C1E9',
        'stroke-width': renderOpts.size.thickness || '3px'
    })

}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}