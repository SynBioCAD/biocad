import LabelDepiction from 'biocad/cad/layout/LabelDepiction';

import { Vec2 } from '@biocad/jfw/geom'

import { Types, Specifiers } from 'bioterms'

import Layout from 'biocad/cad/layout/Layout'

import Depiction from 'biocad/cad/layout/Depiction'
import ComponentDepiction from 'biocad/cad/layout/ComponentDepiction'
import FeatureLocationDepiction from 'biocad/cad/layout/FeatureLocationDepiction'

import configurateComponent from './configurateComponent'
import configurateFeatureLocation from './configurateFeatureLocation'
import configurateLabel from './configurateLabel'
import configurateBackbone from './configurateBackbone'
import BackboneDepiction from "biocad/cad/layout/BackboneDepiction";
import InstructionSet from 'biocad/cad/layout-instruction/InstructionSet';
import { S3Identified } from 'sbolgraph';
import Instruction from 'biocad/cad/layout-instruction/Instruction';
import ReplaceInstruction from 'biocad/cad/layout-instruction/ReplaceInstruction';

import binPackStrategy from './strategy/binPackStrategy'
import MarginInstruction from 'biocad/cad/layout-instruction/MarginInstruction';
import WhitelistInstruction from 'biocad/cad/layout-instruction/WhitelistInstruction';

export default function configurate(layout:Layout, instructions:InstructionSet) {

    let marginL = 1
    let marginR = 1
    let marginT = 1
    let marginB = 1

    let whitelistUIDs:Set<number>|undefined

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

        if(instruction instanceof WhitelistInstruction) {
            whitelistUIDs = instruction.whitelistUIDs
        }
    }

    for(let depiction of layout.depictions) {

        if(whitelistUIDs) {
            if(!whitelistUIDs.has(depiction.uid)) {
                continue
            }
        }

        if(depiction instanceof ComponentDepiction) {
            configurateComponent(depiction, instructions)
        } else if(depiction instanceof FeatureLocationDepiction) {
            configurateFeatureLocation(depiction, instructions)
        } else if(depiction instanceof LabelDepiction) {
            configurateLabel(depiction, instructions)
        } else if(depiction instanceof BackboneDepiction) {
            configurateBackbone(depiction, instructions)
        }

    }

    //console.log('Positioning roots...')

    const rootDepictions:Array<Depiction> = layout.depictions.filter((depiction:Depiction) => {
        return !depiction.parent
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

