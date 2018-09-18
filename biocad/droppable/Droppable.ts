
import { VNode } from "jfw/vdom";
import Vec2 from "jfw/geom/Vec2";

export default abstract class Droppable {

    abstract render():VNode
    abstract getSize():Vec2

}