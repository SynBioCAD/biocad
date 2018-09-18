
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {

    if(boxSize.y > boxSize.x) {
        return {
            topBack: Vec2.fromXY(0, (boxSize.y - boxSize.x) / 2),
            bottomBack: Vec2.fromXY(0, boxSize.y - (boxSize.y - boxSize.x) / 2),
            point: Vec2.fromXY(boxSize.x, boxSize.y / 2.0),
        };
    }

    return {
        topBack: Vec2.fromXY((boxSize.x - boxSize.y) / 2, 0),
        bottomBack: Vec2.fromXY((boxSize.x - boxSize.y) / 2, boxSize.y),
        point: Vec2.fromXY(boxSize.x - (boxSize.x - boxSize.y) / 2, boxSize.y / 2.0),
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var path = [

        'M' + geom.topBack.toPathString(),
        'L' + geom.bottomBack.toPathString(),
        'L' + geom.point.toPathString(),
        'Z'

    ].join('');

    return svg('path', {
        d: path,
        'stroke': 'black',
        'fill': renderOpts.color || '#779ecb'
    })
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.5),

}


