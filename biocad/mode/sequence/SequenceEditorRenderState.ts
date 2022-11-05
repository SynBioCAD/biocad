import { S3Component, S3Sequence, S3SequenceFeature, S3Range, S3Identified, S3Location, S3SubComponent, S3Feature, sbol3 } from "sboljs";

import assert = require('assert')

import { colors } from '@biocad/jfw/graphics'
import circularIterator = require('circular-iterator')

import { Vec2, Matrix, LinearRangeSet, LinearRange, Rect } from '@biocad/jfw/geom'

import { Types, Specifiers } from 'bioterms'

import SequenceAnalyzer, { MaybeAnnotation } from './SequenceAnalyzer'
import SequenceEditorLine from "biocad/mode/sequence/SequenceEditorLine";
import IdentifiedLinearRange from "biocad/mode/sequence/IdentifiedLinearRange";

import binarysearch = require('binarysearch')


/* Once the sequence editor has been rendered, we need to know where everything
 * was drawn so that e.g. a cursor position can be mapped to a position in the
 * sequence.
 * 
 * This class was supposed to keep track of that, but became rather unruly.
 */
export default class SequenceEditorRenderState {

    component:S3Component
    sequence:S3Sequence
    elements:string
    charSize:number
    charsPerRow:number
    annotatedRanges:LinearRangeSet
    annotationHeight:number
    annotationOffset:number
    paddingTop:number
    paddingBetweenLines:number
    paddingBetweenStrands:number
    lines:Array<SequenceEditorLine>
    marginWidth:number
    rangeColors:any
    allLinesBBox:Rect
    annoLabelBBoxes:Array<[S3Feature, Rect]>
    annoHoverUris:Set<string>
    rangeDescriptors:Map<string, string>

    constructor(sequenceEditor) {

        const component = sequenceEditor.component
        assert(component)

        this.component = component

        // TODO multiple sequence support
        this.sequence = component.sequences[0]

        this.elements = this.sequence ? (this.sequence.elements || '') : ''
        this.charSize = sequenceEditor.charSize
        this.charsPerRow = sequenceEditor.charsPerRow
        this.paddingBetweenStrands = sequenceEditor.paddingBetweenStrands
        this.annotatedRanges = getAnnotatedRanges(component)
        this.annotationHeight = sequenceEditor.annotationHeight
        this.annotationOffset = 4

        this.rangeDescriptors = new Map()

        this.annotatedRanges.forEach((range:LinearRange) => {

            const ir = range as IdentifiedLinearRange

            var s = this.rangeDescriptors.get(ir.thing.uri) || ''

            var start = ir.start + 1
            var end = ir.end


            var str = start + '..' + end

            //if (ir.end < ir.start)
                //str += ' (reverse complement)'

            if(s !== '')
                s += '; '
            
            s += str

            this.rangeDescriptors.set(ir.thing.uri, s)

        })


        this.annoLabelBBoxes = []
        this.annoHoverUris = new Set()

        this.paddingTop = sequenceEditor.paddingTop
        this.paddingBetweenLines = 16
        this.marginWidth = sequenceEditor.marginWidth
        this.rangeColors = Object.create(null)
        this.lines = []

        const rangeColors = {}
        const colorIterator = circularIterator(colors.palettes.pastel)

        this.annotatedRanges.sortWithComparator((a:LinearRange, b:LinearRange) => {

            return Math.abs(a.start - a.end) - Math.abs(b.start - b.end)
            
        }).ranges.forEach((_range:LinearRange) => {

            var range:IdentifiedLinearRange = _range as IdentifiedLinearRange

            if(this.rangeColors[range.thing.uri] === undefined) {
                this.rangeColors[range.thing.uri] = colorIterator.next().value
            }
        })




        var seqOffset:number = 0
        var yPos:number = this.paddingTop

        var line:SequenceEditorLine = new SequenceEditorLine(0)

        this.lines.push(line)

        for(;;) {

            const seqEnd:number = seqOffset + this.charsPerRow

            this.annotatedRanges.forEach((range:LinearRange) => {

                if(!range.intersectsOrTouchesRange(new LinearRange(seqOffset, seqEnd)))
                    return

                var ringN = 0

                if(line.annoRings.length === 0) {
                    line.annoRings.push(new LinearRangeSet())
                }

                for(;;) {

                    var ring = line.annoRings[ringN]

                    var intersectingRanges = ring.intersectingRangesWithRange(range)

                    if(intersectingRanges.length === 0)
                        break

                    ++ ringN

                    if(line.annoRings[ringN] === undefined)
                        line.annoRings[ringN] = new LinearRangeSet()
                }
                
                line.annoRings[ringN].push(range)
            })
            
            const lineHeight:number = this.charSize + this.paddingBetweenStrands + this.charSize
                        + this.annotationOffset
                        + (line.annoRings.length * this.annotationHeight)
                        + this.paddingBetweenLines

            const lineWidth:number = this.charSize * this.charsPerRow

            const xy:Vec2 = Vec2.fromXY(this.marginWidth, yPos)

            line.bbox = new Rect(xy, xy.add(Vec2.fromXY(lineWidth, lineHeight)))

            yPos += lineHeight

            seqOffset += this.charsPerRow

            if(seqOffset >= this.elements.length) {
                break
            }


            line = new SequenceEditorLine(seqOffset)
            this.lines.push(line)
        }
        
        for(let line of this.lines) {

            if(!this.allLinesBBox)
                this.allLinesBBox = line.bbox
            else
                this.allLinesBBox = this.allLinesBBox.surround(line.bbox)

        }

        if(!this.allLinesBBox) {
            this.allLinesBBox = new Rect()
        }

    }

