
import { Rect } from "jfw/geom";
import Depiction, { Opacity } from "biocad/cad/Depiction";
import { SBOLXGraph, SXComponent, SXSubComponent } from "sbolgraph";
import Layout from "biocad/cad/Layout";
import DOp, { DOpResult } from "./DOp";
import ComponentDepiction from "../ComponentDepiction";

// Allows children to be moved around inside their parent

// This DOp modifies the layout in place
// so maybe shouldn't be a DOp at all

export default class DOpMoveInParent extends DOp {

    test(
        sourceLayout:Layout, sourceGraph:SBOLXGraph,
        targetLayout:Layout, targetGraph:SBOLXGraph,
        sourceDepiction:Depiction,
        targetBBox:Rect,
        ignoreURIs:string[]):DOpResult|null {

            if(sourceLayout !== targetLayout)
                return null

            if(sourceGraph !== targetGraph)
                return null
            
            let parent = sourceDepiction.parent
            
            if(!parent)
                return null // I only allow dragging things with a parent

            let relativeNewTopLeft = targetBBox.topLeft.subtract(parent.offset)

            let label = sourceDepiction.label

            if(label) {
                let labelOffset = label.offset.subtract(sourceDepiction.offset)

                sourceDepiction.offset = relativeNewTopLeft
                label.offset = relativeNewTopLeft.add(labelOffset)

            } else {
                sourceDepiction.offset = relativeNewTopLeft
            }

            parent.size = parent.size.max(sourceDepiction.boundingBox.bottomRight)

            return { replacements: [] }

        }

}



