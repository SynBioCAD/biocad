
import Instruction from './Instruction'

export default class WhitelistInstruction extends Instruction {

    whitelistUIDs:Set<number>

    constructor(whitelistUIDs:Set<number>) {

        super()

        this.whitelistUIDs = whitelistUIDs

    }

}