    offsetToElementOffset(offset:Vec2, bWithMargins:boolean):number {

        const elemPos = Vec2.fromXY(
            offset.x - (bWithMargins ? this.marginWidth : 0),
            offset.y - (bWithMargins ? this.paddingTop : 0),
        )

        //if(elemPos.y > this.lines[this.lines.length - 1].bbox.topLeft.y) {
            //return (this.elements || '').length
        //}


        if(elemPos.x > this.allLinesBBox.bottomRight.x)
            return -1

        const found:number = binarysearch(this.lines, elemPos.y, (line:SequenceEditorLine, find:number) => {

            if(find > line.bbox.bottomRight.y)
                return -1

            if(find < line.bbox.topLeft.y)
                return 1

            return 0
        })

        if(found === -1) {
            return -1
        }

        const line = this.lines[found]

        const elementOffset = line.seqOffset + Math.floor((offset.x - this.lines[found].bbox.topLeft.x) / this.charSize)

        if(elementOffset > this.elements.length)
            return -1

        if(elementOffset < 0)
            return 0

        return elementOffset
    }

    elementOffsetToLineNumber(elementOffset:number):number {

        const found:number = binarysearch(this.lines, elementOffset, (line:SequenceEditorLine, find:number) => {

            if(find > (line.seqOffset + this.charsPerRow))
                return -1

            if(find < line.seqOffset)
                return 1

            return 0
        })

        return found
    }

    elementOffsetToLine(elementOffset:number):SequenceEditorLine|null {

        const found:number = this.elementOffsetToLineNumber(elementOffset)

        if(found === -1)
            return null

        return this.lines[found]
    }

    elementOffsetToRect(elementOffset:number, bWithMargins:boolean):Rect {

        const line:SequenceEditorLine|null = this.elementOffsetToLine(elementOffset)

        if(line === null)
            return new Rect()

        const remainder:number = elementOffset - line.seqOffset
           
        const topLeft:Vec2 = line.bbox.topLeft.add(Vec2.fromXY(remainder * this.charSize, 0))

        return new Rect(
            topLeft,
            Vec2.fromXY(topLeft.x, line.bbox.bottomRight.y)
        )
    }


    totalSize() {

	let everythingBBox = this.allLinesBBox

	for(let alb of this.annoLabelBBoxes) {
		everythingBBox = everythingBBox.surround(alb[1])
	}

	return everythingBBox.size()
	}
}


function getAnnotatedRanges(component:S3Component) {

    const ranges = new LinearRangeSet()

    const thingsWithLocations = component.annotatedLocations

    console.log('component has ' + component.annotatedLocations.length + ' annotation(s)')

    addRangesFromComponent(0, component)

    function addRangesFromComponent(base:number, component:S3Component) {

        for(let feature of component.sequenceFeatures) {

            for(let location of feature.locations) {

                switch(location.objectType) {

                    case Types.SBOL3.Range:

                        var range:S3Range = new S3Range(sbol3(location.graph), location.subject)

                        const start:number|undefined = range.start
                        const end:number|undefined = range.end

                        if(start !== undefined && end !== undefined) {
                            ranges.push(new IdentifiedLinearRange(base + start - 1, base + end, range, range.displayName || '??'))
                        }

                        break


                    default:
                        console.error('?11 ' + location.objectType)
                        break

                }
            }

        }

        for(let subComponent of component.subComponents) {

            for(let location of subComponent.locations) {

                switch(location.objectType) {

                    case Types.SBOL3.Range:

                        var range:S3Range = new S3Range(sbol3(location.graph), location.subject)

                        const start:number|undefined = range.start
                        const end:number|undefined = range.end

                        if(start !== undefined && end !== undefined) {
                            ranges.push(new IdentifiedLinearRange(base + start - 1, base + end, range, range.displayName || '??'))
                            addRangesFromComponent(base + start - 1, subComponent.instanceOf)
                        }

                        break

                    default:
                        console.error('?11 ' + location.objectType)
                        break

                }
            }

        }
    }

    /* longest annotations first (those go closest to the elements)
     */
    return new LinearRangeSet(ranges.ranges.sort((a, b) => {                      

        const lenA = Math.abs(a.start - a.end)                                  
        const lenB = Math.abs(b.start - b.end)                                  

        return lenB - lenA                                                      

    }))
}


