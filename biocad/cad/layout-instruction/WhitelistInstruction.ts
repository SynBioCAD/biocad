
import Instruction from './Instruction'
import Depiction from 'biocad/cad/Depiction';
import { S3Identified } from 'sbolgraph'

export default class WhitelistInstruction extends Instruction {

    whitelistUIDs:Set<number>

    constructor(whitelistUIDs:Set<number>) {

        super()

        this.whitelistUIDs = whitelistUIDs

    }

}
