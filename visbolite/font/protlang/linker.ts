
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size) {

    var mid = size.y / 2

    return {
        lineStart: Vec2.fromXY(0, mid),
        lineEnd: Vec2.fromXY(size.x, mid),
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.lineStart.toPathString(),
        'L' + geom.lineEnd.toPathString(),
        'Z'

    ].join('');
 
    var fill = renderOpts.color || renderOpts.defaultColor || 'black'

    return svg('path', {
        d: path,
        stroke: fill,
        'stroke-dasharray': '1,2',
        fill: 'none'
    });
}

export default {

    render: renderGlyph,
    backbonePlacement: 'mid',
    isContainer: true,

    interruptsBackbone: true,

    scale: Vec2.fromXY(1.0, 1.0)
    
}


