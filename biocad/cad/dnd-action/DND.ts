
import Layout from "biocad/cad/Layout";
import { SBOLXGraph } from "sbolgraph";
import Depiction from "biocad/cad/Depiction";
import { Rect } from "jfw/geom";

export interface DNDResult {
    newLayout?:Layout|undefined
    newGraph?:SBOLXGraph|undefined
    validForRect?:Rect|undefined
}

export default abstract class DND {

    // Each DND needs to handle both dropping from the palette and
    // moving in the layout.
    //
    // Current the palette works on intersections of the bbox you're dropping
    // and moving works on mouse pos (cos the mouse is visible)
    // lets just give the mouse pos as a 1px bbox then
    //
    // When the DND is applicable it can generate
    //      - A new layout (OPTIONAL)
    //      - A new graph (OPTIONAL)
    //
    // If neither are given we were not applicable
    // If the graph is given and the layout is not, the layout can be drawn from the graph
    // If the layout is given and the graph is not, we assume the dnd did not affect the underlying sbol
    // If both are given happy days
    //

    abstract test(
        sourceLayout:Layout, sourceGraph:SBOLXGraph,
        targetLayout:Layout, targetGraph:SBOLXGraph,
        sourceDepiction:Depiction,
        targetBBox:Rect):DNDResult|null

}
