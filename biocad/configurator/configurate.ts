import LabelDepiction from 'biocad/cad/LabelDepiction';

import { Vec2 } from 'jfw/geom'

import { Types, Specifiers } from 'bioterms'

import Layout from 'biocad/cad/Layout'

import Depiction from 'biocad/cad/Depiction'
import ComponentDepiction from 'biocad/cad/ComponentDepiction'
import FeatureLocationDepiction from 'biocad/cad/FeatureLocationDepiction'

import configurateComponent from './configurateComponent'
import configurateFeatureLocation from './configurateFeatureLocation'
import configurateLabel from './configurateLabel'
import configurateLabelled from './configurateLabelled'
import configurateBackbone from './configurateBackbone'
import BackboneDepiction from "biocad/cad/BackboneDepiction";
import InstructionSet from 'biocad/cad/layout-instruction/InstructionSet';
import { SXIdentified } from 'sbolgraph';
import Instruction from 'biocad/cad/layout-instruction/Instruction';
import ReplaceInstruction from 'biocad/cad/layout-instruction/ReplaceInstruction';

import binPackStrategy from './strategy/binPackStrategy'
import LabelledDepiction from 'biocad/cad/LabelledDepiction';
import MarginInstruction from '../cad/layout-instruction/MarginInstruction';

export default function configurate(layout:Layout, instructions:InstructionSet) {

    let marginL = 1
    let marginR = 1
    let marginT = 1
    let marginB = 1

    instructions.instructions.forEach((instruction:Instruction) => {

        if(instruction instanceof ReplaceInstruction) {

            const toReplace:Depiction|undefined = layout.getDepictionsForUri(instruction.toReplace.uri)[0]
            const replaceWith:Depiction|undefined = layout.getDepictionsForUri(instruction.replaceWith.uri)[0]

            if(toReplace === undefined || replaceWith === undefined) {

                throw new Error('???')

            }

            if(!toReplace.offsetExplicit)
                return

            toReplace.offsetExplicit = false

            replaceWith.offsetExplicit = true
            replaceWith.offset = toReplace.offset


        }

        if(instruction instanceof MarginInstruction) {

            marginL = (instruction as MarginInstruction).left
            marginR = (instruction as MarginInstruction).right
            marginT = (instruction as MarginInstruction).top
            marginB = (instruction as MarginInstruction).bottom

        }

    })

    //console.warn(layout.depictions.length + ' TO CONFIGURATE!!!!!')

    layout.depictions.forEach((depiction) => {

        //console.warn('CONFIGURATE!!!!! ' + depiction.debugName)

        if(depiction instanceof ComponentDepiction) {

            configurateComponent(depiction as ComponentDepiction, instructions)

        } else if(depiction instanceof FeatureLocationDepiction) {

            configurateFeatureLocation(depiction as FeatureLocationDepiction, instructions)

        } else if(depiction instanceof LabelDepiction) {

            configurateLabel(depiction as LabelDepiction, instructions)

        } else if(depiction instanceof LabelledDepiction) {

            configurateLabelled(depiction as LabelledDepiction, instructions)

        } else if(depiction instanceof BackboneDepiction) {

            configurateBackbone(depiction as BackboneDepiction, instructions)

        }

    })

    //console.log('Positioning roots...')

    const rootDepictions:Array<Depiction> = layout.depictions.filter((depiction:Depiction) => {
        return !depiction.parent
    }).filter((depiction:Depiction) => {
        return !depiction.offsetExplicit
    })

    let bpo = 1

    binPackStrategy(null, rootDepictions, bpo)

    for(let d of rootDepictions) {
        d.offset = d.offset.subtractScalar(bpo)
    }

    for(let d of rootDepictions) {
        d.offset = d.offset.add(Vec2.fromXY(marginL, marginT))
    }

    // TODO margin bottom and margin right


}

