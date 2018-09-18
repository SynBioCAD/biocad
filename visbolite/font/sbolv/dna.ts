
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

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
         );
    }
    // Coordinates of Points to Connect
    var x = boxSize.x;
    var y = boxSize.y;
    var stepSize = x/2;

    // First spiral
    var pointa = Vec2.fromXY(3 * x/2, 4.75 * y/5);
    var pointA = Vec2.fromXY(5 * x/4, 3 * y/5 );
    var pointB = Vec2.fromXY(pointA.x - stepSize, y);
    var pointC = Vec2.fromXY(pointA.x - 2 * stepSize, 3 * y/5 );
    var pointD = Vec2.fromXY(-x/4, 4.8 * y/5);
    var pointd = Vec2.fromXY(-x/2,3 * y/5);

  //  Second spiral
    var pointf = Vec2.fromXY(3 * x/2,3 * y/5);
    var pointF = Vec2.fromXY(5 * x/4, 4.8 * y/5);
    var pointG = Vec2.fromXY(pointF.x - stepSize, 3 * y/5);
    var pointH = Vec2.fromXY(pointF.x - 2 * stepSize, y);
    var pointI = Vec2.fromXY(-x/4, 3 * y/5);
    var pointi = Vec2.fromXY(-x/2, 4.75 * y/5);

    var topLeft= Vec2.fromXY(-1 * x-2, 2.9 * y/5);
    var bottomLeft= Vec2.fromXY(-1 * x-2, 4.75 * y/5);
    var topRight= Vec2.fromXY(-x/4, 0);
    var bottomRight=Vec2.fromXY(-x/4, 1.5 * y);

    var topLeft1= Vec2.fromXY(5 * x/4, 2.9 * y/5);
    var bottomLeft1= Vec2.fromXY(5 * x/4, 1.5 * y);
    var topRight1= Vec2.fromXY(2 * x, 2.9 * y/5);
    var bottomRight1= Vec2.fromXY(2 * x, 1.5 * y);


    //Coordinates of Control Points
    var controlPoint1 = createControlPoint(pointa, pointA, null);
    var controlPoint2 = createControlPoint(pointA, pointB, pointa);
    var controlPoint3 = createControlPoint(pointB, pointC, pointA );
    var controlPoint4 = createControlPoint(pointC, pointD, pointB);
    var controlPoint5 = createControlPoint(pointD, pointd,pointC);
    var controlPoint6 = createControlPoint(pointd, null,pointD);

    var controlPoint7 = createControlPoint(pointf, pointF, null);
    var controlPoint8 = createControlPoint(pointF, pointG, pointf);
    var controlPoint9 = createControlPoint(pointG, pointH, pointF);
    var controlPoint10 = createControlPoint(pointH,pointI,pointG);
    var controlPoint11 = createControlPoint(pointI,pointi,pointH);
    var controlPoint12 = createControlPoint(pointi,null,pointI);



    return {


       //coordinate of pick
        pointa:  pointa,
        pointA:  pointA,
        pointB:  pointB,
        pointC:  pointC,
        pointD:  pointD,
        pointd:  pointd,
      //  pointE:  pointE,
        pointf:  pointf,
        pointF:  pointF,
        pointG:  pointG,
        pointH:  pointH,
        pointI:  pointI,
        pointi:  pointi,

      //coordiantes of control ponits
      controlPoint1:  controlPoint1,
      controlPoint2:  controlPoint2,
      controlPoint3:  controlPoint3,
      controlPoint4:  controlPoint4,
      controlPoint5:  controlPoint5,
      controlPoint6:  controlPoint6,
      controlPoint7:  controlPoint7,
      controlPoint8:  controlPoint8,
      controlPoint9:  controlPoint9,
      controlPoint10: controlPoint10,
      controlPoint11: controlPoint11,
      controlPoint12: controlPoint12,

      topLeft: topLeft,
      bottomLeft:bottomLeft,
      bottomRight:bottomRight,
      topRight:topRight,

      topLeft1: topLeft1,
      bottomLeft1:bottomLeft1,
      bottomRight1:bottomRight1,
      topRight1:topRight1,




    };
    }
    function renderGlyph(renderOpts) {
    var geom = createGeometry(renderOpts.size);


    var path = [
        'M' + geom.pointa.toPathString(),
        'C' + geom.controlPoint1.toPathString() + ' ' +  geom.controlPoint2.toPathString() + ' ' + geom.pointA.toPathString(),
        'S' + geom.controlPoint3.toPathString() + ' ' + geom.pointB.toPathString(),
        'S' + geom.controlPoint4.toPathString() + ' ' + geom.pointC.toPathString(),
        'S' + geom.controlPoint5.toPathString() + ' ' + geom.pointD.toPathString(),
        'S' + geom.controlPoint6.toPathString() + ' ' + geom.pointd.toPathString(),
     ].join('');

     var path2 = [
      'M' + geom.pointf.toPathString(),
      'C' + geom.controlPoint7.toPathString() + ' ' +  geom.controlPoint8.toPathString() + ' ' + geom.pointF.toPathString(),
      'S' + geom.controlPoint9.toPathString() + ' ' + geom.pointG.toPathString(),
      'S' + geom.controlPoint10.toPathString() + ' ' + geom.pointH.toPathString(),
      'S' + geom.controlPoint11.toPathString() + ' ' + geom.pointI.toPathString(),
      'S' + geom.controlPoint12.toPathString() + ' ' + geom.pointi.toPathString(),
    ].join('');

    var path3 = [
      'M' + geom.topLeft.toPathString(),
      'L' + geom.bottomLeft.toPathString(),
      'L' + geom.bottomRight.toPathString(),
      'L' + geom.topRight.toPathString(),
      'Z'
    ].join('');

    var path4 = [
      'M' + geom.topLeft1.toPathString(),
      'L' + geom.bottomLeft1.toPathString(),
      'L' + geom.bottomRight1.toPathString(),
      'L' + geom.topRight1.toPathString(),
      'Z'
    ].join('');

    var glyph = svg('path', {
      d: path,
      'stroke': renderOpts.color || '#000000',
      'stroke-width': renderOpts.thickness || '3px',
      'stroke-linecap': 'round',
      'fill-opacity': 0
    })

    var glyph2 = svg('path', {
      d: path2,
      'stroke': renderOpts.color || '#000000',
      'stroke-width': renderOpts.thickness || '3px',
      'stroke-linecap': 'round',
      'fill-opacity': 0
    })

    var glyph3 = svg('path', {
      d: path3,
      'stroke': renderOpts.color || '#FFFFFF',
      'stroke-width': renderOpts.thickness || '3px',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      'fill': 'white'
    })

    var glyph4 = svg('path', {
      d: path4,
      'stroke': renderOpts.color || '#FFFFFF',
      'stroke-width': renderOpts.thickness || '3px',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      'fill': 'white'
    })

    return svg('g', [
      glyph,
      glyph2,
      glyph3,
      glyph4
    ])

}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}
