

import assert from 'power-assert'

import { Vec2, LinearRangeSet, LinearRange } from '@biocad/jfw/geom'

import { Specifiers } from 'bioterms'
import Depiction, { Orientation } from "biocad/cad/layout/Depiction";
import ComponentDepiction from "biocad/cad/layout/ComponentDepiction";
import { S3SequenceFeature, S3Range, S3SubComponent, S3Constraint, S3Identified, S3Component, S3Location } from "sboljs"
import Layout from "biocad/cad/layout/Layout";
import BackboneDepiction from '../../BackboneDepiction';
import FeatureLocationDepiction from 'biocad/cad/layout/FeatureLocationDepiction';
import LabelDepiction from 'biocad/cad/layout/LabelDepiction';
import LocationableDepiction from 'biocad/cad/layout/LocationableDepiction';


let minGridWidth = 2

interface Layer {
    n:number
    backboneY:number
    children:Positioned[]
    rangesUsedForward:LinearRangeSet
    rangesUsedReverse:LinearRangeSet
    height:number
}

interface Positioned {
    object:Depiction
    range:LinearRange
    forward:boolean
    layer:Layer
}

export default function backboneStrategy(_parent:Depiction, children:Depiction[], padding) {

    let opts = {
        forceMinWidth: true,
        omitEmptySpace: true
    }

    if(! (_parent instanceof BackboneDepiction)) {
        throw new Error('???')
    }

    let backbone:BackboneDepiction = _parent as BackboneDepiction

    let layout = backbone.layout

    let cd = backbone.depictionOf

    if(cd instanceof S3SubComponent) {
        cd = cd.instanceOf
    }

    if(! (cd instanceof S3Component)) {
        throw new Error('bb not instanceOf a CD')
    }


    let backboneElements = backbone.children.filter((child) => {
        return ! (child instanceof LabelDepiction)
    })


    // Sort so that important stuff e.g. transcriptional machinery gets positioned
    // first (closest to the backbone)
    // 
    backboneElements.sort((a, b) => {
        let aDOf = a.depictionOf
        let bDOf = b.depictionOf
        if(!aDOf || !bDOf) {
            throw new Error('no depictionOf when sorting')
        }
        return score(bDOf) - score(aDOf)
    })


    let findElement = (uri: string): number => {

        for (let i = 0; i < backboneElements.length; ++i) {
            let element = backboneElements[i]
            let dOf = element.depictionOf

            if(!dOf) {
                continue
            }

            if (dOf instanceof S3Location) {

                let location: S3Location = dOf as S3Location
                let containingObject: S3Identified | undefined = location.containingObject

                if (containingObject && containingObject.uri === uri) {
                    return i
                }

            } else {
                if (dOf.uri === uri)
                    return i
            }
        }

        return -1
    }


    let backboneLength = 0

    if (cd.sequences.length > 0 && cd.sequences[0].elements) {
        backboneLength = cd.sequences[0].elements.length * layout.bpToGridScale
    }


    let childToPositioned:Map<Depiction, Positioned> = new Map()

    let uriToDepiction = (uri) => {
        let depictions = layout.getDepictionsForUri(uri)

        for(let d of depictions) {
            if(d.parent === backbone) {
                return d
            }
        }

        throw new Error('not found')
    }

    let allRangesUsed = new LinearRangeSet()

    let layers:Map<number, Layer> = new Map()

    let minLayerN = 0
    let maxLayerN = 0

    let layerForRange = (range:LinearRange, forward:boolean):Layer => {

        let n = 0

        for(;;) {

            let layer = layers.get(n)

            if(!layer) {
                layer = {
                    n,
                    backboneY: 0,
                    height: 0,
                    children: [],
                    rangesUsedForward: new LinearRangeSet(),
                    rangesUsedReverse: new LinearRangeSet()
                }
                layers.set(n, layer)
                minLayerN = Math.min(n, minLayerN)
                maxLayerN = Math.max(n, maxLayerN)
            }

            if(forward) {
                if(!layer.rangesUsedForward.intersectsRange(range)) {
                    return layer
                }
            } else {
                if(!layer.rangesUsedReverse.intersectsRange(range)) {
                    return layer
                }
            }

            // move upwards for forward annotations, downwards for reverse
            if(forward)
                -- n
            else
                ++ n
        }

    }

    let place = (object: Depiction, range: LinearRange, forward: boolean) => {

        if (childToPositioned.has(object)) {
            throw new Error('attempted to position object twice')
        }

        let layer = layerForRange(range, forward)

        if (forward)
            layer.rangesUsedForward.push(new LinearRange(range.start, range.end))
        else
            layer.rangesUsedReverse.push(new LinearRange(range.start, range.end))

        allRangesUsed.push(new LinearRange(range.start, range.end))

        let positioned = { object, range, forward, layer }

        layer.children.push(positioned)
        childToPositioned.set(object, positioned)
    }



    // 0. position any explicitly positioned elements
    for (let element of backboneElements) {
        if(! (element instanceof LocationableDepiction))
            continue

        if(element.offsetExplicit) {
            let start = element.offset.x
            let end = element.offset.x + element.size.x
            let range = new LinearRange(start, end)
            let forward = element.orientation === Orientation.Forward
            place(element, range, forward)
        }
    }


    // 1. position all fixed
    for (let element of backboneElements) {
        if(! (element instanceof LocationableDepiction))
            continue

        // unless already positioned bc of explicit offset
        if(childToPositioned.has(element))
            continue

        let location = element.location
        if (location instanceof S3Range && location.isFixed()) {
            if (!location.start) {
                throw new Error('???')
            }
            let start = location.start * layout.bpToGridScale
            let end = location.end ? location.end * layout.bpToGridScale : location.start + 0.0003
            let forward = location.orientation !== Specifiers.SBOL3.Orientation.ReverseComplement

            let range = new LinearRange(start, end).normalise()

            place(element, range, forward)
        }
    }

    // 2. position all constrained that reference fixed
    /// ... and constrained that reference the former, recursively
    /// (keep going until we can't position anything else)
    //
    for (; ;) {
        let doneSomething = false
        for (let constraint of cd.sequenceConstraints) {
            let s = constraint.constraintSubject
            let o = constraint.constraintObject
            let r = constraint.constraintRestriction

            let sDep = uriToDepiction(s.uri)
            let oDep = uriToDepiction(o.uri)

            if(! (oDep instanceof LocationableDepiction)) {
                throw new Error('oDep not a LocationableDepiction')
            }
            if(! (sDep instanceof LocationableDepiction)) {
                throw new Error('sDep not a LocationableDepiction')
            }

            let positionedS = childToPositioned.get(sDep)
            let positionedO = childToPositioned.get(oDep)

            if (positionedS) {
                if (positionedO) {
                    continue
                }

                // s done, o not
                let width = oDep.proportionalWidth

                if (r === Specifiers.SBOL3.Constraint.Precedes) {

                    // place o AFTER s because s precedes o
                    if (positionedS.forward) {
                        // forward; place o to the right of s
                        place(oDep, new LinearRange(positionedS.range.end, positionedS.range.end + width), true)
                    } else {
                        // reverse; place o to the left of s
                        place(oDep, new LinearRange(positionedS.range.start - width, positionedS.range.start), false)
                    }
                    doneSomething = true
                }

            } else if (positionedO) {
                if (positionedS) {
                    continue
                }
                // o done, s not

                let width = sDep.proportionalWidth

                if (r === Specifiers.SBOL3.Constraint.Precedes) {

                    // place s BEFORE o because s precedes o
                    if (positionedO.forward) {
                        // forward; place s to the left of o
                        place(sDep, new LinearRange(positionedO.range.start - width, positionedO.range.start), true)
                    } else {
                        // reverse; place s to the right of o
                        place(sDep, new LinearRange(positionedO.range.end, positionedO.range.end + width), false)
                    }

                    doneSomething = true
                }

                doneSomething = true
            } else {
                // neither done; leave for later
                continue
            }
        }
        if (!doneSomething)
            break
    }

    // if there are any left they have no relation to the fixed
    // locations whatsoever, so need to be sorted purely using
    // constraints

    // prevent infinite loop on cyclic constraints
    let maxIters = 10

    // TODO: forward/reverse?

    for (let i = 0; i < maxIters; ++i) {
        let doneSomething = false
        for (let constraint of cd.sequenceConstraints) {
            let subjectIdx = findElement(constraint.constraintSubject.uri)
            let objIdx = findElement(constraint.constraintObject.uri)
            let restriction = constraint.constraintRestriction
            if (subjectIdx === -1 || objIdx === -1) {
                console.warn('constraint: missing s/o:',
                    constraint.constraintSubject.uri, subjectIdx, constraint.constraintObject.uri, objIdx)
                continue
            }

            let subj = backboneElements[subjectIdx]
            let obj = backboneElements[objIdx]


            if (restriction === Specifiers.SBOL3.Constraint.Precedes) {
                move(backboneElements, subjectIdx, objIdx)
            }
        }
        if (!doneSomething)
            break
    }

    let constraintElements =
        backboneElements.filter((element) => !childToPositioned.has(element))

    // they're now sorted and filtered out, but where does the first one go?
    // 0 I guess?
    let x = 0
    for (let element of constraintElements) {

        if(! (element instanceof LocationableDepiction)) {
            throw new Error('element not a LocationableDepiction')
        }

        let width = element.proportionalWidth

        width = Math.max(width, minGridWidth)

        // TODO: orientation - would come from the location
        place(element, new LinearRange(x, x + width), true)

        x = x + width
    }

    for (let layer of layers.values()) {
        layer.rangesUsedForward.forEach((range) => {
            backboneLength = Math.max(backboneLength, range.end)
        })
        layer.rangesUsedReverse.forEach((range) => {
            backboneLength = Math.max(backboneLength, range.end)
        })
    }

    allRangesUsed = allRangesUsed.sort()




    let entireBackboneRange = new LinearRange(0, backboneLength)

    for(let child of children) {

        if(!(child instanceof ComponentDepiction) && !(child instanceof FeatureLocationDepiction)) {
            // label
            continue
        }

        let positioned = childToPositioned.get(child)

        if(!positioned)  {
            throw new Error('???')
        }

        let paddingLength = child.size.x - child.proportionalWidth

        if(paddingLength > 0) {

            let chop = new LinearRange(positioned.range.start + 0.0001, positioned.range.start + 0.0002)

            chopRange(allRangesUsed.ranges, chop, paddingLength)

            for(let layer of layers.values()) {
                chopRange(layer.rangesUsedForward.ranges, chop, paddingLength)
                chopRange(layer.rangesUsedReverse.ranges, chop, paddingLength)
                chopRange(layer.children.map((child) => child.range), chop, paddingLength)
            }

            chopRange([entireBackboneRange], chop, paddingLength)

        }

    }

    backboneLength = entireBackboneRange.end - entireBackboneRange.start





    let locationsOfOmittedRegions = new LinearRangeSet()

    /*
    if(opts.omitEmptySpace) {

        let rangesBetween = allRangesUsed.flatten().invert()

        rangesBetween.push(new LinearRange(allRangesUsed.ranges[allRangesUsed.ranges.length-1].end, backboneLength))
        rangesBetween.push(new LinearRange(0, allRangesUsed.ranges[0].start))

        rangesBetween.ranges = rangesBetween.ranges.filter((range) => {
            return range.end - range.start > 2
        })

        rangesBetween = rangesBetween.sort().flatten()

        let entireBackboneRange = new LinearRange(0, backboneLength)

        let rangesToDelete = rangesBetween.clone().ranges

        while(rangesToDelete.length > 0) {

            let rangeToDelete = rangesToDelete[0]
            rangesToDelete.splice(0, 1)

            let omitLen = 1

            //chopRange(rangesBetween.ranges, rangeToDelete, omitLen)
            chopRange(allRangesUsed.ranges, rangeToDelete, omitLen)

            for(let layer of layers.values()) {
                chopRange(layer.rangesUsedForward.ranges, rangeToDelete, omitLen)
                chopRange(layer.rangesUsedReverse.ranges, rangeToDelete, omitLen)
                chopRange(layer.children.map((child) => child.range), rangeToDelete, omitLen)
            }

            chopRange([entireBackboneRange], rangeToDelete, omitLen)
            chopRange(locationsOfOmittedRegions.ranges, rangeToDelete, omitLen)

            locationsOfOmittedRegions.push(new LinearRange(rangeToDelete.start, rangeToDelete.start + 1))

            chopRange(rangesToDelete, rangeToDelete, omitLen)
        }

        backboneLength = entireBackboneRange.end - entireBackboneRange.start


        console.log('chopped', allRangesUsed.sort())

    }
*/
    backbone.locationsOfOmittedRegions = locationsOfOmittedRegions













    for(let [n, layer] of layers) {

        let minAscent = 0
        let maxDescent = 0

        for (let child of layer.children) {

            const { ascent, descent } = ascentDescent(child.object)

            minAscent = Math.min(ascent, minAscent)
            maxDescent = Math.max(descent, maxDescent)
        }

        //var backboneHeight = padding + Math.abs(minAscent) + maxDescent + padding
        var layerHeight = Math.abs(minAscent) + maxDescent

        /* the height must always be an even number so that the backbone
         * can split us in half vertically.  if it was odd the backbone would
         * end up inside a grid cell.
         */
        //if (layerHeight % 2 != 0)
            //layerHeight += 1

        //const parentMid = backboneHeight / 2
        //const backboneY = padding + Math.abs(minAscent)
        let backboneY = Math.abs(minAscent)

        layer.backboneY = backboneY
        layer.height = layerHeight
    }



    // 1. position all the children using their ranges
    for(let child of children) {

        if(!(child instanceof ComponentDepiction) && !(child instanceof FeatureLocationDepiction)) {
            // label
            continue
        }

        let positioned = childToPositioned.get(child)

        if(!positioned) {
            throw new Error('bb child has not been positioned')
        }

        let y = 0

        for(let n = minLayerN; n < positioned.layer.n; ++ n) {
            let layer = layers.get(n)
            if(!layer) {
                throw new Error('???')
            }
            y += layer.height
        }

        y += positioned.layer.backboneY


        let x = positioned.range.start

        if(child.offsetExplicit) {
            x = child.offset.x
        }

        let childOffset = Vec2.fromXY(positioned.range.start, y)
        childOffset = Vec2.fromXY(childOffset.x, childOffset.y - child.getAnchorY())

        child.offset = childOffset
    }

    // 2. set initial label positions

    for(let child of children) {

        if(! (child instanceof LabelDepiction)) {
            continue
        }

        let labelFor = child.labelFor

        if(! (labelFor instanceof ComponentDepiction || labelFor instanceof FeatureLocationDepiction)) {
            throw new Error('???')
        }

        let w = child.size.x
        let h = child.size.y
        let x = labelFor.offset.x
        let y = labelFor.offset.y

        if(labelFor.orientation === Orientation.Reverse) {
            y += labelFor.size.y
        } else {
            y -= h
        }

        child.offset = Vec2.fromXY(x, y)
    }


    // 3. fix label overlaps
    for(let child of children) {

        if(! (child instanceof LabelDepiction)) {
            continue
        }

        let labelFor = child.labelFor

        if(! (labelFor instanceof ComponentDepiction || labelFor instanceof FeatureLocationDepiction)) {
            throw new Error('???')
        }

        while(child.hasOverlappingSiblings()) {
            if(labelFor.orientation === Orientation.Reverse) {
                child.offset = Vec2.fromXY(child.offset.x, child.offset.y + 1)
            } else {
                child.offset = Vec2.fromXY(child.offset.x, child.offset.y - 1)
            }
        }

    }


    console.log('Backbone: minLayerN', minLayerN, ' maxLayer', maxLayerN)


    let backboneY = 0

    for(let n = minLayerN; n <= 0; ++ n) {
        let layer = layers.get(n)
        if(!layer) {
            throw new Error('???')
        }
        if(n === 0) {
            backboneY += layer.backboneY
            break
        } else {
            backboneY += layer.height
        }
    }
    
    backbone.backboneY = backboneY


    let backboneHeight = 0

    for(let n = minLayerN; n <= maxLayerN; ++ n) {

        let layer = layers.get(n)
        if(!layer) {
            throw new Error('???')
        }
        backboneHeight += layer.height
    }

    backbone.size = Vec2.fromXY(backboneLength, backboneHeight)
    


    let adjust = backbone.zeroifyOrigin()
    backboneY = backboneY - adjust.y
    for(let child of children) {
        backboneHeight = Math.max(backboneHeight, child.offset.y + child.size.y)
        backboneLength = Math.max(backboneLength, child.offset.x + child.size.x)
    }

    backbone.size = Vec2.fromXY(backboneLength, backboneHeight)
    backbone.backboneY = backboneY

    //console.error('BACKBONE (ANCHOR) Y IS ' + parent.backboneY + ' FOR ' + parent.debugName)
}

