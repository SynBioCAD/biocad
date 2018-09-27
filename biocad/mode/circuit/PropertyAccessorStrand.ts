
import PropertyAccessor from "./PropertyAccessor";
import { triple, SBOLXGraph, node, SXSubComponent, SXSequenceFeature, SXThingWithLocation } from 'sbolgraph'

export default class PropertyAccessorStrand extends PropertyAccessor {

    object:string
    onChange:undefined|(()=>void)

    constructor(object:string, onChange?:()=>void) {
        super()
        this.object = object
        this.onChange = onChange
    }

    set(graph:SBOLXGraph, value:string) {

        let scOrSeqFeature = graph.uriToFacade(this.object)

        if(! (scOrSeqFeature instanceof SXThingWithLocation))
            return

        scOrSeqFeature.setOrientation(value)

        if(this.onChange)
            this.onChange()
    }

    get(graph:SBOLXGraph):string {
        let scOrSeqFeature = graph.uriToFacade(this.object)

        if(! (scOrSeqFeature instanceof SXThingWithLocation))
            return ''

        return scOrSeqFeature.getOrientation() || ''
    }
}
