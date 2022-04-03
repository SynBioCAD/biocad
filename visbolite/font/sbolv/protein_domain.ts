
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize) {

    var arrowheadLength = 15

    return {
        lineStart: Vec2.fromXY(0, boxSize.y * 0.5),
        lineEnd: Vec2.fromXY(boxSize.x - arrowheadLength, boxSize.y * 0.5),
        arrowheadTop: Vec2.fromXY(boxSize.x - arrowheadLength, 0),
        arrowheadRight: Vec2.fromXY(boxSize.x, boxSize.y * 0.5),
        arrowheadBottom: Vec2.fromXY(boxSize.x - arrowheadLength, boxSize.y),
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var linePath = [

        'M' + geom.lineStart.toPathString(),
        'L' + geom.lineEnd.toPathString()

    ].join('');

    var line = svg('path', {
        d: linePath,
        'stroke': 'black',
        'stroke-width': '10',
        'stroke-dasharray': '5, 5',
        'fill': 'none'
    })

    var arrowheadPath = [

        'M' + geom.arrowheadTop.toPathString(),
        'L' + geom.arrowheadRight.toPathString(),
        'L' + geom.arrowheadBottom.toPathString(),
        'Z'

    ].join('');

    var arrowhead = svg('path', {
        d: arrowheadPath,
        'stroke': 'black',
        'stroke-width': '1',
        'fill': 'black'
    })

    return svg('g', [
        line,
        arrowhead
    ])
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.6),

}


