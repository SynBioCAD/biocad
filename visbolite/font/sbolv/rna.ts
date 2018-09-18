
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size) {

    const numSquiggles = 7

    var squiggleInterval = size.divideScalar(numSquiggles)

    var squigglePoint = Vec2.fromXY(0, 0)
    var squigglePoints:Vec2[] = []

    for(var i = 0; i < numSquiggles + 1; ++ i) {

        squigglePoints.push(squigglePoint)

        squigglePoint = squigglePoint.add(squiggleInterval)
    }

    return {
        squigglePoints: squigglePoints
    }
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    const squigglePoints = geom.squigglePoints

    var path:string[] = []

    path.push('M' + Vec2.fromXY(0, 0).toPathString())

    path.push('Q ' + squigglePoints[0].toPathString() + ', ' + Vec2.fromXY(8, 0).toPathString())

    for(var i = 1; i < geom.squigglePoints.length; ++ i) {

        path.push('T ' + squigglePoints[i].toPathString())


    }

    //path.push('Z')

    return svg('path', {

        d: path.join(''),
        stroke: renderOpts.color || 'black',
        'stroke-width': renderOpts.thickness || '3px',
        fill: 'none'

    })
}

export default {

    render: renderGlyph,
    backbonePlacement: 'mid',
    scale: Vec2.fromXY(0.8, 0.8),
    arcEntry: 'any'
}


