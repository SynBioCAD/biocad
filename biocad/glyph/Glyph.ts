
import Aptamer from '../../glyph_definitions/Aptamer.svg';
import AssemblyScar from '../../glyph_definitions/AssemblyScar.svg';
import BluntRestrictionSite from '../../glyph_definitions/BluntRestrictionSite.svg';
import CDS from '../../glyph_definitions/CDS.svg';
import Composite from '../../glyph_definitions/Composite.svg';
import DNACleavageSite from '../../glyph_definitions/DNACleavageSite.svg';
import DNALocation from '../../glyph_definitions/DNALocation.svg';
import DNAStabilityElement from '../../glyph_definitions/DNAStabilityElement.svg';
import EngineeredRegion from '../../glyph_definitions/EngineeredRegion.svg';
import Insulator from '../../glyph_definitions/Insulator.svg';
import NoGlyph from '../../glyph_definitions/NoGlyph.svg';
import NonCodingRNA from '../../glyph_definitions/NonCodingRNA.svg';
import NucleicAcidOneStrand from '../../glyph_definitions/NucleicAcidOneStrand.svg';
import OmittedDetail from '../../glyph_definitions/OmittedDetail.svg';
import Operator from '../../glyph_definitions/Operator.svg';
import OriginOfReplication from '../../glyph_definitions/OriginOfReplication.svg';
import OriginOfTransfer from '../../glyph_definitions/OriginOfTransfer.svg';
import OverhangSite3 from '../../glyph_definitions/OverhangSite3.svg';
import OverhangSite5 from '../../glyph_definitions/OverhangSite5.svg';
import PolyASite from '../../glyph_definitions/PolyASite.svg';
import Primer from '../../glyph_definitions/Primer.svg';
import Promoter from '../../glyph_definitions/Promoter.svg';
import RecombinationSite from '../../glyph_definitions/RecombinationSite.svg';
import RibosomeEntrySite from '../../glyph_definitions/RibosomeEntrySite.svg';
import Signature from '../../glyph_definitions/Signature.svg';
import Spacer from '../../glyph_definitions/Spacer.svg';
import StickyEndRestrictionEnzymeCleavageSite3 from '../../glyph_definitions/StickyEndRestrictionEnzymeCleavageSite3.svg';
import StickyEndRestrictionEnzymeCleavageSite5 from '../../glyph_definitions/StickyEndRestrictionEnzymeCleavageSite5.svg';
import Terminator from '../../glyph_definitions/Terminator.svg';
import Unspecified from '../../glyph_definitions/Unspecified.svg'

let glyphSvgs = {
    Aptamer,
    AssemblyScar,
    BluntRestrictionSite,
    CDS,
    Composite,
    DNACleavageSite,
    DNALocation,
    DNAStabilityElement,
    EngineeredRegion,
    Insulator,
    NoGlyph,
    NonCodingRNA,
    NucleicAcidOneStrand,
    OmittedDetail,
    Operator,
    OriginOfReplication,
    OriginOfTransfer,
    OverhangSite3,
    OverhangSite5,
    PolyASite,
    Primer,
    Promoter,
    RecombinationSite,
    RibosomeEntrySite,
    Signature,
    Spacer,
    StickyEndRestrictionEnzymeCleavageSite3,
    StickyEndRestrictionEnzymeCleavageSite5,
    Terminator,
    Unspecified
}

import { VNode, svg } from '@biocad/jfw/vdom'

import * as math from 'mathjs'

import et = require('elementtree');
import { Matrix, Vec2 } from '@biocad/jfw/geom'

export interface GlyphRenderOpts {
	color:string
	lineColor:string
	backgroundFill:string
	thickness:number
	width:number
	height:number
	params:any
}

export default class Glyph {

    svgTree:any

    defaultParameters = {}
    soTerms:string[]

    constructor(public glyphName:string)  {
        let svgSource:string|undefined = glyphSvgs[glyphName]

        if(svgSource === undefined)
            throw new Error('glyph not found: ' + glyphName)

	svgSource = atob(svgSource.split('base64,')[1])
        
        this.svgTree = et.parse(svgSource)

        let svgNode = this.svgTree._root

        this.soTerms = svgNode.attrib.soterms.split(',')

        for(let def of svgNode.attrib['parametric:defaults'].split(';')) {
            let k = def.split('=')[0]
            let v = parseFloat(def.split('=')[1])

            if(k.indexOf('pad_') === 0) {
                v = 0
            }

            this.defaultParameters[k] = v
        }


    }

