
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size:Vec2) {

    var boxBottomLeft = Vec2.fromXY(0, size.y);

    return {
        boxBottomLeft: boxBottomLeft,
        boxBottomRight: Vec2.fromXY(size.x, size.y),
        boxTopRight: Vec2.fromXY(size.x, 0),
        boxTopLeft: Vec2.fromXY(0, 0)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.boxBottomLeft.toPathString(),
        'L' + geom.boxBottomRight.toPathString(),

        'C' + geom.boxTopRight.toPathString() + ' ' + geom.boxTopLeft.toPathString()
            + ' ' + geom.boxBottomLeft.toPathString(),

        'Z'

    ].join('');
 
    var fill = renderOpts.color || '#966FD6'

    if(renderOpts.fill === false)
        fill = 'none'

    return svg('path', {
        d: path,
        stroke: renderOpts.border ? 'black' : 'none',
        fill: fill
    });
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(0.6, 0.45)
}



