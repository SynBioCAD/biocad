import { S3Identified } from "sbolgraph";
import Depiction, { Orientation } from 'biocad/cad/Depiction';
import ComponentDepiction from 'biocad/cad/ComponentDepiction';

import LabelDepiction from 'biocad/cad/LabelDepiction';

import { Vec2 } from 'jfw/geom'

import { Specifiers } from 'bioterms'

import assert from 'power-assert'

import measureText from '../util/measureText'
import CircularBackboneDepiction from 'biocad/cad/CircularBackboneDepiction';
import InstructionSet from "biocad/cad/layout-instruction/InstructionSet";

export default function configurateLabel(label:LabelDepiction, instructions:InstructionSet) {

    const labelFor: Depiction = label.labelFor
    const depictionOf: S3Identified | undefined = labelFor.depictionOf

    if(depictionOf === undefined) {
        console.dir(label)
        throw new Error('labelFor ' + labelFor.debugName + ' depictionOf is undefined')
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

