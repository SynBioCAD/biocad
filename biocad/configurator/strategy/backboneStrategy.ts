

import assert from 'power-assert'

import { Vec2, LinearRangeSet } from 'jfw/geom'

import { Specifiers } from 'bioterms'
import Depiction, { Orientation } from "biocad/cad/Depiction";
import ComponentDepiction from "biocad/cad/ComponentDepiction";
import { SXSequenceFeature, SXRange, SXSubComponent, SXSequenceConstraint, SXIdentified } from "sbolgraph"
import Layout from "biocad/cad/Layout";
import BackboneDepiction from '../../cad/BackboneDepiction';
import FeatureLocationDepiction from 'biocad/cad/FeatureLocationDepiction';
import LabelledDepiction from 'biocad/cad/LabelledDepiction';
import BackboneGroupDepiction from 'biocad/cad/BackboneGroupDepiction';

export default function backboneStrategy(_parent:Depiction, children:Depiction[], padding) {

    if(! (_parent instanceof BackboneDepiction)) {
        throw new Error('???')
    }

    let parent:BackboneDepiction = _parent as BackboneDepiction


    const layout:Layout = parent.layout

    var minAscent = 0
    var maxDescent = 0


    /*
    if(parent.orientation === Orientation.Reverse) {

        children = children.reverse()

    }*/

    for(let child of children) {

        const { ascent, descent } = ascentDescent(child)

        minAscent = Math.min(ascent, minAscent)
        maxDescent = Math.max(descent, maxDescent)

        //console.log('descent of ' + child.depictionOf.displayName + ' is ' + descent)
        //console.log('ascent of ' + child.depictionOf.displayName + ' is ' + ascent)

    }

    //var parentHeight = padding + Math.abs(minAscent) + maxDescent + padding
    var parentHeight = Math.abs(minAscent) + maxDescent

    /* the height must always be an even number so that the backbone
     * can split us in half vertically.  if it was odd the backbone would
     * end up inside a grid cell.
     */
    if(parentHeight % 2 != 0)
        parentHeight += 1

    //const parentMid = parentHeight / 2
    //const backboneY = padding + Math.abs(minAscent)
    const backboneY = Math.abs(minAscent)

    for(let child of children) {

        if(!(child instanceof LabelledDepiction)) {
            throw new Error('bb child has wrong type (not labelled)')
        }

        let effectiveChild = child.getLabelled()

        if(!(effectiveChild instanceof ComponentDepiction) && !(effectiveChild instanceof FeatureLocationDepiction)) {
            throw new Error('bb child has wrong type (not cd or sa)')
        }

        if(!effectiveChild.range) {
            throw new Error('bb child has no range')
        }

        const childSize = child.size

        //console.log('bb child has width ' + childSize.x)

        //const { ascent, descent } = ascentDescent(child)

        const childOffset = Vec2.fromXY(effectiveChild.range.normalise().start, backboneY - child.getAnchorY())

        child.offset = childOffset
    }

        //console.log('final bb width ' + offsetX)

    
    let group = parent.parent
    if (!(group instanceof BackboneGroupDepiction)) {
        throw new Error('backbone not in a group?')
    }

    parent.size = Vec2.fromXY(group.backboneLength, parentHeight)
    parent.backboneY = backboneY

    console.log('Backbone length: ' + group.backboneLength)

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


