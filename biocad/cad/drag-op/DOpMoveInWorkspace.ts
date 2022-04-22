
import { Rect } from "@biocad/jfw/geom";
import Depiction, { Opacity } from "biocad/cad/layout/Depiction";
import { Graph, S3Component, S3SubComponent } from "sbolgraph";
import Layout from "biocad/cad/layout/Layout";
import DOp, { DOpResult } from "./DOp";

// Allows roots to be moved around
// Put this later in the list so moving into parents etc takes priority

// This DOp modifies the layout in place
// so maybe shouldn't be a DOp at all

export default class DOpMoveInWorkspace extends DOp {

    test(
        sourceLayout:Layout, sourceGraph:Graph,
        targetLayout:Layout, targetGraph:Graph,
        sourceDepiction:Depiction,
        targetBBox:Rect,
        ignoreURIs:string[]):DOpResult|null {

            if(sourceLayout !== targetLayout)
                return null

            if(sourceGraph !== targetGraph)
                return null
            
            if(sourceDepiction.parent)
                return null // I only allow dragging roots

            let label = sourceDepiction.label

            if(label) {
                let labelOffset = label.offset.subtract(sourceDepiction.offset)

                sourceDepiction.absoluteOffset = targetBBox.topLeft
                label.absoluteOffset = targetBBox.topLeft.add(labelOffset)

            } else {
                sourceDepiction.absoluteOffset = targetBBox.topLeft
            }

            return { replacements: [] }

        }

}



