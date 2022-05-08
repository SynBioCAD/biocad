
import { VNode } from "@biocad/jfw/vdom";
import { Vec2 } from "@biocad/jfw/geom";

export default abstract class Droppable {

    abstract render():VNode
    abstract getSize():Vec2

}