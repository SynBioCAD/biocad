
import { Rect, Vec2 } from "jfw/geom";
import Depiction, { Opacity } from "biocad/cad/Depiction";
import { SBOLXGraph, SXComponent, SXSubComponent } from "sbolgraph";
import Layout from "biocad/cad/Layout";
import DOp, { DOpResult } from "./DOp";
import ComponentDepiction from "../ComponentDepiction";
import BackboneDepiction from "../BackboneDepiction";

// Allows parts to be moved horizontally along a backbone

export default class DOpMoveInBackbone extends DOp {

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
            
            if(! (sourceDepiction.parent instanceof BackboneDepiction))
                return null

            let backbone = sourceDepiction.parent


            if(targetBBox.topLeft.y < backbone.absoluteBoundingBox.topLeft.y - 1) {
                return null
            }

            if(targetBBox.bottomRight.y > backbone.absoluteBoundingBox.bottomRight.y + 1) {
                return null
            }


            let newLayout = sourceLayout.clone()

            let dInNewLayout = newLayout.getDepictionForUid(sourceDepiction.uid)

            if(!dInNewLayout) {
                throw new Error('???')
            }

            dInNewLayout.offsetExplicit = true

            dInNewLayout.offset = Vec2.fromXY(
                Math.max(targetBBox.topLeft.subtract(backbone.absoluteOffset).x, 0),
                dInNewLayout.offset.y
            )

            if(dInNewLayout instanceof ComponentDepiction) {

                let constrained = dInNewLayout.getConstrainedSiblings()

                for(let d of constrained) {
                    d.offsetExplicit = true
                }
            }

            newLayout.configurate([])

            return { newLayout , replacements: [] }

        }

}



