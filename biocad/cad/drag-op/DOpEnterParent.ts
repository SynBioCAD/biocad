
import { Rect } from "@biocad/jfw/geom";
import Depiction, { Opacity } from "biocad/cad/layout/Depiction";
import { Graph, S3Component, S3SubComponent, sbol3 } from "sboljs";
import Layout from "biocad/cad/layout/Layout";
import DOp, { DOpResult } from "./DOp";
import ComponentDepiction from "../layout/ComponentDepiction";
import BackboneDepiction from "../layout/BackboneDepiction";

export default class DOpEnterParent extends DOp {

    test(
        sourceLayout:Layout, sourceGraph:Graph,
        targetLayout:Layout, targetGraph:Graph,
        sourceDepiction:Depiction,
        targetBBox:Rect,
        ignoreURIs:string[]):DOpResult|null {

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

                if(intersecting instanceof ComponentDepiction) {
                    if(intersecting.opacity === Opacity.Blackbox) {
                        continue
                    }
                }

                // Ok let's do it

                let newGraph = targetGraph.clone()

                if(targetGraph !== sourceGraph) {
                    newGraph.graph.addAll(sourceGraph.graph)
                }

                let newLayout = targetLayout.cloneWithNewGraph(newGraph)



                let intersectingInNewLayout = newLayout.getDepictionForUid(intersecting.uid)
                
                if(!intersectingInNewLayout) {
                    throw new Error('???')
                }




                let intersectingInNewLayoutDOf = intersectingInNewLayout.depictionOf

                if(!intersectingInNewLayoutDOf) {
                    throw new Error('???')
                }

                var newParentC:S3Component|undefined

                if(intersectingInNewLayoutDOf instanceof S3SubComponent) {
                    newParentC = intersectingInNewLayoutDOf.instanceOf
                } else if(intersectingInNewLayoutDOf instanceof S3Component) {
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

                let dOf = sbol3(newGraph).uriToFacade(srcDOf.uri)

                if(!dOf) {
                    throw new Error('???')
                }

                let sc:S3SubComponent|undefined = undefined

                if(dOf instanceof S3SubComponent) {

                    // already a sc
                    // create new sc in parent, delete our dOf

                    sc = newParentC.createSubComponent(dOf.instanceOf)

                    dOf.destroy()

                } else if(dOf instanceof S3Component) {

                    // a c
                    // create new sc in parent

                    sc = newParentC.createSubComponent(dOf)
                }

                if(!sc) {
                    throw new Error('???')
                }

                newLayout.syncAllDepictions(5)

                
                let ds = newLayout.getDepictionsForUri(sc.uri)

                if(ds.length === 0) {
                    throw new Error('???')
                }

                // highest uid is most recently modified
                ds.sort((a, b) => b.uid - a.uid)

                let newD = ds[0]


                newD.offsetExplicit = sourceDepiction.offsetExplicit

                if(sourceDepiction.parent)
                    newD.offset = sourceDepiction.offset.add(sourceDepiction.parent.offset)



                newLayout.configurate([])


                return {
                    newLayout,
                    newGraph,
                    validForRect:intersecting.absoluteBoundingBox.expand(1),
                    replacements: [
                        {
                            old: sourceDepiction,
                            new: newD
                        }
                    ]
                }

            }

            return null


        }


}