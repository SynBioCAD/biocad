
import Instruction from './Instruction'
import { S3Identified } from 'sbolgraph';

export default class MarginInstruction extends Instruction {

    left:number
    right:number
    top:number
    bottom:number

    constructor(left:number, right:number, top:number, bottom:number) {

        super()
        
        this.left = left
        this.top = top
        this.right = right
        this.bottom = bottom
    }

}

