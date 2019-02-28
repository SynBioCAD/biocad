

import assert from 'power-assert'

import { Vec2, LinearRangeSet, LinearRange } from 'jfw/geom'

import { Specifiers } from 'bioterms'
import Depiction, { Orientation } from "biocad/cad/Depiction";
import ComponentDepiction from "biocad/cad/ComponentDepiction";
import { SXSequenceFeature, SXRange, SXSubComponent, SXSequenceConstraint, SXIdentified } from "sbolgraph"
import Layout from "biocad/cad/Layout";
import BackboneDepiction from '../../cad/BackboneDepiction';
import FeatureLocationDepiction from 'biocad/cad/FeatureLocationDepiction';
import LabelledDepiction from 'biocad/cad/LabelledDepiction';
import BackboneGroupDepiction from 'biocad/cad/BackboneGroupDepiction';
import LabelDepiction from 'biocad/cad/LabelDepiction';

export default function backboneStrategy(_parent:Depiction, children:Depiction[], padding) {

    if(! (_parent instanceof BackboneDepiction)) {
        throw new Error('???')
    }

    let backbone:BackboneDepiction = _parent as BackboneDepiction


    const layout:Layout = backbone.layout

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

    //var backboneHeight = padding + Math.abs(minAscent) + maxDescent + padding
    var backboneHeight = Math.abs(minAscent) + maxDescent

    /* the height must always be an even number so that the backbone
     * can split us in half vertically.  if it was odd the backbone would
     * end up inside a grid cell.
     */
    if(backboneHeight % 2 != 0)
        backboneHeight += 1

    //const parentMid = backboneHeight / 2
    //const backboneY = padding + Math.abs(minAscent)
    let backboneY = Math.abs(minAscent)


    // 1. position all the children using their ranges
    for(let child of children) {

        if(!(child instanceof ComponentDepiction) && !(child instanceof FeatureLocationDepiction)) {
            // label
            continue
        }

        if(!child.range) {
            throw new Error('bb child has no range')
        }

        const childSize = child.size

        //console.log('bb child has width ' + childSize.x)

        //const { ascent, descent } = ascentDescent(child)

        const childOffset = Vec2.fromXY(child.range.normalise().start, backboneY - child.getAnchorY())

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
            y += labelFor.size.y * labelFor.scale.y
        } else {
            y -= h
            y += labelFor.size.y - (labelFor.size.y * labelFor.scale.y)
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


    
    let group = backbone.parent
    if (!(group instanceof BackboneGroupDepiction)) {
        throw new Error('backbone not in a group?')
    }

    
    let adjust = backbone.zeroifyOrigin()
    backboneY = backboneY - adjust.y

    for(let child of children) {
        backboneHeight = Math.max(backboneHeight, child.offset.y + child.size.y)
    }


    backbone.size = Vec2.fromXY(group.backboneLength, backboneHeight)
    backbone.backboneY = backboneY

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