    static async load(glyphName:string):Promise<Glyph> {

        return new Glyph(glyphName)
    }

	// a few glyphs are defined to have a fixed aspect ratio, in which case the height
	// is set based on the width, and the height is ignored).
    hasFixedAspect():boolean {
	    return !this.defaultParameters['height']
    }


    getSizeForRequested(requestedSize:Vec2):Vec2 {
	if(!this.hasFixedAspect()) {
		// glyphs without a fixed aspect ratio
		// can fill any bbox. I think ??
		//
		// console.log('Glyph ' + this.glyphName + ' has no fixed aspect')
		return requestedSize
	} else {
		// console.log('Glyph ' + this.glyphName + ' has fixed aspect')
		let height = this.getFixedAspectHeight({width: requestedSize.x})
		return Vec2.fromXY(requestedSize.x, height)
	}
    }

    getFixedAspectHeight(params:any):number {
        let svgNode = this.svgTree._root
	let paramMap = { ...this.defaultParameters, ...params }

        let bboxNode = svgNode.findall("rect[@class='bounding-box']")[0]

	let bboxH = this.calculate(paramMap, bboxNode.attrib['parametric:height'])

	return parseFloat(bboxH)
    }

    // the aspect ratio hidden in the default parametric width/height of the svg
    //
    getSuggestedDefaultAspect():number {

	// a few glyphs are defined to have a fixed aspect ratio, in which case the height
	// is set based on the width, and the height is ignored).

	let w = this.defaultParameters['width']*1.0
	let h = this.defaultParameters['height']*1.0

	if(isNaN(h) || isNaN(w)) {
		return 1
	}

	return h/w

    }

    getAscent(opts:GlyphRenderOpts):number {

        let svgNode = this.svgTree._root
	let paramMap = { ...this.defaultParameters, width: opts.width, height: opts.height, ...opts.params }

        let bboxNode = svgNode.findall("rect[@class='bounding-box']")[0]

	let bboxY = this.calculate(paramMap, bboxNode.attrib['parametric:y'])

	// The bboxNode should be a bounding box rect of the whole glyph.
	//
	// So if the glyph is rendeded at Y 0, and its Y position is < 0, its Y position is the ascent
	//   i.e. if we render it at Y 0 and the Y pos is -50, the ascent is 50
	//   then if we want to draw it at some arbitrary position like Y 100, we actually need to draw it at Y-ascent=50 to make it appear where we want
	//
	// We handle this ascent in two places. First, the render function here always renders where you ask it to exactly. It does this by subtracting
	// the ascent.
	//
	// Secondly, the backbone strategy uses the ascent to determine where to place the glyph relative to the backbone line.
	//

	// console.log('Ascent of glyph ' + this.glyphName + ' is ' + -bboxY);

	return -bboxY;
    }

    // When we draw a glyph, we give it a color. But what to use that color for?
    /// A promoter, for instance, is all lines. So we use the color to color those lines (the stroke color)
    /// But a CDS is a filled box. So we use the color to fill the box.
    // And then an insulator is a filled box surrounded by a line. So again we use the color to fill the box
    // This function determines which one of the above types the glyph is, so we can determine what to use the color for.
    //
    getGlyphClassification():'LINEY'|'SHAPEY'|'MIXED' {

	let hasLines = false
	let hasShapes = false

	let crawl = (node) => {
		for(let ch of node._children) {
			let classes = ch.attrib['class'] && ch.attrib['class'].split(' ')
			if(classes) {
				if(classes.indexOf('unfilled-path') !== -1) {
					hasLines = true
				}
				if(classes.indexOf('filled-path') !== -1) {
					hasShapes = true
				}
			}
		}

	}

	crawl(this.svgTree._root)

	if(hasLines && hasShapes) {
		return 'MIXED'
	}

	if(hasLines) {
		return 'LINEY'
	}

	return 'SHAPEY'

    }

