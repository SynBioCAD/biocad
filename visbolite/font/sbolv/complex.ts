
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {
  var x = boxSize.x;
  var y = boxSize.y;

  return {

    topLeft: Vec2.fromXY(-0.25 * x, y * 0.2),
    leftOne: Vec2.fromXY(-0.5 * x, y * 0.4),
    leftTwo: Vec2.fromXY(-0.5 * x, y * 0.8),
    bottomLeft: Vec2.fromXY(-0.25 * x, y),
    bottomRight: Vec2.fromXY(x, y),
    rightOne: Vec2.fromXY(1.25 * x, y * 0.4),
    rightTwo: Vec2.fromXY(1.25 * x, y * 0.8),
    topRight: Vec2.fromXY(x, y * 0.2),

  };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);
    var path1 = [
      'M' + geom.topLeft.toPathString(),
      'L' + geom.leftOne.toPathString(),
      'L' + geom.leftTwo.toPathString(),
      'L' + geom.bottomLeft.toPathString(),
      'L' + geom.bottomRight.toPathString(),
      'L' + geom.rightTwo.toPathString(),
      'L' + geom.rightOne.toPathString(),
      'L' + geom.topRight.toPathString(),
      'Z'
    ].join('');

    var glyph = svg('path', {
      d: path1,
      'stroke': 'black',
      'stroke-width': renderOpts.thickness || '3px',
      'stroke-linecap': 'square',
      'stroke-linejoin': 'square',
      'fill': renderOpts.color || '#ABEBC6'
    })

    return svg('g', [
      path1,
      glyph
    ])
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.6),

}
