import { SBOLXGraph } from "sbolgraph";

export default abstract class PropertyAccessor {

    abstract get(graph:SBOLXGraph):string
    abstract set(graph:SBOLXGraph, newValue:string)
}