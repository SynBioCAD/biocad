
import PropertyAccessor from "./PropertyAccessor";
import { triple, SBOLXGraph, node } from 'sbolgraph'

export default class PropertyAccessorURISet extends PropertyAccessor<string[]> {

    object:string
    predicate:string

    constructor(object:string, predicate:string) {
        super()
        this.object = object
        this.predicate = predicate
    }

    set(graph:SBOLXGraph, values:string[]) {

        graph.removeMatches(this.object, this.predicate, null)

        for(let value of values)
            graph.insert(this.object, this.predicate, node.createUriNode(value))
    }

    get(graph:SBOLXGraph):string[] {
        return graph.match(this.object, this.predicate, null).map(triple.objectUri) as string[]
    }
}
