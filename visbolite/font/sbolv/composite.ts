
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

function createGeometry(boxSize) {

    return {


        // Slanted line on the left
            topLeft:Vec2.fromXY(0, boxSize.y),
            topRight: Vec2.fromXY(boxSize.x * -0.25 , boxSize.y * 1.25),
        // First Bottom line Solid
            Left:  Vec2.fromXY(boxSize.x* -0.25,boxSize.y * 1.25),
            Right: Vec2.fromXY(boxSize.x * 0.26, boxSize.y * 1.25),
        // Dashed Line in the Middle
            MiddleLeft:  Vec2.fromXY(boxSize.x * 0.3, boxSize.y * 1.25),
            MiddleRight: Vec2.fromXY(boxSize.x * 0.9, boxSize.y * 1.25),
        // Second Bottom Line (Solid)
            Left2:  Vec2.fromXY(boxSize.x * 0.75, boxSize.y * 1.25),
            Right2: Vec2.fromXY(boxSize.x * 1.25, boxSize.y * 1.25),
        // Slanted line on the right
            bottomLeft: Vec2.fromXY(boxSize.x, boxSize.y),
            bottomRight: Vec2.fromXY(boxSize.x * 1.25, boxSize.y * 1.25)

    };
}

function renderGlyph(renderOpts) {

    var geom = createGeometry(renderOpts.size);
    var path1 = [

        'M' + geom.topLeft.toPathString(),    // Dashed Left Line
        'L' + geom.topRight.toPathString(),

        'M' + geom.bottomLeft.toPathString(),     // Dashed Right Line
        'L' + geom.bottomRight.toPathString(),

    ].join('');

    var path2 = [

        'M' + geom.Left.toPathString(),
        'L' + geom.Right.toPathString(),
                                                    // 2 Disjoined Solid Lines
        'M' + geom.Left2.toPathString(),
        'L' + geom.Right2.toPathString(),

    ].join('');

    var path3 = [

        'M' + geom.MiddleLeft.toPathString(),   // Dashed Line @ Bottom
        'L' + geom.MiddleRight.toPathString(),

    ].join('');


    // Specs for First Glyph
    let glyph1 = svg('path', {
        d: path1,
        'stroke': 'black',
        'fill': renderOpts.color || '#000000',
        'stroke-dasharray': "6,2",
        'stroke-width': renderOpts.thickness || '2px',
        'stroke-linejoin': 'round'
    })

    // Second Glyph (Solid Lines Only)
    let glyph2 = svg('path', {
        d: path2,
        'stroke': 'black',
        'fill': renderOpts.color || '#000000',
        'stroke-width': renderOpts.thickness ||'2px',
        'stroke-linejoin': 'round'
    })

    //Third Glyph
    let glyph3 = svg('path', {
        d: path3,
        'stroke': 'black',
        'fill': renderOpts.color || '#000000',
        'stroke-dasharray': "3,5",
        'stroke-width': renderOpts.thickness ||'2px',
        'stroke-linejoin': 'round'
    })

    return svg('g', [
        glyph1,
        glyph2,
        glyph3
    ])
}

export default {

    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: true,
    scale: Vec2.fromXY(1.0, 1.0),

}