    render(opts:GlyphRenderOpts):VNode {

        let svgNode = this.svgTree._root
	let paramMap = { ...this.defaultParameters, width: opts.width, height: opts.height, ...opts.params }

	let classf = this.getGlyphClassification()



        // let baselineNode = svgNode.findall("path[@class='baseline']")[0]
        // let bboxNode = svgNode.findall("rect[@class='bounding-box']")[0]



        // console.dir(bboxNode)

        // return svg('g',{
	// 	transform: Matrix.translation(Vec2.fromXY(-bboxX, -bboxY)).toSVGString()
	//  }, [
	// 	 svgNode._children.filter(filterNodes).map(renderNode)
	// ])

        let renderNode = (node:any):VNode => {

            let attribs = {}
	    let style = {}

	    if(node.attrib['style']) {
		    for (let match of node.attrib['style'].matchAll(/(.*?):(.*?);/g)) {
			    style[match[1]] = match[2]
		    }
	    }

	    let classes = node.attrib['class'] && node.attrib['class'].split(/\s+/)

	    if(classes && classes.indexOf('filled-path') !== -1) {
		    style['fill'] = opts.color
	    }
	    if(classes && classes.indexOf('filled-background-path') !== -1) {
		    style['fill'] = opts.backgroundFill
	    }

	    if(classes && classes.indexOf('unfilled-path') !== -1) {
		if(style['stroke-width'])
			style['stroke-width'] = opts.thickness + 'pt'
		if (style['stroke'])
			style['stroke'] = classf === 'LINEY' ? opts.color : opts.lineColor
	    } else {
		if (style['stroke'])
			style['stroke'] = 'none'
	    }


            for(let attrib of Object.keys(node.attrib)) {
                let value = node.attrib[attrib]

		// not a parametric attrib or style?
                if(attrib.indexOf('parametric:') !== 0 && attrib !== 'style') {
                    attribs[attrib] = value
                }
            }

            for(let attrib of Object.keys(node.attrib)) {
                let value = node.attrib[attrib]
                if(attrib.indexOf('parametric:') === 0) {
                    let actualAttrib = attrib.split(':')[1]
                    attribs[actualAttrib] = this.calculate(paramMap, value)
                }
            }


	    let styleString = ''
	    for(let k of Object.keys(style)) {
		    styleString += k + ':' + style[k] + ';'
	    }
	    attribs['style'] = styleString

	//     if(attribs['d'] && attribs['d'].indexOf('}') !== -1) {
	//      console.log(JSON.stringify(attribs, null, 2))
	//     }

	return svg(node.tag, attribs, node._children.filter(filterNodes).map(renderNode));
	}

        let g = svg('g',{
		// biocad wants glyphs to render with the top at y=0, not the backbone at y=0
		//
		transform: Matrix.translation(Vec2.fromXY(0, this.getAscent(opts))).toSVGString()
		}, 
			svgNode._children.filter(filterNodes).map(renderNode)
		)

	return g;

        function filterNodes(node:any):boolean {
            return node.attrib.class !== 'baseline' && node.attrib.class !== 'bounding-box'
        //     return true
        }


    }

        private calculate(paramMap:any, expression:string) {

		// let vars = expression.matchAll(/[a-zA-Z]+/g)

		// for(let n = 1; n < vars.length; ++ n) {
		// 	if(paramMap[n] === undefined) {
		// 		throw new Error('param ' + vars[n] + ' is missing')
		// 	}
		// }


            return expression.replace(/\{(.+?)\}/g, (match, g1) => {
                return math.evaluate(g1, paramMap)
            })
        }


    static glyphs: Glyph[]

    static async loadGlyphs():Promise<void> {

	console.log('loadGlyphs')

        Glyph.glyphs = await Promise.all(Object.keys(glyphSvgs).map(glyphName => Glyph.load(glyphName)))

	console.log('loadGlyphs done')

    }

    static getGlyph(glyphName:string):Glyph {

        return this.glyphs.filter(g => g.glyphName === glyphName)[0]


    }

    static render(glyphType:string, opts:GlyphRenderOpts):VNode {

        let glyph = Glyph.getGlyph(glyphType)

        if(glyph === undefined) {
            throw new Error('glyph not found: ' + glyphType)
        }
        
        return glyph.render(opts)
    }


}
