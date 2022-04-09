import LabelDepiction from 'biocad/cad/LabelDepiction';
import { S3Component, S3SubComponent, S3Range } from "sbolgraph";

import { Types, Specifiers } from 'bioterms'

import { Orientation } from 'biocad/cad/Depiction'

import { Vec2 } from '@biocad/jfw/geom'

import visbolite from 'visbolite'
import parts, { shortNameFromTerm } from 'data/parts'

import binPackStrategy from './strategy/binPackStrategy'
import tileHorizontalStrategy from './strategy/tileHorizontalStrategy'
import circularStrategy from './strategy/circularStrategy'

import ComponentDepiction from 'biocad/cad/ComponentDepiction'
import Depiction, { Opacity } from 'biocad/cad/Depiction'
import BackboneDepiction from "biocad/cad/BackboneDepiction";
import CircularBackboneDepiction from 'biocad/cad/CircularBackboneDepiction';
import InstructionSet from 'biocad/cad/layout-instruction/InstructionSet';
import Layout from 'biocad/cad/Layout';

export default function configurateComponent(depiction:ComponentDepiction, instructions:InstructionSet):void {

    console.log('configurating ' + depiction.debugName)

    if(CircularBackboneDepiction.ancestorOf(depiction)) {
        if(depiction.opacity === Opacity.Whitebox) {
            configurateCircularWhiteboxComponent(depiction)
        } else {
            configurateCircularBlackboxComponent(depiction)
        }
    } else {
        if(depiction.opacity === Opacity.Whitebox) {
            configurateWhiteboxComponent(depiction)
        } else {
            configurateBlackboxComponent(depiction)
        }
    }




    /*
    const label:LabelDepiction|undefined = depiction.label

    if(label !== undefined) {

        if (depiction.orientation === Orientation.Reverse) {
            depiction.setMarginBottom(label.size.y)
            label.offset = Vec2.fromXY(0, depiction.innerSize.y)
        } else {
            label.offset = Vec2.fromXY(0, - label.size.y)
            depiction.setMarginTop(label.size.y)
        }

        const overflowRight:number = label.size.x - depiction.size.x

        if(overflowRight > 0) {
            depiction.marginRight = overflowRight

            const foo:Vec2 = depiction.size.add(Vec2.fromXY(overflowRight, 0))

            dogsole.warn('depiction ' + depiction.debugName + ' changing size from ' + depiction.size + ' to ' + foo + ' to accommodate for label')

            depiction.size = depiction.size.add(Vec2.fromXY(overflowRight, 0))
        }
    }
    */
}

function configurateWhiteboxComponent(depiction:ComponentDepiction):void {

    const children = depiction.children.filter((child:Depiction) => !(child instanceof LabelDepiction))

    let { proportionalWidth, displayWidth } = depiction.calcWidthFromLocation()

    if(children.length > 0) {

        const padding = 1

        binPackStrategy(depiction, children, padding)

    } else {

        depiction.size = Vec2.fromXY(2, 2).max(depiction.minSize)

    }

    depiction.proportionalWidth = proportionalWidth

    depiction.size = depiction.size.max(Vec2.fromXY(displayWidth, 0))
}

function configurateBlackboxComponent(depiction:ComponentDepiction):void {

    let layout = depiction.layout

    var type = 'user-defined'

    const depictionOf = depiction.depictionOf

    var definition:S3Component
    
    if(depictionOf instanceof S3Component) {
        definition = depictionOf as S3Component
    } else if(depictionOf instanceof S3SubComponent) {
        definition = (depictionOf as S3SubComponent).instanceOf
    } else if(depictionOf instanceof S3SubComponent) {
        definition = (depictionOf as S3SubComponent).instanceOf
    } else {
        throw new Error('Unknown depictionOf type')
    }
    
    const roles:Array<string> = definition.roles

    for(let role of roles) {

        const shortName = shortNameFromTerm(role)

        if(shortName)
            type = shortName
    }

    var backbonePlacement = visbolite.backbonePlacement({
        type: type
    })

    if(depiction.orientation === Orientation.Reverse) {

        backbonePlacement = ({
            top: 'bottom',
            mid: 'mid',
            bottom: 'top'

        })[backbonePlacement]

        console.log('bb placement ' + backbonePlacement)

    }


    let { proportionalWidth, displayWidth } = depiction.calcWidthFromLocation()

    depiction.proportionalWidth = proportionalWidth
    depiction.size = Vec2.fromXY(displayWidth, 2 * visbolite.glyphScaleFromType(type).y)

    depiction.backbonePlacement = backbonePlacement
}

function configurateCircularWhiteboxComponent(depiction:ComponentDepiction):void {

    depiction.size = Vec2.fromXY(20, 20)

    const children = depiction.children.filter((child:Depiction) => !(child instanceof LabelDepiction))

    const padding = 1
    circularStrategy(depiction, children, padding)


}

function configurateCircularBlackboxComponent(depiction:ComponentDepiction):void {

    depiction.size = Vec2.fromXY(2, 2)

}


