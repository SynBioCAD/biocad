import { S3Identified, Graph, sbol3 } from "sbolgraph";

export default class IdentifiedChain {

    private identifieds:S3Identified[]

    constructor() {
        this.identifieds = []
    }

    top() {
        if(this.identifieds.length === 0) {
            throw new Error('???')
        }
        return this.identifieds[this.identifieds.length - 1]
    }

    extend(next:S3Identified):IdentifiedChain {

        let chain:IdentifiedChain = new IdentifiedChain()

        chain.identifieds = this.identifieds.slice(0)
        chain.identifieds.push(next)

        return chain

    }

    containsIdentified(identified:S3Identified):boolean {
        return this.containsURI(identified.uri)
    }

    containsURI(uri:string):boolean {
        for(let id of this.identifieds) {
            if(id.uri === uri)
                return true
        }
        return false
    }


    stringify():string {
        return this.identifieds.map((id) => id.uri).join(';')
    }

    static fromString(graph:Graph, str:string):IdentifiedChain {
        let chain = new IdentifiedChain()
        chain.identifieds = str.split(';').map((s) => sbol3(graph).uriToFacade(s) as S3Identified)
        return chain
    }



}

