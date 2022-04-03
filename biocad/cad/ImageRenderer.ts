
import RenderContext from './RenderContext'
import Layout from './Layout'
import { Vec2 } from '@biocad/jfw/geom'
import { VNode, svg, toHTML } from '@biocad/jfw/vdom'
import SVGDefs from "biocad/cad/SVGDefs";
import request = require('request')

import TextEncodingShim = require('text-encoding-shim')
let TextEncoder = TextEncodingShim.TextEncoder

export enum ImageFormat {
    SVG,
    PDF,
    PPTX
}

export default class ImageRenderer implements RenderContext {

    layout:Layout
    scrollOffset:Vec2
    scaleFactor:number
    interactive:boolean

    constructor(layout:Layout) {
        this.layout = layout
        this.scrollOffset = Vec2.fromXY(0, 0)
    }

    render(format:ImageFormat):Promise<ArrayBuffer> {
        switch(format) {
            case ImageFormat.SVG:
                return Promise.resolve(this.renderSVG())
            case ImageFormat.PPTX:
                return this.renderPPTX()
            case ImageFormat.PDF:
                return this.renderPDF()
        }
    }

    private renderSVGString():string {

        let vnode:VNode = this.renderToVNode()

        return [
            //'<?xml version="1.0" encoding="UTF-8"?>',
            '<?xml version="1.0" encoding="iso-8859-1"?>',
            '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
            toHTML(vnode)
        ].join('\n')
    }

    private renderSVG():ArrayBuffer {
        return new TextEncoder().encode(this.renderSVGString())
    }

    private renderPDF():Promise<ArrayBuffer> {
        throw new Error('not implemented yet')
    }

    async renderPPTX():Promise<ArrayBuffer> {

        let svg = this.renderSVG()

        let r = await fetch('https://api.biocad.io/util/svg2pptx', {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            body: svg,
            headers: {
                'content-type': 'image/svg+xml'
            }
        })

        return r.arrayBuffer()
    }


    private renderToVNode():VNode {
        // TODO this is duplicated from LayoutThumbnail
        // should be factored out really
        //
        const svgElements:any[] = [
            SVGDefs.render()
        ]

        for(let depiction of this.layout.depictions) {

            if(depiction.isVisible()) {
                svgElements.push(depiction.render(this))
            }
        }

        let size:Vec2 = this.layout.getSize()

        size = size.multiply(this.layout.gridSize)

        return svg('svg', {
            version: '1.1',
            attributes: {
                xmlns: 'http://www.w3.org/2000/svg',
                'xmlns:xlink': 'http://w3.org/1999/xlink'
            }, 
            width: size.x + 'px',
            height: size.y + 'px',
            viewBox: '0 0 ' + size.x + ' ' + size.y
        }, svgElements)
    }
}

