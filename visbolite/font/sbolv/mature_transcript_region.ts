
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function renderGlyph(renderOpts) {

    const origSizeX = 1000;
    const origSizeY = 1000;

    let reqSize = renderOpts.size

    const body = svg('rect', {
        width: reqSize.x,
        height: sizeY(250),
        'stroke-width': '1',
        'fill': renderOpts.color || '#03c03c'
    })

    const lineCoords = [
        { x1: 0,    y1: -100, x2: 0,    y2: 0 },
        { x1: 50,   y1: -100, x2: 50,   y2: 0 },
        { x1: 100,  y1: -100, x2: 100,  y2: 0 },
        { x1: 150,  y1: -100, x2: 150,  y2: 0 },
        { x1: 200,  y1: -100, x2: 200,  y2: 0 },
        { x1: 250,  y1: -100, x2: 250,  y2: 0 },
        { x1: 300,  y1: -100, x2: 300,  y2: 0 },
        { x1: 350,  y1: -100, x2: 350,  y2: 0 },
        { x1: 400,  y1: -100, x2: 400,  y2: 0 },
        { x1: 450,  y1: -100, x2: 450,  y2: 0 },
        { x1: 500,  y1: -100, x2: 500,  y2: 0 },
        { x1: 550,  y1: -100, x2: 550,  y2: 0 },
        { x1: 600,  y1: -100, x2: 600,  y2: 0 },
        { x1: 650,  y1: -100, x2: 650,  y2: 0 },
        { x1: 700,  y1: -100, x2: 700,  y2: 0 },
        { x1: 750,  y1: -100, x2: 750,  y2: 0 },
        { x1: 800,  y1: -100, x2: 800,  y2: 0 },
        { x1: 850,  y1: -100, x2: 850,  y2: 0 },
        { x1: 900,  y1: -100, x2: 900,  y2: 0 },
        { x1: 950,  y1: -100, x2: 950,  y2: 0 },
        { x1: 1000, y1: -100, x2: 1000, y2: 0 },
    ]

    const lines = lineCoords.map((lineCoord) => {

        return svg('line', {
            'x1': sizeX(lineCoord.x1),
            'y1': sizeY(lineCoord.y1),
            'x2': sizeX(lineCoord.x2),
            'y2': sizeY(lineCoord.y2),
            'stroke-width': '1'
        })

    })

    return svg('g', lines.concat([body]))

    function sizeX(n) {

        return ((n / origSizeX) * reqSize.x) + ''

    }

    function sizeY(n) {

        return ((n / origSizeY) * reqSize.y) + ''

    }
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}




