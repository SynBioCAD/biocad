
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize) {

	var sizeScale = 0.4;
	var offsetX = (boxSize.x / 2.0) - ((boxSize.x / 2.0) * sizeScale);
    return {
        stemBottom: Vec2.fromXY(boxSize.x / 2.0, boxSize.y),
        stemTop: Vec2.fromXY(boxSize.x / 2.0, boxSize.y * -0.4),

		circleSize: boxSize.x * sizeScale,
		circleOffsetX: (boxSize.x / 2.0) - ((boxSize.x / 2.0) * sizeScale),
		circleOffsetY: (-boxSize.y * sizeScale) * 1.5
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var path = [

        'M' + geom.stemBottom.toPathString(),
        'L' + geom.stemTop.toPathString()

    ].join('');

    var glyph = svg('path', {
        d: path,
        'stroke': renderOpts.color || '#000',
        'stroke-width': renderOpts.thickness || '4px',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'fill': 'none'
    })

	var circle = svg('circle', {
        r: geom.circleSize / 2,
        cx: geom.circleOffsetX,
        cy: geom.circleOffsetY,
        'fill': renderOpts.color || '#00f',
        'stroke': '#000',
        'stroke-width': renderOpts.thickness || '4px'
    })

    return svg('g', [
        glyph,
        circle
    ])
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.6),

}
