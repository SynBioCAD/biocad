
import { Rect } from "jfw/geom";
import Depiction, { Opacity } from "biocad/cad/Depiction";
import { SBOLXGraph, SXComponent, SXSubComponent } from "sbolgraph";
import Layout from "biocad/cad/Layout";
import DND, { DNDResult } from "./DND";
import LabelledDepiction from "../LabelledDepiction";
import ComponentDepiction from "../ComponentDepiction";

// Allows roots to be moved around
// Put this later in the list so moving into parents etc takes priority

// This DND modifies the layout in place
// so maybe shouldn't be a dnd

export default class DNDMoveInWorkspace extends DND {

    test(
        sourceLayout:Layout, sourceGraph:SBOLXGraph,
        targetLayout:Layout, targetGraph:SBOLXGraph,
        sourceDepiction:Depiction,
        targetBBox:Rect):DNDResult|null {

            if(sourceLayout !== targetLayout)
                return null

            if(sourceGraph !== targetGraph)
                return null
            
            if(sourceDepiction.parent)
                return null // I only allow dragging roots

            sourceDepiction.absoluteOffset = targetBBox.topLeft

            return {}

        }

}



