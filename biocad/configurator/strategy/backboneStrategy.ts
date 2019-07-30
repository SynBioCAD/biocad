

import assert from 'power-assert'

import { Vec2, LinearRangeSet, LinearRange, Rect } from 'jfw/geom'

import { Specifiers } from 'bioterms'
import Depiction, { Orientation } from "biocad/cad/Depiction";
import ComponentDepiction from "biocad/cad/ComponentDepiction";
import { SXSequenceFeature, SXRange, SXSubComponent, SXSequenceConstraint, SXIdentified, SXComponent, SXLocation } from "sbolgraph"
import Layout from "biocad/cad/Layout";
import BackboneDepiction from '../../cad/BackboneDepiction';
import FeatureLocationDepiction from 'biocad/cad/FeatureLocationDepiction';
import LabelDepiction from 'biocad/cad/LabelDepiction';
import LocationableDepiction from 'biocad/cad/LocationableDepiction';


let minGridWidth = 2

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

    if(cd instanceof SXSubComponent) {
        cd = cd.instanceOf
    }

    if(! (cd instanceof SXComponent)) {
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

            if (dOf instanceof SXLocation) {

                let location: SXLocation = dOf as SXLocation
                let containingObject: SXIdentified | undefined = location.containingObject

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


    let placed:Map<Depiction, { forward: boolean }> = new Map()

    let place = (object: Depiction, range: LinearRange, forward: boolean) => {

        range = range.normalise()

        if (placed.has(object)) {
            throw new Error('attempted to place object twice')
        }

        let y = forward ?
            - object.getAnchorY() :
            object.getAnchorY()

        do {

            object.offset = Vec2.fromXY(range.start, y)
            object.size = Vec2.fromXY(range.end - range.start, object.size.y)

            let overlaps = object.getOverlappingSiblings().filter((sibling) => placed.has(sibling))

            if(overlaps.length === 0) {
                placed.set(object, { forward })
                return
            }

            // get highest overlap

            if(forward) {

                overlaps.sort((a, b) => {
                    return a.boundingBox.topLeft.y - b.boundingBox.topLeft.y
                })

                console.log('forward', overlaps.map((o) => o.boundingBox))

                y = overlaps[0].boundingBox.topLeft.y - object.size.y

            } else {
                overlaps.sort((a, b) => {
                    return b.boundingBox.bottomRight.y - a.boundingBox.bottomRight.y
                })

                console.log('reverse', overlaps.map((o) => o.boundingBox))

                y = overlaps[0].boundingBox.bottomRight.y
            }

        } while(true)

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


    // 1. place all fixed
    for (let element of backboneElements) {
        if(! (element instanceof LocationableDepiction))
            continue

        // unless already placed bc of explicit offset
        if(placed.has(element))
            continue

        let location = element.location
        if (location instanceof SXRange && location.isFixed()) {
            if (!location.start) {
                throw new Error('???')
            }
            let start = location.start * layout.bpToGridScale
            let end = location.end ? location.end * layout.bpToGridScale : location.start + 0.0003
            let forward = location.orientation !== Specifiers.SBOLX.Orientation.ReverseComplement

            let range = new LinearRange(start, end).normalise()

            place(element, range, forward)
        }
    }

    // 2. place all constrained that reference fixed
    /// ... and constrained that reference the former, recursively
    /// (keep going until we can't position anything else)
    //
    for (; ;) {
        let doneSomething = false
        for (let constraint of cd.sequenceConstraints) {
            let s = constraint.subject
            let o = constraint.object
            let r = constraint.restriction

            let sDep = uriToDepiction(s.uri)
            let oDep = uriToDepiction(o.uri)

            if(! (oDep instanceof LocationableDepiction)) {
                throw new Error('oDep not a LocationableDepiction')
            }
            if(! (sDep instanceof LocationableDepiction)) {
                throw new Error('sDep not a LocationableDepiction')
            }

            let positionedS = placed.get(sDep)
            let positionedO = placed.get(oDep)

            if (positionedS) {
                if (positionedO) {
                    continue
                }

                // s done, o not
                let width = oDep.proportionalWidth

                if (r === Specifiers.SBOLX.SequenceConstraint.Precedes) {

                    // place o AFTER s because s precedes o
                    if (positionedS.forward) {
                        // forward; place o to the right of s
                        place(oDep, new LinearRange(sDep.boundingBox.bottomRight.x, sDep.boundingBox.bottomRight.x + width), true)
                    } else {
                        // reverse; place o to the left of s
                        place(oDep, new LinearRange(sDep.boundingBox.topLeft.x - width, sDep.boundingBox.topLeft.x), false)
                    }
                    doneSomething = true
                }

            } else if (positionedO) {
                if (positionedS) {
                    continue
                }
                // o done, s not

                let width = sDep.proportionalWidth

                if (r === Specifiers.SBOLX.SequenceConstraint.Precedes) {

                    // place s BEFORE o because s precedes o
                    if (positionedO.forward) {
                        // forward; place s to the left of o
                        place(sDep, new LinearRange(oDep.boundingBox.topLeft.x - width, oDep.boundingBox.topLeft.x), true)
                    } else {
                        // reverse; place s to the right of o
                        place(sDep, new LinearRange(oDep.boundingBox.bottomRight.x, oDep.boundingBox.bottomRight.x + width), false)
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
            let subjectIdx = findElement(constraint.subject.uri)
            let objIdx = findElement(constraint.object.uri)
            let restriction = constraint.restriction
            if (subjectIdx === -1 || objIdx === -1) {
                console.warn('constraint: missing s/o:', constraint.subject.uri, subjectIdx, constraint.object.uri, objIdx)
                continue
            }

            let subj = backboneElements[subjectIdx]
            let obj = backboneElements[objIdx]


            if (restriction === Specifiers.SBOLX.SequenceConstraint.Precedes) {
                move(backboneElements, subjectIdx, objIdx)
            }
        }
        if (!doneSomething)
            break
    }

    let constraintElements =
        backboneElements.filter((element) => !placed.has(element))

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

    /*
    for (let layer of layers.values()) {
        layer.rangesUsed.forEach((range) => {
            backboneLength = Math.max(backboneLength, range.end)
        })
    }




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

            chopRange([entireBackboneRange], chop, paddingLength)

        }

    }

    backboneLength = entireBackboneRange.end - entireBackboneRange.start
*/




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
                chopRange(layer.rangesUsed.ranges, rangeToDelete, omitLen)
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
















    // 1. set initial label positions

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


    // 2. fix label overlaps
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



    // width

    let backboneLength = 0

    if (cd.sequences.length > 0 && cd.sequences[0].elements) {
        backboneLength = cd.sequences[0].elements.length * layout.bpToGridScale
    }

    for(let child of children) {
        backboneLength = Math.max(backboneLength, child.offset.x + child.size.x)
    }


    // height 

    let ascent = 0

    for(let child of children) {
        ascent = Math.min(ascent, child.offset.y)
    }

    backbone.backboneY = -ascent

    let backboneHeight = 0

    for(let child of children) {
        child.offset = Vec2.fromXY(child.offset.x, child.offset.y + (-ascent))
        backboneHeight = Math.max(backboneHeight, child.offset.y + child.size.y)
    }





    backbone.size = Vec2.fromXY(backboneLength, backboneHeight)
}







let table = {
    'SO:0000316': 1000,
    'SO:0000167': 1000,
    'SO:0000139': 1000,
    'SO:0001687': 1000,
    'SO:0000141': 1000
}

function score(obj: SXIdentified) {

    let roles: string[] = []

    if (obj instanceof SXSequenceFeature) {
        roles = obj.soTerms
    } else if (obj instanceof SXSubComponent) {
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
