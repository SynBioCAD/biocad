
import PropertyAccessor from "./PropertyAccessor";
import { triple, Graph, node } from 'sboljs'

export default class PropertyAccessorURI extends PropertyAccessor<string> {

    object:string
    predicate:string

    constructor(object:string, predicate:string) {
        super()
        this.object = object
        this.predicate = predicate
    }

    set(graph:Graph, value:string) {
        graph.removeMatches(node.createUriNode(this.object), this.predicate, null)
        graph.insertTriple(node.createUriNode(this.object), this.predicate, node.createUriNode(value))
    }

    get(graph:Graph):string {
        let value:string|undefined = triple.objectUri(
            graph.matchOne(node.createUriNode(this.object), this.predicate, null)
        )
        return value || ''
    }
}
