
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize) {

    return {
        topLeft: Vec2.fromXY(0, boxSize.y * 0.75),
        topRight: Vec2.fromXY(boxSize.x, boxSize.y * 0.75),
        bottomLeft: Vec2.fromXY(0, boxSize.y * 0.25),
        bottomRight: Vec2.fromXY(boxSize.x, boxSize.y * 0.25)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var path = [

        'M' + geom.topLeft.toPathString(),
        'L' + geom.topRight.toPathString(),

        'M' + geom.bottomLeft.toPathString(),
        'L' + geom.bottomRight.toPathString()

    ].join('');

    var glyph = svg('path', {
        d: path,
        'stroke': renderOpts.color || '#000000',
        'stroke-width': renderOpts.thickness || '5px',
        'stroke-linecap': 'round',
        'fill': 'none'
    })

	var hideDNA = svg('rect', {
        width: renderOpts.size.x,
        height: renderOpts.size.y,
        'fill': '#ffffff'
    })

    var group = svg('g', [
        hideDNA,
        glyph
    ])

    return group
}

export default {
    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: false,
    scale: Vec2.fromXY(1.0, 0.9),
}




