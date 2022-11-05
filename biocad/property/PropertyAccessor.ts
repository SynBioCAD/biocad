import { Graph } from "sboljs";

export default abstract class PropertyAccessor<T> {

    abstract get(graph:Graph):T
    abstract set(graph:Graph, newValue:T)
}
