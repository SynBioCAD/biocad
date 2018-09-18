
import Instruction from './Instruction'
import Depiction from 'biocad/cad/Depiction';
import { SXIdentified } from 'sbolgraph'

export default class ReplaceInstruction extends Instruction {

    toReplace:SXIdentified
    replaceWith:SXIdentified

    constructor(toReplace:SXIdentified, replaceWith:SXIdentified) {

        super()

        this.toReplace = toReplace
        this.replaceWith = replaceWith

    }

}
