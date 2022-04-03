
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function renderGlyph(renderOpts) {

    const origSizeX = 842.6
    const origSizeY = 388.9 * 2

    let reqSize = renderOpts.size


    const strand1Path = [
            'M', sizeX(44.6), ' ', sizeY(36.2),
            'c', sizeX(171.9), ' ', sizeY_rel(59.2), ' ', sizeX(216), ' ', sizeY_rel(394), ' ', sizeX(421), ' ', sizeY_rel(322.1),
            'c', sizeX(161.8), ' ', sizeY_rel(-56.8), ' ', sizeX(193), ' ', sizeY_rel(-272.9), ' ', sizeX(356.5), ' ', sizeY_rel(-327.9),
    ].join('')


    const strand2Path = [
        'M', sizeX(799), ' ', sizeY(363.1),
        'C', sizeX(628.7), ' ', sizeY(314.9), ' ', sizeX(618.9), ' ', sizeY(75.8), ' ', sizeX(466.3), ' ', sizeY(27.6),
        'C', sizeX(266.6), ' ', sizeY(-35.5), ' ', sizeX(199), ' ', sizeY(342.4), ' ', sizeX(20.5), ' ', sizeY(367.8)
    ].join('')


    const lineCoords = [
        { x1:61.2, y1:42.9, x2:60.9, y2:356.2 },
        { x1:127.3, y1:85.8, x2:127.1, y2:298.3 },
        { x1:294.3, y1:89.4, x2:294.2, y2:301.9 },
        { x1:358.4, y1:47.2, x2:358.2, y2:351.7 },
        { x1:426.4, y1:23.1, x2:426.1, y2:366.9 },
        { x1:492, y1:33, x2:491.8, y2:337.5 },
        { x1:556.1, y1:76, x2:556, y2:288.6 },
        { x1:716.1, y1:106.9, x2:716, y2:319.5 },
        { x1:779.7, y1:49.9, x2:779.5, y2:363.3 }
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


    const strand1 = svg('path', {
        d: strand1Path,
        'fill': 'none',
        'stroke': '#1D71B8',
        'stroke-width': '3',
        'stroke-linecap': 'round',
        'stroke-miterlimit': 10
    })

    const strand2 = svg('path', {
        d: strand2Path,
        'fill': 'none',
        'stroke': '#C6C6C6',
        'stroke-width': '3',
        'stroke-linecap': 'round',
        'stroke-miterlimit': 10
    })

    return svg('g', lines.concat([
        strand1,
        strand2
    ]))

    function sizeX(n) {

        return ((n / origSizeX) * reqSize.x) + ''

    }

    function sizeY(n) {

        return reqSize.y * 0.5 + ((n / origSizeY) * reqSize.y) + ''

    }

    function sizeY_rel(n) {

        return ((n / origSizeY) * reqSize.y) + ''

    }
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0)

}


