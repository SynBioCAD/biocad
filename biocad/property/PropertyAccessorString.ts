import PropertyAccessor from "./PropertyAccessor";
import { triple, Graph, node } from 'sbolgraph'

export default class PropertyAccessorSimple extends PropertyAccessor<string> {

    object:string
    predicate:string
    onChange:undefined|(()=>void)

    constructor(object:string, predicate:string, onChange?:()=>void) {
        super()
        this.object = object
        this.predicate = predicate
        this.onChange = onChange
    }

    set(graph:Graph, value:string) {
        graph.removeMatches(this.object, this.predicate, null)
        graph.insert(this.object, this.predicate, node.createStringNode(value))

        if(this.onChange)
            this.onChange()
    }

    get(graph:Graph):string {
        let value:string|undefined = triple.objectString(
            graph.matchOne(this.object, this.predicate, null)
        )
        return value || ''
    }
}
