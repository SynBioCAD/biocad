
import { SXComponent } from "sbolgraph";

import Droppable from "./Droppable";
import { SBOLXGraph } from "sbolgraph"
import Layout from "biocad/cad/Layout";
import LayoutThumbnail from "biocad/cad/LayoutThumbnail";
import BiocadApp from "biocad/BiocadApp";
import { VNode } from "jfw/vdom";
import Vec2 from "jfw/geom/Vec2";
import Rect from "jfw/geom/Rect";
import Depiction from "biocad/cad/Depiction";
import { SXSubComponent, SXSequenceFeature, SXIdentified, SXOrientedLocation } from "sbolgraph"
import { Specifiers } from "bioterms";
import MarginInstruction from "../cad/layout-instruction/MarginInstruction";

export default class SBOLDroppable extends Droppable {

    graph:SBOLXGraph
    uri:string


    layout:Layout
    thumb:LayoutThumbnail

    constructor(app:BiocadApp, graph:SBOLXGraph, uri:string) {

        super()

        this.graph = graph
        this.uri = uri

        this.layout = new Layout(graph)
        this.layout.syncAllDepictions(5)
        this.layout.configurate([
            new MarginInstruction(0, 0, 0, 0)
        ])

        this.thumb = new LayoutThumbnail(app, this.layout)
    }

    render():VNode {

        return this.thumb.render()

    }

    getSize():Vec2 {

        return this.layout.getBoundingSize().multiply(this.layout.gridSize)

    }

    finalizeDrop(newGraph:SBOLXGraph, depiction:Depiction):void {

        newGraph.addAll(this.graph)


        if(depiction.depictionOf === undefined)
            throw new Error('???')


        const realDepictionOf:SXIdentified|undefined = newGraph.uriToFacade(depiction.depictionOf.uri)

        if(realDepictionOf === undefined)
            throw new Error('???')

        depiction.depictionOf = realDepictionOf


        if(depiction.parent) {

            const parentDepictionOf:SXIdentified|undefined = depiction.parent.depictionOf

            if(parentDepictionOf === undefined)
                throw new Error('???')

            var cDef:SXComponent|null = null

            if(parentDepictionOf instanceof SXComponent) {
                cDef = parentDepictionOf as SXComponent
            } else if(parentDepictionOf instanceof SXSubComponent) {
                cDef = (parentDepictionOf as SXSubComponent).instanceOf
            }

            if(cDef !== null) {

                var c:SXSubComponent|undefined = undefined

                if(realDepictionOf instanceof SXComponent) {
                    c = cDef.createSubComponent(realDepictionOf as SXComponent)
                } else if(realDepictionOf instanceof SXSubComponent) {
                    c = realDepictionOf as SXSubComponent
                    cDef.createSubComponent((realDepictionOf as SXSubComponent).instanceOf)
                }

                if(!c)
                    throw new Error('???')

                const loc:SXOrientedLocation = c.addOrientedLocation()
                loc.orientation = Specifiers.SBOL2.Orientation.Inline
            }
        }


    }
}