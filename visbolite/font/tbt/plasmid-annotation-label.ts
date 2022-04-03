
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


    const id = sha1(renderOpts.uri)

    return svg('g', {

    }, [
        svg('path', {
            id: id,
            d: path,
            stroke: 'none',
            'stroke-width': renderOpts.height * 0.5,
            fill: 'none',
        }),

        svg('text', {
            'text-anchor': 'middle',
            'alignment-baseline': 'middle',
            'dominant-baseline': 'central',
            'pointer-events': 'none',
        }, [

            svg('textPath', {

                'xlink:href': '#' + id,

            }, renderOpts.label)

        ])

    ])

}

export default {

    render: renderGlyph,

}


