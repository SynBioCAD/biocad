
import { Vec2, Rect, Matrix } from 'jfw/geom'
import { svg } from 'jfw/vdom'

function renderGlyph(renderOpts) {

    const d = 'M615.4,479.4c-17.3,0-31.2,14-31.2,31.2c0,3.6,0.6,7.1,1.8,10.4l-22.3,22.3c-20.5-11.3-46.8-8.3-64.2,9.1' + 
	'c-21.1,21.1-21.1,55.2,0,76.3c8,8,18,13,28.4,14.9v39.6h19.9v-39.7c10.3-1.9,20.1-6.9,28.1-14.9c17.4-17.4,20.4-43.7,9.1-64.2' +
	'l23.5-23.5c2.3,0.5,4.6,0.8,7,0.8c17.3,0,31.2-14,31.2-31.2C646.7,493.4,632.7,479.4,615.4,479.4z'
    
    var transform = Matrix.identity()
    
    transform = transform.scale(renderOpts.size.divide(Vec2.fromXY(167, 207.8)))
    transform = transform.translate(Vec2.fromXY(-481.7, -477.4))

    return svg('path', {
        d: d,
        'fill': renderOpts.color || 'blue',
        'stroke': 'black',
        'stroke-width': '3',
        'stroke-linecap': 'round',
        'stroke-miterlimit': 10,
        transform: transform.toSVGString()
    })
}

export default {
    render: renderGlyph,
    backbonePlacement: 'top',
    isContainer: false,
    scale: Vec2.fromXY(1.0, 1.0)
}



