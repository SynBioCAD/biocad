
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {
	 
    var indentScale = 0.02 * boxSize.x;
	 
    return {
		leftTop: Vec2.fromXY(0.0 + indentScale, boxSize.y * 0.1),
		leftMiddle: Vec2.fromXY(0.0 + indentScale, boxSize.y * 0.5),
		rightMiddle: Vec2.fromXY(boxSize.x - indentScale, boxSize.y * 0.5),
        rightBottom: Vec2.fromXY(boxSize.x - indentScale, boxSize.y * 0.9),
   };
}


function renderGlyph(design, glyphObject, boxSize) {

	var geom = createGeometry(boxSize);

	var path = [
		'M' + geom.leftTop.toPathString(),
		'L' + geom.leftMiddle.toPathString(),
		'L' + geom.rightMiddle.toPathString(),
		'L' + geom.rightBottom.toPathString(),
	].join('');

    return svg('path', {
        d: path,
        'stroke': 'black',
        'stroke-width': glyphObject.thickness || '5px',
        'fill': 'none',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    })
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}


