import { SBOLXGraph } from "sbolgraph";

export default abstract class PropertyAccessor<T> {

    abstract get(graph:SBOLXGraph):T
    abstract set(graph:SBOLXGraph, newValue:T)
}
