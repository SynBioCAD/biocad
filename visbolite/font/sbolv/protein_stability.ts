
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {

	var leftScale = 0.3;
	var rightScale = 1.0 - leftScale;
	var stemBottom = boxSize.y;
	var stemTop = boxSize.y * -0.1;
	var stemStep = (stemBottom - stemTop) / 4.0;
	var xScaleLeftControl = .4;
	var xScaleRightControl = 1.0 - xScaleLeftControl;
	var yScaleLeft = .8;


    return {
		stemTop: Vec2.fromXY(boxSize.x / 2.0, stemTop),
		stemTopControl: Vec2.fromXY(boxSize.x * xScaleRightControl, stemTop),
		stemFirstRight: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 1)),
		stemFirstRightControl: Vec2.fromXY(boxSize.x * xScaleRightControl, stemTop + (stemStep * 1)),
		stemFirstLeft: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 0) + (stemStep * yScaleLeft)),
		stemFirstLeftControl: Vec2.fromXY(boxSize.x * xScaleLeftControl, stemTop + (stemStep * 0) + (stemStep * yScaleLeft)),
		stemSecondRight: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 2)),
		stemSecondRightControl: Vec2.fromXY(boxSize.x * xScaleRightControl, stemTop + (stemStep * 2)),
		stemSecondLeft: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 1) + (stemStep * yScaleLeft)),
		stemSecondLeftControl: Vec2.fromXY(boxSize.x * xScaleLeftControl, stemTop + (stemStep * 1) + (stemStep * yScaleLeft)),
		stemThirdRight: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 3)),
		stemThirdRightControl: Vec2.fromXY(boxSize.x * xScaleRightControl, stemTop + (stemStep * 3)),
		stemThirdLeft: Vec2.fromXY(boxSize.x / 2.0, stemTop + (stemStep * 2) + (stemStep * yScaleLeft)),
		stemThirdLeftControl: Vec2.fromXY(boxSize.x * xScaleLeftControl, stemTop + (stemStep * 2) + (stemStep * yScaleLeft)),
		stemBottom: Vec2.fromXY(boxSize.x / 2.0, stemBottom),
		stemBottomControl: Vec2.fromXY(boxSize.x * xScaleRightControl, stemBottom),

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
		'C' + geom.stemTopControl.toPathString() + ' ' + geom.stemFirstRightControl.toPathString() + ' ' + geom.stemFirstRight.toPathString(),
		'S' + geom.stemFirstLeftControl.toPathString() + ' ' + geom.stemFirstLeft.toPathString(),
		'S' + geom.stemSecondRightControl.toPathString() + ' ' + geom.stemSecondRight.toPathString(),
		'S' + geom.stemSecondLeftControl.toPathString() + ' ' + geom.stemSecondLeft.toPathString(),
		'S' + geom.stemThirdRightControl.toPathString() + ' ' + geom.stemThirdRight.toPathString(),
		'S' + geom.stemThirdLeftControl.toPathString() + ' ' + geom.stemThirdLeft.toPathString(),
		'S' + geom.stemBottomControl.toPathString() + ' ' + geom.stemBottom.toPathString(),

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
		'L'	+ geom.polygonMid.toPathString()
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
