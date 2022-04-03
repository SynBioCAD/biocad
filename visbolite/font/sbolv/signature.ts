
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize) {
    
    //size of the box surronding crossed lines, which is a square 
    var cBox = Vec2.fromScalar(boxSize.x * 0.25);

    //offset of horizontal line proportional to coordinate of bottom left corner of cBox
    var hOffset = Vec2.fromXY(boxSize.x * 0.05, boxSize.y * 0.01);

    return {
        //coordinates of the surrounding square 
        topLeft: Vec2.fromXY(0, boxSize.y * 0.15),
        bottomLeft: Vec2.fromXY(0, boxSize.y),
        bottomRight: Vec2.fromXY(boxSize.x, boxSize.y),
        topRight: Vec2.fromXY(boxSize.x, boxSize.y * 0.15),
        
        //coordinates of the inside crossed lines
        cTopLeft: Vec2.fromXY(boxSize.x * 0.15, boxSize.y * 0.4),
        cBottomRight: Vec2.fromXY(boxSize.x * 0.15 + cBox.x, boxSize.y * 0.4 + cBox.y),
        cTopRight: Vec2.fromXY(boxSize.x * 0.15 + cBox.x, boxSize.y * 0.4),
        cBottomLeft: Vec2.fromXY(boxSize.x * 0.15, boxSize.y * 0.4 + cBox.y),

        //coordinates of the horizontal line
        hLeft: Vec2.fromXY(hOffset.x + boxSize.x * 0.2 + cBox.x, boxSize.y * 0.5+ cBox.y + hOffset.y),
        hRight: Vec2.fromXY(hOffset.x * 0.08 + boxSize.x * 0.2 + cBox.x + boxSize.x * 0.42, boxSize.y * 0.5 + cBox.y + hOffset.y)            
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    var path = [

        'M' + geom.topLeft.toPathString(),
        'L' + geom.bottomLeft.toPathString(),
        'L' + geom.bottomRight.toPathString(),
        'L' + geom.topRight.toPathString(),
        'L' + geom.topLeft.toPathString(),

        'M' + geom.cTopLeft.toPathString(),
        'L' + geom.cBottomRight.toPathString(),
  
        'M' + geom.cTopRight.toPathString(),
        'L' + geom.cBottomLeft.toPathString(),

        'M' + geom.hLeft.toPathString(),
        'L' + geom.hRight.toPathString()

    ].join('');

    return svg('g', {
        d: path,
        'stroke': renderOpts.color || '#000000',
        'stroke-width': renderOpts.thickness || '4px',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'fill': renderOpts.color || '#A9A9A9'
    })
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}




