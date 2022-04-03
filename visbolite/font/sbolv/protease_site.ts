
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

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
		'C' + geom.stemTopControl.toPathString() + ' ' + geom.stemFirstRightControl.toPathString() + ' ' + geom.stemFirstRight.toPathString(),
		'S' + geom.stemFirstLeftControl.toPathString() + ' ' + geom.stemFirstLeft.toPathString(),
		'S' + geom.stemSecondRightControl.toPathString() + ' ' + geom.stemSecondRight.toPathString(),
		'S' + geom.stemSecondLeftControl.toPathString() + ' ' + geom.stemSecondLeft.toPathString(),
		'S' + geom.stemThirdRightControl.toPathString() + ' ' + geom.stemThirdRight.toPathString(),
		'S' + geom.stemThirdLeftControl.toPathString() + ' ' + geom.stemThirdLeft.toPathString(),
		'S' + geom.stemBottomControl.toPathString() + ' ' + geom.stemBottom.toPathString(),

		'M' + geom.topLeft.toPathString(),
		'L' + geom.bottomRight.toPathString(),
		'M' + geom.topRight.toPathString(),
		'L' + geom.bottomLeft.toPathString(),
		'M' + geom.stemTop.toPathString()
    ].join('');

    var glyph = svg('path', {
		d: path,
		'stroke': renderOpts.color || '#000',
		'stroke-width': renderOpts.thickness || '4px',
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round',
		'fill': 'none'
	})

	return glyph

}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.6),

}