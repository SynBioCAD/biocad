
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {
	var width = boxSize.x / 2.0;
	var height = boxSize.y;
	var indentScale = 0.25;
	var aboveLineScale = 0.8;
    return {
		leftBottomStart: Vec2.fromXY(width * indentScale, height * aboveLineScale),
		leftBottom: Vec2.fromXY(0.0, height * aboveLineScale),
		leftTop: Vec2.fromXY(0.0, 0.0),
		leftTopEnd: Vec2.fromXY(width * indentScale, 0.0),

		rightBottomStart: Vec2.fromXY(width - (width * indentScale), height * aboveLineScale),
		rightBottom: Vec2.fromXY(width, height * aboveLineScale),
		rightTop: Vec2.fromXY(width, 0.0),
		rightTopEnd: Vec2.fromXY(width - (width * indentScale), 0.0),
    };
}


function renderGlyph(renderOpts) {

	var geom = createGeometry(renderOpts.size);

	var path = [
		'M' + geom.leftBottomStart.toPathString(),
		'L' + geom.leftBottom.toPathString(),
		'L' + geom.leftTop.toPathString(),
		'L' + geom.leftTopEnd.toPathString(),

		'M' + geom.rightBottomStart.toPathString(),
		'L' + geom.rightBottom.toPathString(),
		'L' + geom.rightTop.toPathString(),
		'L' + geom.rightTopEnd.toPathString(),
	].join('');

    return svg('path', {
		d: path,
		'stroke': 'black',
		'stroke-width': renderOpts.thickness || '5px',
		'fill': 'none'
	})

}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.5),

}


