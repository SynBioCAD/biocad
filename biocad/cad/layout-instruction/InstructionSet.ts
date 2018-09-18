import Instruction from "biocad/cad/layout-instruction/Instruction";
import { SXIdentified } from "sbolgraph";
import PinInstruction from "biocad/cad/layout-instruction/PinInstruction";
import ReplaceInstruction from "biocad/cad/layout-instruction/ReplaceInstruction";
import { inspect } from "util";


export default class InstructionSet {

    instructions:Array<Instruction>

    constructor(instructions:Array<Instruction>) {

        this.instructions = instructions

    }

    /*
    getInstructionsForIdentified(identified:SXIdentified):Array<Instruction> {

        return this.instructions.filter((instruction:Instruction) => {

            if(instruction instanceof PinInstruction) {
                return (instruction as PinInstruction).toPin.uriChain === identified.uriChain
            }

            if(instruction instanceof ReplaceInstruction) {
                return (instruction as ReplaceInstruction).toReplace.uriChain === identified.uriChain ||
                    (instruction as ReplaceInstruction).replaceWith.uriChain === identified.uriChain
            }

        })

    }

    getReplacementFor(identified:SXIdentified):SXIdentified|null {

        for(let instruction of this.instructions) {

            if(instruction instanceof ReplaceInstruction) {

                if(instruction.toReplace.uriChain === identified.uriChain) {

                    return instruction.replaceWith

                }

            }

        }

        return null
    }
*/


}
