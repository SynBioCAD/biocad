
import { Rect } from "@biocad/jfw/geom";
import Depiction, { Opacity } from "biocad/cad/layout/Depiction";
import { Graph, S3Component, S3SubComponent, sbol3 } from "sbolgraph";
import Layout from "biocad/cad/layout/Layout";
import DOp, { DOpResult } from "./DOp";
import ComponentDepiction from "../layout/ComponentDepiction";
import IdentifiedChain from "../../IdentifiedChain";

// Allows a ComponentD to be dragged from its parent and become a root in the workspace

// As DOpEnterParent comes earlier in the chain that should catch the parent before
// we get here. so we can assume there was no viable parent to move into and it has to
// go into the workspace?

export default class DOpEnterWorkspace extends DOp {

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
            
            if(!sourceDepiction.parent)
                return null // Already in workspace

            for(let intersecting of targetLayout.getDepictionsIntersectingRect(targetBBox, false)) {
                if(!intersecting.isDescendentOf(sourceDepiction)) {
                    return null // Overlapping something else
                }
            }

            let newGraph = targetGraph.clone()
            let newLayout = targetLayout.cloneWithNewGraph(newGraph)


            let dOf = sourceDepiction.depictionOf

            if(!dOf) {
                throw new Error('???')
            }

            let dOfInNewGraph = sbol3(newGraph).uriToFacade(dOf.uri)

            if(! (dOfInNewGraph instanceof S3SubComponent)) {
                throw new Error('???')
            }




            let instanceOf = dOfInNewGraph.instanceOf

            dOfInNewGraph.destroy()

            newLayout.syncAllDepictions(5)
            newLayout.configurate([])




            let ds = newLayout.getDepictionsForUri(instanceOf.uri)

            if(ds.length === 0) {
                throw new Error('???')
            }

            // highest uid is most recently modified
            ds.sort((a, b) => b.uid - a.uid)

            let newD = ds[0]


            newD.offsetExplicit = true
            //dInNewLayout.offset = parent.absoluteOffset.add(targetBBox.topLeft)
            newD.offset = targetBBox.topLeft

            return { newLayout, newGraph, replacements: [
                {
                    old: sourceDepiction,
                    new: newD
                }
             ] }
        }


}



