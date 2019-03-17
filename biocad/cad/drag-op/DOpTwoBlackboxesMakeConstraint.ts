
import { Rect } from "jfw/geom";
import Depiction, { Opacity, Fade } from "biocad/cad/Depiction";
import { SBOLXGraph, SXComponent, SXSubComponent } from "sbolgraph";
import Layout from "biocad/cad/Layout";
import DOp, { DOpResult } from "./DOp";
import ComponentDepiction from "../ComponentDepiction";
import IdentifiedChain from "../../IdentifiedChain";

// Allows a blackbox ComponentD to be dragged onto another blackbox ComponentD to form a constraint

export default class DOpTwoBlackboxesMakeConstraint extends DOp {

    test(
        sourceLayout:Layout, sourceGraph:SBOLXGraph,
        targetLayout:Layout, targetGraph:SBOLXGraph,
        sourceDepiction:Depiction,
        targetBBox:Rect,
        ignoreURIs:string[]):DOpResult|null {

        if(! (sourceDepiction instanceof ComponentDepiction))
            return null

        if(sourceDepiction.opacity !== Opacity.Blackbox)
            return null



        let intersections:Depiction[] = targetLayout.getDepictionsIntersectingRect(targetBBox, false)

        for(let intersecting of intersections) {

            if(intersecting === sourceDepiction)
                continue

            if(! (intersecting instanceof ComponentDepiction))
                continue

            let ignored = false
            for (let uri of ignoreURIs) {
                if (intersecting.identifiedChain && intersecting.identifiedChain.containsURI(uri)) {
                    ignored = true
                    break
                }
            }
            if (ignored)
                continue

            if(intersecting.opacity !== Opacity.Blackbox)
                continue
            


            let ourDOf = sourceDepiction._depictionOf
            let theirDOf = intersecting._depictionOf

            if(ourDOf === undefined || theirDOf === undefined)
                continue


            let newGraph = targetGraph.clone()
            newGraph.addAll(sourceGraph)
            ourDOf = newGraph.uriToFacade(ourDOf.uri)
            theirDOf = newGraph.uriToFacade(theirDOf.uri)


            let newLayout = targetLayout.cloneWithNewGraph(newGraph)

            let existingDepictionInNewLayout:Depiction|undefined = undefined

            if(sourceLayout === targetLayout) {
                existingDepictionInNewLayout = newLayout.getDepictionForUid(sourceDepiction.uid)
            }

            let chain = new IdentifiedChain()

            if (intersecting && intersecting.parent && intersecting.parent.identifiedChain) {
                chain = intersecting.parent.identifiedChain
            }

            if(theirDOf instanceof SXComponent) {

                // Joining with a component. wrap it and use createAfter

                let wrapper:SXComponent = theirDOf.wrap('untitled')
                chain = chain.extend(wrapper)

                wrapper.setBoolProperty('http://biocad.io/terms/untitled', true)

                let scInWrapper = wrapper.subComponents[0]

                if(scInWrapper === undefined)
                    throw new Error('???')

                let newSc:SXSubComponent|undefined = undefined

                if(ourDOf instanceof SXComponent) {

                    newSc = scInWrapper.createAfter(ourDOf)

                    chain = chain.extend(newSc)

                    if(existingDepictionInNewLayout) {
                        newLayout.changeDepictionOf(existingDepictionInNewLayout, newSc, chain)
                    }

                } else if(ourDOf instanceof SXSubComponent) {

                    newSc = scInWrapper.createAfter(ourDOf.instanceOf)

                    chain = chain.extend(newSc)

                    if(existingDepictionInNewLayout) {
                        newLayout.changeDepictionOf(existingDepictionInNewLayout, newSc, chain)
                    }

                    ourDOf.destroy()

                } else {
                    throw new Error('???')
                }

                newLayout.syncAllDepictions(5)

                let dOfWrapper = newLayout.getDepictionsForUri(wrapper.uri)[0]

                if(dOfWrapper === undefined) {
                    throw new Error('???')
                }



                /*
                dOfWrapper.setFade(Fade.Partial)
                let scD = newLayout.getDepictionForUriChain(newSc.uriChain)
                if(!scD) {
                    throw new Error('???')
                }
                scD.setFade(Fade.None)*/




                if(intersecting.offsetExplicit) {
                    dOfWrapper.offsetExplicit = true
                    dOfWrapper.offset = intersecting.offset
                }

                newLayout.configurate([])

                return { newGraph, newLayout, validForRect: dOfWrapper.absoluteBoundingBox }


            } else if(theirDOf instanceof SXSubComponent) {

                // Joining with a SC. use createAfter

                let newSc:SXSubComponent|undefined = undefined

                if(ourDOf instanceof SXComponent) {

                    newSc = theirDOf.createAfter(ourDOf)
                    chain = chain.extend(newSc)

                    if(existingDepictionInNewLayout) {
                        newLayout.changeDepictionOf(existingDepictionInNewLayout, newSc, chain)
                    }

                } else if(ourDOf instanceof SXSubComponent) {

                    newSc = theirDOf.createAfter(ourDOf.instanceOf)
                    chain = chain.extend(newSc)

                    if(existingDepictionInNewLayout) {
                        newLayout.changeDepictionOf(existingDepictionInNewLayout, newSc, chain)
                    }

                    ourDOf.destroy()

                } else {
                    throw new Error('???')
                }

                newLayout.syncAllDepictions(5)

                newLayout.configurate([])

                let newD = newLayout.getDepictionsForUri(newSc.uri)[0]

                if(!newD) {
                    throw new Error('???')
                }

                return {
                    newGraph,
                    newLayout,
                    //validForRect: intersecting.absoluteBoundingBox.surround(newD.absoluteBoundingBox).expand(1)
                    validForRect: intersecting.absoluteBoundingBox.expand(1)
                }

            } else {
                throw new Error('???')
            }


        }


        return null
    }

}

