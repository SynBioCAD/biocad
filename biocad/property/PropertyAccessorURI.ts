
import PropertyAccessor from "./PropertyAccessor";
import { triple, Graph, node } from 'sbolgraph'

export default class PropertyAccessorURI extends PropertyAccessor<string> {

    object:string
    predicate:string

    constructor(object:string, predicate:string) {
        super()
        this.object = object
        this.predicate = predicate
    }

    set(graph:Graph, value:string) {
        graph.removeMatches(this.object, this.predicate, null)
        graph.insert(this.object, this.predicate, node.createUriNode(value))
    }

    get(graph:Graph):string {
        let value:string|undefined = triple.objectUri(
            graph.matchOne(this.object, this.predicate, null)
        )
        return value || ''
    }
}
