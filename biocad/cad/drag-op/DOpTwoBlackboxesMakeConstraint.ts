
import { Rect } from "jfw/geom";
import Depiction, { Opacity, Fade } from "biocad/cad/layout/Depiction";
import { Graph, S3Component, S3SubComponent, Facade, S3Identified, sbol3 } from "sbolgraph";
import Layout from "biocad/cad/layout/Layout";
import DOp, { DOpResult } from "./DOp";
import ComponentDepiction from "../layout/ComponentDepiction";
import IdentifiedChain from "../../IdentifiedChain";

// Allows a blackbox ComponentD to be dragged onto another blackbox ComponentD to form a constraint

export default class DOpTwoBlackboxesMakeConstraint extends DOp {

    test(
        sourceLayout:Layout, sourceGraph:Graph,
        targetLayout:Layout, targetGraph:Graph,
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
            


            let ourDOf:Facade|undefined = sourceDepiction._depictionOf
            let theirDOf:Facade|undefined = intersecting._depictionOf

            if(ourDOf === undefined || theirDOf === undefined)
                continue


            let newGraph = targetGraph.clone()
            newGraph.graph.addAll(sourceGraph.graph)
            ourDOf = sbol3(newGraph).uriToFacade(ourDOf.uri)
            theirDOf = sbol3(newGraph).uriToFacade(theirDOf.uri)

            let newLayout = targetLayout.cloneWithNewGraph(newGraph)

            let chain = new IdentifiedChain()

            if (intersecting && intersecting.parent && intersecting.parent.identifiedChain) {
                chain = intersecting.parent.identifiedChain
            }

            if(theirDOf instanceof S3Component) {

                // Joining with a component. wrap it and use createAfter

                let wrapper:S3Component = theirDOf.wrap('untitled')
                chain = chain.extend(wrapper)

                wrapper.setBoolProperty('http://biocad.io/terms/untitled', true)

                let scInWrapper = wrapper.subComponents[0]

                if(scInWrapper === undefined)
                    throw new Error('???')

                let newSc:S3SubComponent|undefined = undefined

                if(ourDOf instanceof S3Component) {

                    newSc = scInWrapper.createAfter(ourDOf)

                    chain = chain.extend(newSc)

                } else if(ourDOf instanceof S3SubComponent) {

                    newSc = scInWrapper.createAfter(ourDOf.instanceOf)

                    chain = chain.extend(newSc)

                    ourDOf.destroy()

                } else {
                    throw new Error('???')
                }

                newLayout.syncAllDepictions(5)

                let wrapperDepiction = newLayout.getDepictionsForUri(wrapper.uri)[0]

                if(wrapperDepiction === undefined) {
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
                    wrapperDepiction.offsetExplicit = true
                    wrapperDepiction.offset = intersecting.offset
                }

                for(let child of wrapperDepiction.children) {
                    child.offsetExplicit = false
                }

                newLayout.configurate([])

                return { newGraph, newLayout, validForRect: wrapperDepiction.absoluteBoundingBox, replacements: [] }


            } else if(theirDOf instanceof S3SubComponent) {

                // Joining with a SC. use createAfter

                let newSc:S3SubComponent|undefined = undefined

                if(ourDOf instanceof S3Component) {

                    newSc = theirDOf.createAfter(ourDOf)
                    chain = chain.extend(newSc)

                } else if(ourDOf instanceof S3SubComponent) {

                    newSc = theirDOf.createAfter(ourDOf.instanceOf)
                    chain = chain.extend(newSc)

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
                    validForRect: intersecting.absoluteBoundingBox.expand(1),
                    replacements: []
                }

            } else {
                throw new Error('???')
            }


        }


        return null
    }

}

