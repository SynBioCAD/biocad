
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize) {

    var headWidth = boxSize.y / 2.0;

    return {
        boxStart: Vec2.fromXY(0, 0),
        boxTopRight: Vec2.fromXY(boxSize.x - headWidth, 0),
        headPoint: Vec2.fromXY(boxSize.x, boxSize.y / 2.0),
        boxBottomRight: Vec2.fromXY(boxSize.x - headWidth, boxSize.y),
        boxBottomLeft: Vec2.fromXY(0, boxSize.y)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var path = [

        'M' + geom.boxStart.toPathString(),
        'L' + geom.boxTopRight.toPathString(),
        'L' + geom.headPoint.toPathString(),
        'L' + geom.boxBottomRight.toPathString(),
        'L' + geom.boxBottomLeft.toPathString(),
        'Z'

    ].join('');

    var glyphMatrix = Matrix.identity()

    //glyphMatrix = glyphMatrix.translate(Vec2(boxSize.x, 0))
    glyphMatrix = glyphMatrix.multiply(Matrix.rotation(-135, Vec2.fromXY(renderOpts.size.x / 2, renderOpts.size.y / 2)))
    //glyphMatrix = glyphMatrix.translate(Vec2.fromXY(0, - renderOpts.size.y))


    var glyph = svg('path', {
        d: path,
        'stroke': 'black',
        'fill': 'pink',
        transform: glyphMatrix.toSVGString()
    })

    return glyph
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(0.8, 0.8),

}