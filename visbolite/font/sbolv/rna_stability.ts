
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {

	var waveScale =  .875;
	var stemBottom = boxSize.y;
	var stemTop = boxSize.y * -0.1;
	var stemStep = (stemBottom - stemTop) / 6

    return {
		stemTop: Vec2.fromXY(boxSize.x / 2.0, stemTop),
		stemControl: Vec2.fromXY((boxSize.x / 2.0) * waveScale, stemTop + (stemStep / 2.0)),
		stemFirst: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 1)),
		stemSecond: Vec2.fromXY(boxSize.x  / 2.0, stemTop + (stemStep * 2)),
		stemThird: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 3)),
		stemFourth: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 4)),
		stemFifth: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 5)),
		stemBottom: Vec2.fromXY(boxSize.x / 2.0, stemBottom),

		polygonBottomLeft: Vec2.fromXY((boxSize.x) / 1.6 ,boxSize.y * -0.3),
		polygonBottomRight: Vec2.fromXY((boxSize.x) /2.4, boxSize.y * -0.3 ),
		polygonTopLeft: Vec2.fromXY((boxSize.x) / 1.6,boxSize.y * -0.5) ,
		polygonTopRight: Vec2.fromXY((boxSize.x) / 2.4 ,boxSize.y * -0.5 ),
		polygonMid: Vec2.fromXY(boxSize.x/ 2 , stemTop )
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

    ].join('');

    var glyph = svg('path', {
		d: path,
		'stroke': renderOpts.color || '#000',
		'stroke-width': renderOpts.thickness || '4px',
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round',
		'fill': 'none'
	})

	var polygonPath = [
		'M' + geom.polygonMid.toPathString(),
		'L' + geom.polygonBottomLeft.toPathString(),
		'L' + geom.polygonTopLeft.toPathString(),
		'L' + geom.polygonTopRight.toPathString(),
		'L' + geom.polygonBottomRight.toPathString(),
		'L'	+ geom.polygonMid.toPathString(),
	].join('');

	var polygon = svg('path', {
		d: polygonPath,
		'fill': renderOpts.color || '#f00',
		'stroke': '#000',
		'stroke-width': renderOpts.thickness || '3px'
	})

	return svg('g', [
		glyph,
		polygon
	])

}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.6),

}
