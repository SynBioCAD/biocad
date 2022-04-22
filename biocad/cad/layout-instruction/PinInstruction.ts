
import Instruction from './Instruction'
import { S3Identified } from 'sbolgraph';

export default class PinInstruction extends Instruction {

    toPin:S3Identified

    constructor(toPin:S3Identified) {

        super()

        this.toPin = toPin

    }

}
