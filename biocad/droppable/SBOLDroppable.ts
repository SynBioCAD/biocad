
import { S3Component } from "sbolgraph";

import Droppable from "./Droppable";
import { Graph } from "sbolgraph"
import Layout from "biocad/cad/Layout";
import LayoutThumbnail from "biocad/cad/LayoutThumbnail";
import BiocadApp from "biocad/BiocadApp";
import { VNode } from "jfw/vdom";
import Vec2 from "jfw/geom/Vec2";
import Rect from "jfw/geom/Rect";
import Depiction from "biocad/cad/Depiction";
import { S3SubComponent, S3SequenceFeature, S3Identified, S3OrientedLocation } from "sbolgraph"
import { Specifiers } from "bioterms";
import MarginInstruction from "../cad/layout-instruction/MarginInstruction";

export default class SBOLDroppable extends Droppable {

    graph:Graph
    topLevelURIs:string[]|undefined
    ignoreForDragOps:string[]|undefined

    layout:Layout
    thumb:LayoutThumbnail

    constructor(app:BiocadApp, graph:Graph, topLevelURIs?:string[], ignoreForDragOps?:string[]) {

        super()

        this.graph = graph
        this.topLevelURIs = topLevelURIs
        this.ignoreForDragOps = ignoreForDragOps

        this.layout = new Layout(graph)

        if(this.topLevelURIs)
            this.layout.syncDepictions(5, this.topLevelURIs)
        else
            this.layout.syncAllDepictions(5)

        this.layout.configurate([
            new MarginInstruction(0, 0, 0, 0)
        ])
        this.layout.size = this.layout.getBoundingSize()

        this.thumb = new LayoutThumbnail(app, this.layout)
    }

    render():VNode {

        return this.thumb.render()

    }

    getSize():Vec2 {

        return this.layout.getBoundingSize().multiply(this.layout.gridSize)

    }

    /*
    finalizeDrop(newGraph:Graph, depiction:Depiction):void {

        newGraph.addAll(this.graph)


        if(depiction.depictionOf === undefined)
            throw new Error('???')


        const realDepictionOf:S3Identified|undefined = newGraph.uriToFacade(depiction.depictionOf.uri)

        if(realDepictionOf === undefined)
            throw new Error('???')

        depiction.depictionOf = realDepictionOf


        if(depiction.parent) {

            const parentDepictionOf:S3Identified|undefined = depiction.parent.depictionOf

            if(parentDepictionOf === undefined)
                throw new Error('???')

            var cDef:S3Component|null = null

            if(parentDepictionOf instanceof S3Component) {
                cDef = parentDepictionOf as S3Component
            } else if(parentDepictionOf instanceof S3SubComponent) {
                cDef = (parentDepictionOf as S3SubComponent).instanceOf
            }

            if(cDef !== null) {

                var c:S3SubComponent|undefined = undefined

                if(realDepictionOf instanceof S3Component) {
                    c = cDef.createSubComponent(realDepictionOf as S3Component)
                } else if(realDepictionOf instanceof S3SubComponent) {
                    c = realDepictionOf as S3SubComponent
                    cDef.createSubComponent((realDepictionOf as S3SubComponent).instanceOf)
                }

                if(!c)
                    throw new Error('???')

                const loc:S3OrientedLocation = c.addOrientedLocation()
                loc.orientation = Specifiers.SBOL2.Orientation.Inline
            }
        }


    }*/
}