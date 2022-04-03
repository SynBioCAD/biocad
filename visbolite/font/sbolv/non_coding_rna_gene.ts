
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize) {

    function createTangentLine(pointA, pointB) {

      var lengthX = pointB.x - pointA.x;
      var lengthY = pointB.y - pointA.y;
      
      return {
          length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
          angle: Math.atan2(lengthY, lengthX)
      };

    }

    function createControlPoint(current, previous, next) {
         
         const smoothing = 0.25;
         var p = (previous === null) ? current : previous;
         var n = (next === null) ? current: next;
          
         var line = createTangentLine(n,p);
          
         return Vec2.fromXY(
             current.x + (Math.cos(line.angle + Math.PI) * line.length * smoothing),
             current.y + (Math.sin(line.angle + Math.PI) * line.length * smoothing)
         )
    }

    var topLeft = Vec2.fromXY(0.0, boxSize.y * 0.8);
    var bottomLeft = Vec2.fromXY(0.0, boxSize.y);
    var bottomRight = Vec2.fromXY(boxSize.x, boxSize.y);
    var topRight = Vec2.fromXY(boxSize.x, boxSize.y * 0.9);
        
    //coordinate of pick
    var rightMostPick = Vec2.fromXY(boxSize.x * 0.88, boxSize.y * 0.7);
    var right = Vec2.fromXY(boxSize.x * 0.7, boxSize.y * 0.9);
    var middlePick = Vec2.fromXY(boxSize.x * 0.5, boxSize.y * 0.7);
    var middle = Vec2.fromXY(boxSize.x * 0.3, boxSize.y * 0.9);
    var leftMostPick = Vec2.fromXY(boxSize.x * 0.1, boxSize.y * 0.7);

    //coordiantes of control ponits 
    var controlPoint1 = createControlPoint(topRight, rightMostPick, null);
    var controlPoint2 = createControlPoint(rightMostPick, right, topRight);
    var controlPoint3 = createControlPoint(right, middlePick, rightMostPick);
    var controlPoint4 = createControlPoint(middlePick, middle, right);
    var controlPoint5 = createControlPoint(middle, leftMostPick, middlePick);
    var controlPoint6 = createControlPoint(leftMostPick, topLeft, middle);
    var controlPoint7 = createControlPoint(topLeft, null, leftMostPick);
    
    return {
       topLeft: topLeft,
       bottomLeft: bottomLeft,
       bottomRight: bottomRight,
       topRight: topRight,
        
       //coordinate of pick
       rightMostPick: rightMostPick,
       right: right,
       middlePick: middlePick,
       middle: middle,
       leftMostPick: leftMostPick,

      //coordiantes of control ponits 
      controlPoint1: controlPoint1, 
      controlPoint2: controlPoint2, 
      controlPoint3: controlPoint3,
      controlPoint4: controlPoint4, 
      controlPoint5: controlPoint5, 
      controlPoint6: controlPoint6, 
      controlPoint7: controlPoint7

       
  };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);
     

    var path = [

        'M' + geom.topLeft.toPathString(),
        'L' + geom.bottomLeft.toPathString(),
        'L' + geom.bottomRight.toPathString(),
        'L' + geom.topRight.toPathString(),
        'C' + geom.controlPoint1.toPathString() + ' ' + geom.controlPoint2.toPathString() + ' ' + geom.rightMostPick.toPathString(),
        'S' + geom.controlPoint3.toPathString() + ' ' + geom.right.toPathString(),
        'S' + geom.controlPoint4.toPathString() + ' ' + geom.middlePick.toPathString(),
        'S' + geom.controlPoint5.toPathString() + ' ' + geom.middle.toPathString(),
        'S' + geom.controlPoint6.toPathString() + ' ' + geom.leftMostPick.toPathString(),
        'S' + geom.controlPoint7.toPathString() + ' ' + geom.topLeft.toPathString()
      
     ].join('');

    var glyph = svg('path', {
        d: path,
        'stroke': renderOpts.color || '#000000',
        'stroke-width': renderOpts.thickness || '3px',
        'stroke-linecap': 'round',
        'fill': renderOpts.color || '#A9A9A9'
    })
    
    return glyph
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}



