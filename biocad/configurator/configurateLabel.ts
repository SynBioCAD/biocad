import { SXIdentified } from "sbolgraph";
import Depiction, { Orientation } from 'biocad/cad/Depiction';
import ComponentDepiction from 'biocad/cad/ComponentDepiction';

import LabelDepiction from 'biocad/cad/LabelDepiction';

import { Vec2 } from 'jfw/geom'

import { Specifiers } from 'bioterms'

import assert from 'power-assert'

import measureText from '../util/measureText'
import CircularBackboneDepiction from 'biocad/cad/CircularBackboneDepiction';
import InstructionSet from "biocad/cad/layout-instruction/InstructionSet";
import LabelledDepiction from "biocad/cad/LabelledDepiction";

export default function configurateLabel(label:LabelDepiction, instructions:InstructionSet) {

    if(!label.parent) {
        throw new Error('label must have parent')
    }

    if(! (label.parent instanceof LabelledDepiction)) {
        throw new Error('label not child of labelled?')
    }

    //console.warn('configurating LABEL for ' + label.parent.debugName)

    const labelled: LabelledDepiction = label.parent as LabelledDepiction
    const labelFor: Depiction = labelled.getLabelled()
    const depictionOf: SXIdentified | undefined = labelFor.depictionOf

    if(depictionOf === undefined) {
        throw new Error('???')
    }

    const text:string|undefined = depictionOf.displayName

    if(text === undefined) {
        throw new Error('no text for label?')
    }



    if(CircularBackboneDepiction.ancestorOf(this)) {


    } else {

        const textSize = measureText(text, label.attr)
            .divide(label.layout.gridSize)
            .ceil()

        label.size = textSize
    

    }
}

