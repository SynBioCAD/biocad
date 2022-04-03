
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function renderGlyph(renderOpts) {

    var glyph = svg('text', {
        'stroke': 'black',
        'stroke-width': renderOpts.thickness || '0.5px',
        'fill': 'black',
        'font-size': '22px'
    }, 'AAA')

    return glyph
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.5),

}





