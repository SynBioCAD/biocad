
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {

    var rightIndent = Vec2.fromXY(boxSize.x * 0.25, boxSize.y * 0.3)

    return {
        topLeft: Vec2.fromXY(0.0 + rightIndent.x , 0.0 + rightIndent.y),
        bottomLeft: Vec2.fromXY(0.0 + rightIndent.x, boxSize.y),
        bottomRight: Vec2.fromXY(boxSize.x - rightIndent.x, boxSize.y),
        topRight: Vec2.fromXY(boxSize.x - rightIndent.x, 0.0 + rightIndent.y)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var path = [

        'M' + geom.topLeft.toPathString(),
        'L' + geom.bottomLeft.toPathString(),
        'L' + geom.bottomRight.toPathString(),
        'L' + geom.topRight.toPathString()

    ].join('');

    var glyph = svg('path', {
        d: path,
        'stroke': renderOpts.color || renderOpts.defaultColor || '#000000',
        'stroke-width': renderOpts.thickness || '4px',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'fill': 'none'
    })

    return svg('g', [
        glyph
    ])
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}



