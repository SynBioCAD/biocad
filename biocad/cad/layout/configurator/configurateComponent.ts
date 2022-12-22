import LabelDepiction from 'biocad/cad/layout/LabelDepiction';
import { S3Component, S3SubComponent, S3Range } from "sboljs";

import { Types, Specifiers } from 'bioterms'

import { Orientation } from 'biocad/cad/layout/Depiction'

import { Vec2 } from '@biocad/jfw/geom'

import { shortNameFromTerm } from 'data/parts'

import binPackStrategy from './strategy/binPackStrategy'
import tileHorizontalStrategy from './strategy/tileHorizontalStrategy'
import circularStrategy from './strategy/circularStrategy'

import ComponentDepiction from 'biocad/cad/layout/ComponentDepiction'
import Depiction, { Opacity } from 'biocad/cad/layout/Depiction'
import BackboneDepiction from "biocad/cad/layout/BackboneDepiction";
import CircularBackboneDepiction from 'biocad/cad/layout/CircularBackboneDepiction';
import InstructionSet from 'biocad/cad/layout-instruction/InstructionSet';
import Layout from 'biocad/cad/layout/Layout';

export default function configurateComponent(layout:Layout, depiction:ComponentDepiction, instructions:InstructionSet):void {

    console.log('configurating ' + depiction.debugName)

    if(CircularBackboneDepiction.ancestorOf(depiction)) {
        if(depiction.opacity === Opacity.Whitebox) {
            configurateCircularWhiteboxComponent(layout, depiction)
        } else {
            configurateCircularBlackboxComponent(layout, depiction)
        }
    } else {
        if(depiction.opacity === Opacity.Whitebox) {
            configurateWhiteboxComponent(layout, depiction)
        } else {
            configurateBlackboxComponent(layout, depiction)
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

function configurateWhiteboxComponent(layout:Layout, depiction:ComponentDepiction):void {

    const children = depiction.children.filter((child:Depiction) => !(child instanceof LabelDepiction))

    let { proportionalWidth, displayWidth } = depiction.calcWidthFromLocation()

    if(children.length > 0) {

        const padding = 1

        binPackStrategy(layout, depiction, children, padding)

    } else {

	if(depiction.userDefinedSize) {
		depiction.size = depiction.getSizeForRequested(depiction.userDefinedSize)
						.max(Vec2.fromXY(displayWidth, 0))
	} else {
		depiction.size = depiction.getSizeForRequested(Vec2.fromXY(displayWidth, 2))
	}


    }

    depiction.proportionalWidth = proportionalWidth

//     depiction.size = depiction.size.max(Vec2.fromXY(displayWidth, 0))
}

function configurateBlackboxComponent(layout:Layout, depiction:ComponentDepiction):void {

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

    var backbonePlacement = 'top'

    if(depiction.orientation === Orientation.Reverse) {
        backbonePlacement = 'bottom'
    }


    let { proportionalWidth, displayWidth } = depiction.calcWidthFromLocation()

    depiction.proportionalWidth = proportionalWidth
    // depiction.size = Vec2.fromXY(displayWidth, 2 * visbolite.glyphScaleFromType(type).y)
    
    if(depiction.userDefinedSize) {
	depiction.size = depiction.getSizeForRequested(depiction.userDefinedSize)
	console.log('configurateComponent: I requested user defined size ' + depiction.userDefinedSize + ' and got ' + depiction.size)
    } else {
	depiction.size = depiction.getSizeForRequested(Vec2.fromXY(displayWidth, 2))
    }


    depiction.backbonePlacement = backbonePlacement
}

function configurateCircularWhiteboxComponent(layout:Layout, depiction:ComponentDepiction):void {

    depiction.size = Vec2.fromXY(20, 20)

    const children = depiction.children.filter((child:Depiction) => !(child instanceof LabelDepiction))

    const padding = 1
    circularStrategy(depiction, children, padding)


}

function configurateCircularBlackboxComponent(layout:Layout, depiction:ComponentDepiction):void {

    depiction.size = Vec2.fromXY(2, 2)

}


