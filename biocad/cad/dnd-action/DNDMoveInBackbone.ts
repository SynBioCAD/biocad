
import { Rect, Vec2 } from "jfw/geom";
import Depiction, { Opacity } from "biocad/cad/Depiction";
import { SBOLXGraph, SXComponent, SXSubComponent } from "sbolgraph";
import Layout from "biocad/cad/Layout";
import DND, { DNDResult } from "./DND";
import ComponentDepiction from "../ComponentDepiction";
import BackboneDepiction from "../BackboneDepiction";

// Allows parts to be moved horizontally along a backbone

export default class DNDMoveInBackbone extends DND {

    test(
        sourceLayout:Layout, sourceGraph:SBOLXGraph,
        targetLayout:Layout, targetGraph:SBOLXGraph,
        sourceDepiction:Depiction,
        targetBBox:Rect,
        ignoreURIs:string[]):DNDResult|null {

            if(sourceLayout !== targetLayout)
                return null

            if(sourceGraph !== targetGraph)
                return null
            
            if(! (sourceDepiction.parent instanceof BackboneDepiction))
                return null

            let backbone = sourceDepiction.parent


            let newLayout = sourceLayout.clone()

            let dInNewLayout = newLayout.getDepictionForUid(sourceDepiction.uid)

            if(!dInNewLayout) {
                throw new Error('???')
            }

            dInNewLayout.offsetExplicit = true

            dInNewLayout.offset = Vec2.fromXY(
                targetBBox.topLeft.subtract(backbone.absoluteOffset).x,
                dInNewLayout.offset.y
            )

            if(dInNewLayout instanceof ComponentDepiction) {

                let constrained = dInNewLayout.getConstrainedSiblings()

                for(let d of constrained) {
                    d.offsetExplicit = true
                }
            }

            newLayout.configurate([])

            return { newLayout }

        }

}



