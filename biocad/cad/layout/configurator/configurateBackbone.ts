

import BackboneDepiction from "biocad/cad/layout/BackboneDepiction";

import backboneStrategy from './strategy/backboneStrategy'
import Depiction from "biocad/cad/layout/Depiction";
import LabelDepiction from "biocad/cad/layout/LabelDepiction";
import InstructionSet from "biocad/cad/layout-instruction/InstructionSet";

export default function configurateBackbone(depiction:BackboneDepiction, instructions:InstructionSet): void {

    console.warn('configurating backbne ' + depiction.debugName)

    const padding = 1
    backboneStrategy(depiction, depiction.children, padding)

}
