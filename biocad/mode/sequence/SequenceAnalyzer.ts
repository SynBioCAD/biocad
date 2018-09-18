

export class MaybeAnnotation {

    start:number
    end:number
    name:string

    constructor(start:number, end:number, name:string) {

        this.start = start
        this.end = end
        this.name = name

    }

}

export default class SequenceAnalyzer {

    public static analyzeDNASequence(na:string):MaybeAnnotation[] {

        na = na.toUpperCase()

        const annotations:MaybeAnnotation[] = []

        for(let i:number = 0; i < na.length; ++ i) {

            if(na[i] === 'A' && na[i + 1] === 'T' && na[i + 2] === 'G') {

                annotations.push(new MaybeAnnotation(i, i + 3, 'Start Codon'))

            }

        }

        return annotations
    }


}