function ascentDescent(child:Depiction) {

    const childSize = child.size

    const anchorY = child.getAnchorY()

    return {
        //ascent: (- anchorY) - marginTop,
        //descent: (childSize.y - anchorY) + marginBottom
        ascent: (- anchorY),
        descent: (childSize.y - anchorY)
    }
}



/*


            backboneElements = expandLocations(backboneElements)


            let uriToPositionedChild:Map<string,BackboneChild> = new Map()

            // we need to create a backbone group for these objects.
            // it will contain one or more backbones depending on how many overlapping
            // features there are.

            let backboneLength = 0

            if(cd.sequence && cd.sequence.elements) {
                backboneLength = cd.sequence.elements.length * bpToGridScale
            }

            let group = new BackboneGroup()
            group.backbones = new Map<number, Backbone>()
            group.backboneLength = backboneLength
            group.locationsOfOmittedRegions = new LinearRangeSet()





*/





let table = {
    'SO:0000316': 1000,
    'SO:0000167': 1000,
    'SO:0000139': 1000,
    'SO:0001687': 1000,
    'SO:0000141': 1000
}

function score(obj: S3Identified) {

    let roles: string[] = []

    if (obj instanceof S3SequenceFeature) {
        roles = obj.soTerms
    } else if (obj instanceof S3SubComponent) {
        roles = obj.instanceOf.soTerms
    } else {
        console.dir(obj)
        throw new Error('obj was not a feature or a subcomponent')
    }

    console.log('roles', roles)

    let max = 0

    for (let role of roles) {
        max = Math.max(max, table[role] || 0)
    }

    return max
}


// https://stackoverflow.com/a/21071454/712294
function move(array, from, to) {
    if (to === from) return array;

    var target = array[from];
    var increment = to < from ? -1 : 1;

    for (var k = from; k != to; k += increment) {
        array[k] = array[k + increment];
    }
    array[to] = target;
    return array;
}


function chopRange(ranges: LinearRange[], rangeToDelete: LinearRange, newLen: number) {
    for (let i = 0; i < ranges.length;) {
        let range = ranges[i]
        let newRange = range.chop(rangeToDelete, newLen)
        //console.log(range, 'chop', rangeToDelete, 'makes', newRange)
        if (!newRange) {
            ranges.splice(i, 1)
            continue
        } else {
            range.start = newRange.start
            range.end = newRange.end
            ++i
            continue
        }
    }
}
