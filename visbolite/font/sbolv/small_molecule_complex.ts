
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function renderGlyph(renderOpts) {

    let boxSize = renderOpts.size

    var largeCircle = svg('circle', {
        //r: boxSize.x/2,
        r: 20,
        'stroke':'black',
        'fill': renderOpts.color || '#F1948A',
        'stroke-width': renderOpts.thickness ||'2px',
        'stroke-linejoin': 'round',
        cx: boxSize.x/2,
        cy: boxSize.y/2
    })

    var smallCircle = svg('circle', {
        r: boxSize.x/4,
        'stroke':'black',
        'fill': renderOpts.color || '#F1948A',
        'stroke-width': renderOpts.thickness ||'2px',
        'stroke-linejoin': 'round',
        cx: boxSize.x/5,
        cy: boxSize.y/1.1
    })

    var smallBox = svg('rect', {
        width: boxSize.x/6,
        height: boxSize.y/9,
        'stroke':'dark gray',
        'fill': renderOpts.color || '#F1948A',
        'stroke-width': renderOpts.thickness ||'2px',
        'stroke-linejoin': 'round',
        x: boxSize.x/4.8,
        y: boxSize.y/1.35
    })

    var circle = svg('circle', {
        r: boxSize.x/4,
        cx: boxSize.x/4,
        cy: boxSize.y/6,
        'stroke': 'black',
        'fill': renderOpts.color ||'#85C1E9',
        'stroke-width': renderOpts.thickness || '3px'
    })

    return svg('g', [
        largeCircle, smallCircle, smallBox, circle
    ])

}


export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}