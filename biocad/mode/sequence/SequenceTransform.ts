
import getReverseComplementSequenceString = require('ve-sequence-utils/src/getReverseComplementSequenceString')

export enum SequenceTransform {
    Passthrough,
    ReverseComplement
}

export function transformSequence(elements:string, transform:SequenceTransform):string {

    switch(transform) {
        case SequenceTransform.Passthrough:
            return elements
        case SequenceTransform.ReverseComplement:
            return getReverseComplementSequenceString(elements)
    }
}

export function transformSequenceInv(elements:string, transform:SequenceTransform):string {
    switch(transform) {
        case SequenceTransform.Passthrough:
            return elements
        case SequenceTransform.ReverseComplement:
            return getReverseComplementSequenceString(elements)
    }
}


