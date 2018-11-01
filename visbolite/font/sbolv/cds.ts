
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size) {
    
    var headWidth = size.y / 2.0;

    var headPoint = Vec2.fromXY(size.x, size.y / 2.0);

    return {
        boxStart: Vec2.fromXY(0, 0),
        boxTopRight: Vec2.fromXY(size.x - headWidth, 0),
        headPoint: headPoint,
        boxBottomRight: Vec2.fromXY(size.x - headWidth, size.y),
        boxBottomLeft: Vec2.fromXY(0, size.y)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.boxStart.toPathString(),
        'L' + geom.boxTopRight.toPathString(),
        'L' + geom.headPoint.toPathString(),
        'L' + geom.boxBottomRight.toPathString(),
        'L' + geom.boxBottomLeft.toPathString(),
        'Z'

    ].join('');
 
    var fill = renderOpts.color || '#779ECB'

    if(renderOpts.fill === false) {

        fill = 'none'

    } else {

        if(renderOpts.fill !== undefined)
            fill = renderOpts.fill
    }

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
    scale: Vec2.fromXY(1.0, 0.6),

}


