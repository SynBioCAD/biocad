
import { Vec2, LinearRangeSet, LinearRange } from '@biocad/jfw/geom'

import { Specifiers } from 'bioterms'
import Depiction, { Orientation } from "biocad/cad/Depiction";
import ComponentDepiction from "biocad/cad/ComponentDepiction";
import { getEllipsePoint } from '@biocad/jfw/geom';
import FeatureLocationDepiction from "biocad/cad/FeatureLocationDepiction";
import { S3SequenceFeature, S3Range, S3Component, S3Sequence, S3Identified } from "sbolgraph"

export default function circularStrategy(parent:ComponentDepiction, children:Depiction[], padding) {

    if(!parent.depictionOf)
        throw new Error('???')

    const component:S3Component = parent.getDefinition()
    const sequence:S3Sequence|undefined = component.sequences[0]

    const midPoint:Vec2 = parent.size.multiplyScalar(0.5)
    const radius:Vec2 = parent.size.multiplyScalar(0.5)

    const seqLength:number = sequence && sequence.elements ? sequence.elements.length : 0

    const rings:LinearRangeSet[] = [
        new LinearRangeSet()
    ]

    for(let child of children) {

        var minStart = 999999
        var maxEnd = -999999

        if (!child.depictionOf)
            throw new Error('???')

        const sequenceAnnotation:S3SequenceFeature = child.depictionOf as S3SequenceFeature

        var location:S3Identified|null = null
        
        if(child instanceof ComponentDepiction)
            location = (child as ComponentDepiction).location || null
        else if(child instanceof FeatureLocationDepiction)
            location = (child as FeatureLocationDepiction).location || null

        if(location && location instanceof S3Range) {

            const range:S3Range = location as S3Range

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined && end !== undefined) {

                var normalizedStart:number = start / seqLength
                var normalizedEnd:number = end / seqLength

                if(normalizedEnd < normalizedStart) {
                    const tmp:number = normalizedEnd
                    normalizedEnd = normalizedStart
                    normalizedStart = tmp
                }

                for(var ringN = 0 ;;) {

                    const ring = rings[ringN]

                    if(ring.intersectsRange(new LinearRange(normalizedStart, normalizedEnd))) {
                        if(++ ringN === rings.length) {
                            rings.push(new LinearRangeSet())
                        }
                    } else {
                        ring.push(new LinearRange(normalizedStart, normalizedEnd))
                        break
                    }
                }

                //console.log('ringN ' + ringN)

                child.offset = getEllipsePoint(midPoint, radius.subtractScalar(ringN), normalizedStart)
                child.size = getEllipsePoint(midPoint, radius.subtractScalar(ringN), normalizedEnd).subtract(child.offset)
            }


        }
    }



}



