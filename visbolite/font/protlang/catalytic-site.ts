
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(size:Vec2) {

    return {
        width: size.x,
        height: size.y,
        mid: size.multiplyScalar(0.5)
    }
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var letter = renderOpts.label.toLowerCase()

    return svg('g', [
        svg('rect', {
            stroke: renderOpts.defaultColor || 'black',
            fill: renderOpts.color || 'none',
            'stroke-width': 3,
            width: geom.width,
            height: geom.height
        }),
        svg('text', {
            x: geom.mid.x,
            y: geom.mid.y,
            'alignment-baseline': 'central',
            'dominant-baseline': 'middle',
            'text-anchor': 'middle',
            'font-family': 'Helvetica',
            'font-size': '12pt',
            fill: renderOpts.color || renderOpts.defaultColor || 'black'
        }, letter)

    ])
}

export default {

    render: renderGlyph,
    backbonePlacement: 'mid',
    isContainer: true,
    scale: Vec2.fromXY(0.5, 0.5),
    interruptsBackbone: true,
    resizable: false,
    hasLabel: true,
    defaultLabel: 'C'
}



