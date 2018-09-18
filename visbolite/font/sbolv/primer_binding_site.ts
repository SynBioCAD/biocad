
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {

    return {
        bottomLeft: Vec2.fromXY(0.0, boxSize.y * 0.75),
        bottomRight: Vec2.fromXY(boxSize.x, boxSize.y * 0.75),
        top: Vec2.fromXY(boxSize.x * 0.6, boxSize.y * 0.4)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var path = [

        'M' + geom.bottomLeft.toPathString(),
        'L' + geom.bottomRight.toPathString(),
        'L' + geom.top.toPathString()

    ].join('');

    return svg('path', {
        d: path,
        'stroke': renderOpts.color || '#000000',
        'stroke-width': renderOpts.thickness || '5px',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'fill': 'none'
    })
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}


