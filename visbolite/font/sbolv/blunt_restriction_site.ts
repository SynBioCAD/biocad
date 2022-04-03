
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize) {
	var outsideOffset = boxSize.x / 4;
	var insideOffset = outsideOffset / 2.0;
	var middle = boxSize.x / 2.0;
    return {
        leftStemBottomStart: Vec2.fromXY(middle - outsideOffset, boxSize.y),
		leftStemBottom: Vec2.fromXY(middle - insideOffset, boxSize.y),
        leftStemTop: Vec2.fromXY(middle - insideOffset, 0),
		leftStemTopEnd: Vec2.fromXY(middle - outsideOffset, 0),

		rightStemBottomStart: Vec2.fromXY(middle + outsideOffset, boxSize.y),
		rightStemBottom: Vec2.fromXY(middle + insideOffset, boxSize.y),
		rightStemTop: Vec2.fromXY(middle + insideOffset, 0),
		rightStemTopEnd: Vec2.fromXY(middle + outsideOffset, 0)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var leftPath = [
        'M', geom.leftStemBottomStart.x, geom.leftStemBottomStart.y,
		'L', geom.leftStemBottom.x, geom.leftStemBottom.y,
		'L', geom.leftStemTop.x, geom.leftStemTop.y,
		'L', geom.leftStemTopEnd.x, geom.leftStemTopEnd.y
    ].join(' ');

    var leftBracket = svg('path', {
        d: leftPath,
        'stroke': renderOpts.color || renderOpts.defaultColor || 'black',
        'stroke-width': renderOpts.thickness || '5px',
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
        'fill': 'none'
    })

	var rightPath = [
		'M', geom.rightStemBottomStart.x, geom.rightStemBottomStart.y,
		'L', geom.rightStemBottom.x, geom.rightStemBottom.y,
		'L', geom.rightStemTop.x, geom.rightStemTop.y,
		'L', geom.rightStemTopEnd.x, geom.rightStemTopEnd.y
    ].join(' ');

	var rightBracket = svg('path', {
        d: rightPath,
        'stroke': renderOpts.color || renderOpts.defaultColor || 'black',
        'stroke-width': renderOpts.thickness || '5px',
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
        'fill': 'none'
    })

    var group = svg('g', [
        leftBracket,
        rightBracket
    ])

    return group
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0)

}

