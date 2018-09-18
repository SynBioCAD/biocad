
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg, VNode } from 'jfw/vdom'
import { svgMarkerId } from 'jfw/util'

function createGeometry(size) {

    var start = Vec2.fromXY(size.x * 0.5, size.y * 0.5);

    return {
        start: start,
        right: Vec2.fromXY(size.x, size.y * 0.5),
        bottom: Vec2.fromXY(size.x * 0.5, size.y),
        bottomRight: Vec2.fromXY(size.x, size.y),
        top: Vec2.fromXY(size.x * 0.5, 0),
        topRight: Vec2.fromXY(size.x, 0)
    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size)

    var path = [

        'M' + geom.start.toPathString(),
        'C' + geom.right.toPathString() + ' ' + geom.bottomRight.toPathString() + ' ' + geom.bottom.toPathString(),
        'A' + geom.start.toPathString() + ' 0 0 1 ' + geom.top.toPathString(),
        'L' + geom.topRight.toPathString()

    ].join('');

    var color = renderOpts.color || 'black';

    var markerId = 'OriT_marker_' + svgMarkerId.getId();

    var svgGroup:VNode[] = [];

    svgGroup.push(svg('defs', [
        svg('marker', {
            id: markerId,
            markerWidth: 10,
            markerHeight: 10,
            refX: 5,
            refY: 5
        }, [
            svg('path', {
                d: 'M4,0L10,5L4,10z',
                stroke: color,
                fill: color
            })
        ])
    ]));

    svgGroup.push(svg('path', {
        'd': path,
        'stroke': color,
        'stroke-width': renderOpts.thickness || '1px',
        'fill': 'none',
        'marker-end': 'url(#' + markerId + ')'
    }));

    return svg('g', svgGroup);
}

export default {

    render: renderGlyph,
    backbonePlacement: 'mid',
    scale: Vec2.fromXY(1.0, 0.6)
    
}



