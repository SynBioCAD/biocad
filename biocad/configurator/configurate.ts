import LabelDepiction from 'biocad/cad/LabelDepiction';

import { Vec2 } from 'jfw/geom'

import { Types, Specifiers } from 'bioterms'

import Layout from 'biocad/cad/Layout'

import Depiction from 'biocad/cad/Depiction'
import ComponentDepiction from 'biocad/cad/ComponentDepiction'
import FeatureLocationDepiction from 'biocad/cad/FeatureLocationDepiction'
import BackboneGroupDepiction from 'biocad/cad/BackboneGroupDepiction'

import configurateComponent from './configurateComponent'
import configurateFeatureLocation from './configurateFeatureLocation'
import configurateLabel from './configurateLabel'
import configurateLabelled from './configurateLabelled'
import configurateBackbone from './configurateBackbone'
import configurateBackboneGroup from './configurateBackboneGroup'
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

    for(let instruction of instructions.instructions) {

        if(instruction instanceof ReplaceInstruction) {

            const toReplace:Depiction|undefined = layout.getDepictionsForUri(instruction.toReplace.uri)[0]
            const replaceWith:Depiction|undefined = layout.getDepictionsForUri(instruction.replaceWith.uri)[0]

            if(toReplace === undefined || replaceWith === undefined) {

                throw new Error('???')

            }

            if(!toReplace.offsetExplicit)
                continue

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

    }

    for(let depiction of layout.depictions) {

        if(depiction instanceof ComponentDepiction) {
            configurateComponent(depiction, instructions)
        } else if(depiction instanceof FeatureLocationDepiction) {
            configurateFeatureLocation(depiction, instructions)
        } else if(depiction instanceof LabelDepiction) {
            configurateLabel(depiction, instructions)
        } else if(depiction instanceof LabelledDepiction) {
            configurateLabelled(depiction, instructions)
        } else if(depiction instanceof BackboneDepiction) {
            configurateBackbone(depiction, instructions)
        } else if(depiction instanceof BackboneGroupDepiction) {
            configurateBackboneGroup(depiction, instructions)
        }

    }

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

