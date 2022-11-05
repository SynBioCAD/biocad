
import PropertyAccessor from "./PropertyAccessor";
import { triple, Graph, node } from 'sboljs'

export default class PropertyAccessorURISet extends PropertyAccessor<string[]> {

    object:string
    predicate:string
    onChange:undefined|(()=>void)

    constructor(object:string, predicate:string, onChange?:()=>void) {
        super()
        this.object = object
        this.predicate = predicate
        this.onChange = onChange
    }

    set(graph:Graph, values:string[]) {

        graph.removeMatches(node.createUriNode(this.object), this.predicate, null)

        for(let value of values)
            graph.insertTriple(node.createUriNode(this.object), this.predicate, node.createUriNode(value))

        if(this.onChange)
            this.onChange()
    }

    get(graph:Graph):string[] {
        return graph.match(node.createUriNode(this.object), this.predicate, null).map(triple.objectUri) as string[]
    }
}
