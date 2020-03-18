
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

import { VNode, svg } from 'jfw/vdom'

import * as math from 'mathjs'

import et = require('elementtree');

export default class Glyph {

    svgTree:any

    defaultParameters = {}
    soTerms:string[]

    constructor(public glyphName:string)  {
        let svgSource:string|undefined = glyphSvgs[glyphName]

        if(svgSource === undefined)
            throw new Error('glyph not found: ' + glyphName)
        
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

        let baselineNode = svgNode.findall("path[@class='baseline']")[0]
        let bboxNode = svgNode.findall("rect[@class='bounding-box']")[0]

        console.dir(bboxNode)

    }

    static async load(glyphName:string):Promise<Glyph> {

        return new Glyph(glyphName)
    }

    render(params:any):VNode {

        let svgNode = this.svgTree._root

        let paramMap = Object.assign({}, this.defaultParameters)

        paramMap = Object.assign(paramMap, params)

        return svgNode._children.filter(filterNodes).map(renderNode)

        function renderNode(node:any):VNode {

            let attribs = {}

            for(let attrib of Object.keys(node.attrib)) {
                let value = node.attrib[attrib]
                if(attrib.indexOf('parametric:') !== 0) {
                    attribs[attrib] = value
                }
            }

            for(let attrib of Object.keys(node.attrib)) {
                let value = node.attrib[attrib]
                if(attrib.indexOf('parametric:') === 0) {
                    let actualAttrib = attrib.split(':')[1]
                    attribs[actualAttrib] = calculate(value)
                }
            }

            return svg(node.tag, attribs, node._children.filter(filterNodes).map(renderNode))
        }

        function filterNodes(node:any):boolean {
            // return node.attrib.class !== 'baseline' && node.attrib.class !== 'bounding-box'
            return true
        }

        function calculate(expression:string) {
            return expression.replace(/\{(.+?)\}/g, (match, g1) => {
                return math.evaluate(g1, paramMap)
            })
        }

    }


    static glyphs: Glyph[]

    static async loadGlyphs():Promise<void> {

        Glyph.glyphs = await Promise.all(Object.keys(glyphSvgs).map(glyphName => Glyph.load(glyphName)))

    }

    static getGlyph(glyphName:string):Glyph {

        return this.glyphs.filter(g => g.glyphName === glyphName)[0]


    }

    static render(glyphType:string, params:any):VNode {

        let glyph = Glyph.getGlyph(glyphType)

        if(glyph === undefined) {
            throw new Error('glyph not found: ' + glyphType)
        }
        
        return glyph.render(params)
    }


}
