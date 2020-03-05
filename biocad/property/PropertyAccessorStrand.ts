
import PropertyAccessor from "./PropertyAccessor";
import { triple, Graph, node, S3SubComponent, S3SequenceFeature, S3ThingWithLocation, sbol3 } from 'sbolgraph'

export default class PropertyAccessorStrand extends PropertyAccessor<string> {

    object:string
    onChange:undefined|(()=>void)

    constructor(object:string, onChange?:()=>void) {
        super()
        this.object = object
        this.onChange = onChange
    }

    set(graph:Graph, value:string) {

        let scOrSeqFeature = sbol3(graph).uriToFacade(this.object)

        if(! (scOrSeqFeature instanceof S3ThingWithLocation))
            return

        scOrSeqFeature.setOrientation(value)

        if(this.onChange)
            this.onChange()
    }

    get(graph:Graph):string {
        let scOrSeqFeature = sbol3(graph).uriToFacade(this.object)

        if(! (scOrSeqFeature instanceof S3ThingWithLocation))
            return ''

        return scOrSeqFeature.getOrientation() || ''
    }
}
