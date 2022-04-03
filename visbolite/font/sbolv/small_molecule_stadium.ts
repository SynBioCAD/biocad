
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize){
//Coordinates for rectangle
return{
    topLeft: Vec2.fromXY(boxSize.x/2,0),
    bottomLeft: Vec2.fromXY(boxSize.x/2,boxSize.y),              //Larger outer box
    bottomRight: Vec2.fromXY(boxSize.x * 2,boxSize.y),
    topRight: Vec2.fromXY(boxSize.x * 2,0),
  };
}
function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);
    var path1 = [
      'M' + geom.topLeft.toPathString(),
      'L' + geom.bottomLeft.toPathString(),
      'L' + geom.bottomRight.toPathString(),
      'L' + geom.topRight.toPathString(),
      'L' + geom.topLeft.toPathString()
    ].join('');

    var path2 = [
      'M' + geom.topLeft.toPathString(),
      'L' + geom.topRight.toPathString(),
      'M' + geom.bottomLeft.toPathString(),
      'L' + geom.bottomRight.toPathString(),

    ].join('');

  var glyph1 = svg('path', {
    d: path1,
    'stroke':'dark gray',
    'fill': renderOpts.color || '#85C1E9',
    'stroke-width': renderOpts.thickness ||'2px',
    'stroke-linejoin': 'square'
  })

  var glyph2 = svg('path', {
    d: path2,
    'stroke':'black',
    'fill': renderOpts.color || '#85C1E9',
    'stroke-width': renderOpts.thickness ||'2px',
    'stroke-linejoin': 'square'
  })

  var glyph3 = svg('circle', {
    r: renderOpts.size.x,
    'stroke': 'black',
    'fill': renderOpts.color || '#85C1E9',
    'stroke-width': renderOpts.thickness || '2px',
    'stroke-linejoin': 'round',
    cx: renderOpts.size.x * 2,
    cy: renderOpts.size.y / 2
  })

  var glyph4 = svg('circle', {
    r: renderOpts.size.x,
    'stroke':'black',
    'fill': renderOpts.color || '#85C1E9',
    'stroke-width': renderOpts.thickness ||'2px',
    'stroke-linejoin': 'round',
    cx: 0,
    cy: 0
  })

  return svg('g', [
    glyph3,
    glyph4,
    glyph1,
    glyph2
  ])
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}




