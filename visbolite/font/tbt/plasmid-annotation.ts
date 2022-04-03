
import { Vec2, Rect, Matrix, getEllipsePoint } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'
import extend = require('xtend')
import sha1 = require('sha1')

function renderGlyph(renderOpts) {

    var path = [

        'M' + renderOpts.startPoint.toPathString(),

        'A ' + renderOpts.plasmidMetrics.radius.toPathString()
             + ' ' + 0 + ' ' + 0 + ' ' + 1 + ' '
             + renderOpts.endPoint.toPathString(),

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
        stroke: 'pink',
        'stroke-width': renderOpts.height * 0.5,
        fill: 'none',
    }, renderOpts.attr || {}));
}

export default {

    render: renderGlyph,

}


