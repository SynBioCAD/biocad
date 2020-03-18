
import Layout from "biocad/cad/layout/Layout";
import { Graph } from "sbolgraph";
import Depiction from "biocad/cad/layout/Depiction";
import { Rect } from "jfw/geom";

export interface DOpResult {

    newLayout?:Layout|undefined
    newGraph?:Graph|undefined

    replacements:Array<{ old:Depiction, new:Depiction }>

    validForRect?:Rect|undefined
}

export default abstract class DOp {

    // Each DOp needs to handle both dropping from the palette and
    // moving in the layout.
    //
    // Current the palette works on intersections of the bbox you're dropping
    // and moving works on mouse pos (cos the mouse is visible)
    // lets just give the mouse pos as a 1px bbox then
    //
    // When the DOp is applicable it can generate
    //      - A new layout (OPTIONAL)
    //      - A new graph (OPTIONAL)
    //
    // If neither are given we were not applicable
    // If the graph is given and the layout is not, the layout can be drawn from the graph
    // If the layout is given and the graph is not, we assume the DOp did not affect the underlying sbol
    // If both are given happy days
    //

    abstract test(
        sourceLayout:Layout, sourceGraph:Graph,
        targetLayout:Layout, targetGraph:Graph,
        sourceDepiction:Depiction,
        targetBBox:Rect,
        ignoreURIs:string[]):DOpResult|null

}
