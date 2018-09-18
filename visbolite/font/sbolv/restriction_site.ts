
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size) {

    var stemBottom = Vec2.fromXY(size.x / 2.0, size.y);

    return {
        stemBottom: stemBottom,
        stemTop: Vec2.fromXY(size.x / 2.0, 0)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.stemBottom.toPathString(),
        'L' + geom.stemTop.toPathString()

    ].join('');

    return svg('path', {
        'd': path,
        'stroke': renderOpts.color || renderOpts.defaultColor || 'black',
        'stroke-width': renderOpts.thickness || '5px',
        'stroke-linejoin': 'round',
        'fill': 'none'
    });
}

export default {

    render: renderGlyph,
    backbonePlacement: 'mid',
    scale: Vec2.fromXY(1.0, 0.8)
}

