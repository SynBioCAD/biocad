
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize) {

    return {
        outerBoxBottomLeft: Vec2.fromXY(0, 0),
        outerBoxBottomRight: Vec2.fromXY(boxSize.x, 0),
        outerBoxTopLeft: Vec2.fromXY(0, boxSize.y),
        outerBoxTopRight: Vec2.fromXY(boxSize.x, boxSize.y),

        innerBoxBottomLeft: Vec2.fromXY(boxSize.x/4, boxSize.y/4),
        innerBoxBottomRight: Vec2.fromXY((3 * boxSize.x)/4, boxSize.y/4),
        innerBoxTopLeft: Vec2.fromXY(boxSize.x/4, (3 * boxSize.y)/4),
        innerBoxTopRight: Vec2.fromXY((3 * boxSize.x)/4, (3 * boxSize.y)/4)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var path = [

        'M' + geom.outerBoxBottomLeft.toPathString(),
        'L' + geom.outerBoxBottomRight.toPathString(),
        'L' + geom.outerBoxTopRight.toPathString(),
        'L' + geom.outerBoxTopLeft.toPathString(),
        'L' + geom.outerBoxBottomLeft.toPathString(),
        'L' + geom.outerBoxBottomRight.toPathString(),

        'M' + geom.innerBoxBottomLeft.toPathString(),
        'L' + geom.innerBoxBottomRight.toPathString(),
        'L' + geom.innerBoxTopRight.toPathString(),
        'L' + geom.innerBoxTopLeft.toPathString(),
        'L' + geom.innerBoxBottomLeft.toPathString(),
        'L' + geom.innerBoxBottomRight.toPathString(),

        'Z'

    ].join('');

    return svg('path', {
        d: path,
        'stroke': renderOpts.color || '#ff7f00',
        'stroke-width': renderOpts.thickness || '5px',
        'stroke-linejoin': 'round',
        'fill': 'none'
    })
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.6),

}