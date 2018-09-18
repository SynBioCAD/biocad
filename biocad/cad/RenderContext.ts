
import { Vec2 } from "jfw/geom";
import Layout from "biocad/cad/Layout";

interface RenderContext {

    layout:Layout
    scrollOffset:Vec2
    scaleFactor:number
    interactive:boolean

}

export default RenderContext
