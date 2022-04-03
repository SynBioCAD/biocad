
import extend = require('xtend')
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

import { getEllipsePoint } from '@biocad/jfw/geom'

const arrowheadSize = 0.2

function renderGlyph(renderOpts) {

    const descentRadius = renderOpts.plasmidMetrics.radius.subtractScalar(renderOpts.height * 0.5)
    const ascentRadius = renderOpts.plasmidMetrics.radius.subtractScalar(renderOpts.height * 0.5)

    const boxTopLeft = getEllipsePoint(
            renderOpts.plasmidMetrics.centerPoint, ascentRadius, renderOpts.normalizedStart)

    const boxTopRight = getEllipsePoint(
            renderOpts.plasmidMetrics.centerPoint, ascentRadius, renderOpts.normalizedEnd)

    const boxBottomLeft = getEllipsePoint(
            renderOpts.plasmidMetrics.centerPoint, descentRadius, renderOpts.normalizedStart)

    const boxBottomRight = getEllipsePoint(
            renderOpts.plasmidMetrics.centerPoint, descentRadius, renderOpts.normalizedEnd)

    const arrowheadPoint = renderOpts.endPoint


    var path = [

        'M' + boxTopLeft.toPathString(),

        'A ' + ascentRadius.toPathString()
             + ' ' + 0 + ' ' + 0 + ' ' + 1 + ' '
             + boxTopRight.toPathString(),

        'L ' + arrowheadPoint.toPathString(),

        'L ' + boxBottomRight.toPathString(),

        'A ' + descentRadius.toPathString()
             + ' ' + 0 + ' ' + 0 + ' ' + 1 + ' '
             + boxBottomLeft.toPathString(),

        ' Z'

    ].join('');
 
    var fill = renderOpts.color || 'blue'

    if(renderOpts.fill === false) {

        fill = 'none'

    } else {

        if(renderOpts.fill !== undefined)
            fill = renderOpts.fill
    }

    return svg('path', extend({
        d: path,
        //stroke: 'red',
        //'stroke-width': '5',
        stroke: 'none',
        fill: 'red',
    }, renderOpts.attr || {}));
}

export default {

    render: renderGlyph,

}


