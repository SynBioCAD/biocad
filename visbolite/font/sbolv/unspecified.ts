
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function createGeometry(boxSize) {
    let x = boxSize.x;
    let y = boxSize.y;

        return {
            top: Vec2.fromXY(x / 2, 0),
            left: Vec2.fromXY((x - y) / 2, y / 2),
            right: Vec2.fromXY((x + y) / 2, y / 2),
            bottom: Vec2.fromXY(x / 2, y),
        };
    }


function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);

    let boxSize = renderOpts.size

	var fillPoints = [
		geom.top.x + ',' + geom.top.y,
		geom.left.x + ',' + geom.left.y,
		geom.bottom.x + ',' + geom.bottom.y,
		geom.right.x + ',' + geom.right.y
    ].join(' ');

	var fill = svg('polygon', {
        points: fillPoints,
        'fill': renderOpts.color || '#ffff00'
    })

    var path = [
        'M' + geom.top.toPathString(),
        'L' + geom.left.toPathString(),
        'L' + geom.bottom.toPathString(),
        'L' + geom.right.toPathString(),
        'Z'
    ].join("")

    let question = svg('text', {
        x: boxSize.x / 2,
        y: geom.bottom.y / 7
    }, '?')

    let dot = svg('text', {
        x: boxSize.x / 2.14,
        y: geom.bottom.y / 3.5
    }, '.')
    
    question.attr('text-anchor', 'middle');

    return svg('g', {
        'stroke': 'black',
        'fill': 'none'
    }, [
        question,
        dot,
        svg('path', { d : path })
    ])
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 0.5)
    
}



