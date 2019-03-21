
import Depiction from "./Depiction";
import Layout from "./Layout";
import IdentifiedChain from "biocad/IdentifiedChain";

export default class DepictionRefByChain {

    private chain:IdentifiedChain

    constructor(d:Depiction) {

        if(d.identifiedChain === undefined) {
            throw new Error('attempted to ref a depiction by id chain but it didnt have one')
        }

        this.chain = d.identifiedChain
    }

    toDepiction(layout:Layout):Depiction|undefined {
        return layout.getDepictionForIdentifiedChain(this.chain)
    }

}
