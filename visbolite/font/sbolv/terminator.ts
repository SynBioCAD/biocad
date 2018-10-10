
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(size) {

    var stemBottom = Vec2.fromXY(size.x / 2.0, size.y);

    return {
        iama: 'terminator',
        stemBottom: stemBottom,
        stemTop: Vec2.fromXY(size.x / 2.0, 0),
        topLeft: Vec2.fromXY(0, 0),
        topRight: Vec2.fromXY(size.x, 0),
        boundingBoxWidth: size.x,
        boundingBoxHeight: size.y,
        backboneOffset: stemBottom.y
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.stemBottom.toPathString(),
        'L' + geom.stemTop.toPathString(),
        'M' + geom.topLeft.toPathString(),
        'L' + geom.topRight.toPathString(),

    ].join('');

    var svgElements = [

        svg('path', {
            'd': path,
            'stroke': renderOpts.color || '#ff5050',
            'stroke-width': renderOpts.thickness || '5px',
            'stroke-linejoin': 'round',
            'fill': 'none',
        }),

        svg('rect', {
            'width': geom.boundingBoxWidth,
            'height': geom.boundingBoxHeight,
            'pointer-events': 'visible',
            'fill': 'none'
        })
    ];

    return svg('g', svgElements);
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    scale: Vec2.fromXY(1.0, 0.8)
    
}

