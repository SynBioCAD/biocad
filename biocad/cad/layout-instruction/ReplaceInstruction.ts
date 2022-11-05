
import Instruction from './Instruction'
import Depiction from 'biocad/cad/layout/Depiction';
import { S3Identified } from 'sboljs'

export default class ReplaceInstruction extends Instruction {

    toReplace:S3Identified
    replaceWith:S3Identified

    constructor(toReplace:S3Identified, replaceWith:S3Identified) {

        super()

        this.toReplace = toReplace
        this.replaceWith = replaceWith

    }

}
