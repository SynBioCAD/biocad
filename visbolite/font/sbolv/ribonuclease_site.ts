
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {

	var leftScale = 0.3;
	var rightScale = 1.0 - leftScale;
	var waveScale = .875;
	var stemBottom = boxSize.y;
	var stemTop = boxSize.y * -0.1;
	var stemStep = (stemBottom - stemTop) / 6;
    return {
		stemTop: Vec2.fromXY(boxSize.x / 2.0, stemTop),
		stemControl: Vec2.fromXY((boxSize.x / 2.0) * waveScale, stemTop + (stemStep / 2.0)),
		stemFirst: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 1)),
		stemSecond: Vec2.fromXY(boxSize.x  / 2.0, stemTop + (stemStep * 2)),
		stemThird: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 3)),
		stemFourth: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 4)),
		stemFifth: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 5)),
		stemBottom: Vec2.fromXY(boxSize.x / 2.0, stemBottom),

		topLeft: Vec2.fromXY(boxSize.x * leftScale, boxSize.y * -0.5),
		topRight: Vec2.fromXY(boxSize.x * rightScale, boxSize.y * -0.5),
		bottomLeft: Vec2.fromXY(boxSize.x * leftScale, boxSize.y * 0.1),
		bottomRight: Vec2.fromXY(boxSize.x * rightScale, boxSize.y * 0.1)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var path = [

		'M' + geom.stemTop.toPathString(),
		'Q' + geom.stemControl.toPathString() + ' ' + geom.stemFirst.toPathString(),
		'T' + geom.stemSecond.toPathString(),
		'T' + geom.stemThird.toPathString(),
		'T' + geom.stemFourth.toPathString(),
		'T' + geom.stemFifth.toPathString(),
		'T' + geom.stemBottom.toPathString(),

		'M' + geom.topLeft.toPathString(),
		'L' + geom.bottomRight.toPathString(),
		'M' + geom.topRight.toPathString(),
		'L' + geom.bottomLeft.toPathString(),
		'M' + geom.stemTop.toPathString()
    ].join('');

	return svg('path', {
		d: path,
		'stroke': renderOpts.color || '#000',
		'stroke-width': renderOpts.thickness || '4px',
		'stroke-linecap': 'round',
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
