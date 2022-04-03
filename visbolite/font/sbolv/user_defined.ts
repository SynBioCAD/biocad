
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(size) {

    return {
    }
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    let size = renderOpts.size

    return svg('path', {
        stroke: renderOpts.color || '#779ECB',
        'stroke-width': size.y,
        'stroke-dasharray': '2 2',
        fill: 'none',
        d: [
            'M' + Vec2.fromXY(0, size.y / 2).toPathString(),
            'L' + Vec2.fromXY(size.x, size.y / 2).toPathString()
        ].join(''),
    });
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.2)
    
}


