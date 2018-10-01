
import { Rect, Vec2 } from 'jfw/geom'

import stringPixelWidth = require('string-pixel-width')

var svg = 'http://www.w3.org/2000/svg'

var hiddenSvg:any = null

// TODO don't allow this to grow indefinitely
var cache:{} = {}

/* TODO I hate this hack.  why can't we measure SVG text without creating DOM?
 */
export default function measureText(text, attr) {

    const cacheKey = JSON.stringify([text, attr])

    if(cache[cacheKey] !== undefined) {
        return cache[cacheKey]
    }

    if(typeof document !== 'undefined') {
        return (cache[cacheKey] = measureTextBrowser(text, attr))
    } else {
        return (cache[cacheKey] = measureTextNode(text, attr))
    }
}

function measureTextBrowser(text, attr) {

    if(hiddenSvg === null) {

        hiddenSvg = document.createElementNS(svg, 'svg')

        if(!hiddenSvg) {
            throw new Error('error creating hidden svg')
        }

        hiddenSvg.style.visibility = 'hidden'
        hiddenSvg.style.position = 'absolute'
        hiddenSvg.style.left = '-9999cm'
        hiddenSvg.style.top = '-9999cm'

        document.body.appendChild(hiddenSvg)
    }

    var textNode = document.createTextNode(text)

    var svgTextNode = document.createElementNS(svg, 'text')

    for(let attrName of Object.keys(attr)) {

        /* TODO: setAttributeNS?
         */
        svgTextNode.setAttribute(attrName, attr[attrName])
    }

    svgTextNode.appendChild(textNode)
    hiddenSvg.appendChild(svgTextNode)


    //console.log('svg bbox')
    //console.dir(hiddenSvg.getBBox())

    var rect = Rect.fromSvgBBox(hiddenSvg.getBBox())

    hiddenSvg.removeChild(svgTextNode)

    //console.log('text "' + text + '" measured as ' + rect.size())

    return rect.size()
}

function measureTextNode(text, attr) {

    let pt = parseInt(attr['font-size'].split('pt')[0])

    // this library completely ignores kerning and thus is inevitably going to
    // be incorrect, but it's a best effort for now and kinda works after some
    // magic number tweaking.
    //
    // TODO find a way to measure text in nodejs. freetype?
    //
    return Vec2.fromXY(stringPixelWidth(text, {
        //font: attr['font-family'],
        font: 'verdana',
        size: pt
    }) * 1.2, pt * 1.5)
}


