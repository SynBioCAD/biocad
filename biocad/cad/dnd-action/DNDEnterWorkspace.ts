
import { Rect } from "jfw/geom";
import Depiction, { Opacity } from "biocad/cad/Depiction";
import { SBOLXGraph, SXComponent, SXSubComponent } from "sbolgraph";
import Layout from "biocad/cad/Layout";
import DND, { DNDResult } from "./DND";
import LabelledDepiction from "../LabelledDepiction";
import ComponentDepiction from "../ComponentDepiction";

// Allows a ComponentD to be dragged from its parent and become a root in the workspace

// As DNDEnterParent comes earlier in the chain that should catch the parent before
// we get here. so we can assume there was no viable parent to move into and it has to
// go into the workspace?

export default class DNDEnterWorkspace extends DND {

    test(
        sourceLayout:Layout, sourceGraph:SBOLXGraph,
        targetLayout:Layout, targetGraph:SBOLXGraph,
        sourceDepiction:Depiction,
        targetBBox:Rect):DNDResult|null {

            if(sourceLayout !== targetLayout)
                return null

            if(sourceGraph !== targetGraph)
                return null
            
            if(!sourceDepiction.parent)
                return null // Already in workspace

            for(let intersecting of targetLayout.getDepictionsIntersectingRect(targetBBox, false)) {
                if(!intersecting.isDescendentOf(sourceDepiction)) {
                    return null // Overlapping something else
                }
            }

            let newGraph = targetGraph.clone()
            let newLayout = targetLayout.cloneWithNewGraph(newGraph)

            let dInNewLayout = newLayout.getDepictionForUid(sourceDepiction.uid)

            if(!dInNewLayout) {
                throw new Error('???')
            }

            let parent = dInNewLayout.parent

            if(!parent) {
                throw new Error('???')
            }

            parent.removeChild(dInNewLayout)

            let dOf = dInNewLayout.depictionOf

            if(! (dOf instanceof SXSubComponent)) {
                throw new Error('???')
            }

            // become a depictionof the definition
            newLayout.changeDepictionOf(dInNewLayout, dOf.instanceOf)

            dOf.destroy()

            dInNewLayout.offsetExplicit = true
            dInNewLayout.offset = targetBBox.topLeft

            newLayout.syncAllDepictions(5)
            newLayout.configurate([])

            return { newLayout, newGraph }
        }


}



