
import Instruction from './Instruction'
import Depiction from 'biocad/cad/Depiction';
import { SXIdentified } from 'sbolgraph';

export default class PinInstruction extends Instruction {

    toPin:SXIdentified

    constructor(toPin:SXIdentified) {

        super()

        this.toPin = toPin

    }

}
