
import { Rect } from "jfw/geom";
import Depiction, { Opacity } from "biocad/cad/Depiction";
import { SBOLXGraph, SXComponent, SXSubComponent } from "sbolgraph";
import Layout from "biocad/cad/Layout";
import DND, { DNDResult } from "./DND";
import LabelledDepiction from "../LabelledDepiction";

// Allows a ComponentD to be dragged into a parent ComponentD to become a child

export default class DNDEnterParent extends DND {

    test(
        sourceLayout:Layout, sourceGraph:SBOLXGraph,
        targetLayout:Layout, targetGraph:SBOLXGraph,
        sourceDepiction:Depiction,
        targetBBox:Rect,
        ignoreURIs:string[]):DNDResult|null {

            let intersectingDs = targetLayout.getDepictionsIntersectingRect(targetBBox, false)

            if(sourceDepiction.parent) {
                if (intersectingDs.indexOf(sourceDepiction.parent) !== -1) {
                    return null // Still overlapping our parent
                }
            }

            for(let intersecting of intersectingDs) {

                let ignored = false
                for(let uri of ignoreURIs) {
                    if(intersecting.identifiedChain && intersecting.identifiedChain.containsURI(uri)) {
                        ignored = true
                        break
                    }
                }
                if(ignored)
                    continue

                if(intersecting.isDescendentOf(sourceDepiction)) {
                    continue // Can't become a parent of our child
                }

                if(!intersecting.isSelectable()) {
                    continue
                }

                if(intersecting instanceof LabelledDepiction) {
                    if(intersecting.getLabelled().opacity === Opacity.Blackbox) {
                        continue
                    }
                }

                // Ok let's do it

                let newGraph = targetGraph.clone()

                if(targetGraph !== sourceGraph) {
                    newGraph.addAll(sourceGraph)
                }

                let newLayout = targetLayout.cloneWithNewGraph(newGraph)


                let existingDInNewLayout:Depiction|undefined = undefined

                if(sourceLayout === targetLayout) {

                    existingDInNewLayout = newLayout.getDepictionForUid(sourceDepiction.uid)

                    if(!existingDInNewLayout) {
                        throw new Error('???')
                    }

                    // Remove us from our current parent
                    let parent = existingDInNewLayout.parent

                    if(parent) {
                        parent.removeChild(existingDInNewLayout)
                    }
                }


                let intersectingInNewLayout = newLayout.getDepictionForUid(intersecting.uid)
                
                if(!intersectingInNewLayout) {
                    throw new Error('???')
                }




                let intersectingInNewLayoutDOf = intersectingInNewLayout.depictionOf

                if(!intersectingInNewLayoutDOf) {
                    throw new Error('???')
                }

                var newParentC:SXComponent|undefined

                if(intersectingInNewLayoutDOf instanceof SXSubComponent) {
                    newParentC = intersectingInNewLayoutDOf.instanceOf
                } else if(intersectingInNewLayoutDOf instanceof SXComponent) {
                    newParentC = intersectingInNewLayoutDOf
                } else {
                    throw new Error('???')
                }

                let chain = intersectingInNewLayout.identifiedChain

                if(chain === undefined) {
                    throw new Error('???')
                }

                let srcDOf = sourceDepiction.depictionOf

                if(!srcDOf) {
                    throw new Error('???')
                }

                let dOf = newGraph.uriToFacade(srcDOf.uri)

                if(!dOf) {
                    throw new Error('???')
                }

                if(dOf instanceof SXSubComponent) {

                    // already a sc
                    // create new sc in parent, set our dOf to that, delete our dOf

                    let sc = newParentC.createSubComponent(dOf.instanceOf)

                    if(existingDInNewLayout) {
                        newLayout.changeDepictionOf(existingDInNewLayout, sc, chain.extend(sc))
                    }

                    dOf.destroy()

                } else if(dOf instanceof SXComponent) {

                    // a c
                    // create new sc in parent, set our dOf to that

                    let sc = newParentC.createSubComponent(dOf)

                    if(existingDInNewLayout) {
                        newLayout.changeDepictionOf(existingDInNewLayout, sc, chain.extend(sc))
                    }
                }

                newLayout.syncAllDepictions(5)
                newLayout.configurate([])

                return { newLayout, newGraph, validForRect:intersecting.absoluteBoundingBox.expand(1) }

            }

            return null


        }


}