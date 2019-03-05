
import { Rect } from "jfw/geom";
import Depiction, { Opacity } from "biocad/cad/Depiction";
import { SBOLXGraph, SXComponent, SXSubComponent } from "sbolgraph";
import Layout from "biocad/cad/Layout";
import DND, { DNDResult } from "./DND";
import ComponentDepiction from "../ComponentDepiction";
import IdentifiedChain from "../../IdentifiedChain";

// Allows a ComponentD to be dragged from its parent and become a root in the workspace

// As DNDEnterParent comes earlier in the chain that should catch the parent before
// we get here. so we can assume there was no viable parent to move into and it has to
// go into the workspace?

export default class DNDEnterWorkspace extends DND {

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

            // Currently, we're a depictionOf a subcomponent.
            // As we're moving to the workspace area, we need to become a depictionOf the component itself.
            // Rather than letting syncAllDepictions create the new depiction, change the existing depiction
            // manually using changeDepictionOf.
            // This is necesary because:
            //  - if this component is instantiated as a subcomponent elsewhere, sync won't bother making a
            //    depiction of the definition
            //  - we want to preserve the dragging state of this depiction. if a new depiction was created it
            //    would no longer be being dragged.
            //
            newLayout.changeDepictionOf(dInNewLayout, dOf.instanceOf, new IdentifiedChain().extend(dOf.instanceOf))

            dOf.destroy()

            console.log('targetbbox topLeft ' + targetBBox.topLeft + ' for ' + dInNewLayout.uid)

            newLayout.syncAllDepictions(5)
            newLayout.configurate([])

            dInNewLayout.offsetExplicit = true
            dInNewLayout.offset = parent.absoluteOffset.add(targetBBox.topLeft)

            return { newLayout, newGraph }
        }


}



