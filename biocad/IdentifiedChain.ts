import { SXIdentified, SBOLXGraph } from "sbolgraph";

export default class IdentifiedChain {

    private identifieds:SXIdentified[]

    constructor() {
        this.identifieds = []
    }

    top() {
        if(this.identifieds.length === 0) {
            throw new Error('???')
        }
        return this.identifieds[this.identifieds.length - 1]
    }

    extend(next:SXIdentified):IdentifiedChain {

        let chain:IdentifiedChain = new IdentifiedChain()

        chain.identifieds = this.identifieds.slice(0)
        chain.identifieds.push(next)

        return chain

    }

    containsIdentified(identified:SXIdentified):boolean {
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

    static fromString(graph:SBOLXGraph, str:string):IdentifiedChain {
        let chain = new IdentifiedChain()
        chain.identifieds = str.split(';').map((s) => graph.uriToFacade(s) as SXIdentified)
        return chain
    }



}

