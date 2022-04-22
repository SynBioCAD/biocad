

import { View } from "@biocad/jfw/ui";
import { VNode, h, create, svg } from "@biocad/jfw/vdom";
import BiocadApp from "biocad/BiocadApp";
import { Graph, SBOL3GraphView, sbol3 } from "sbolgraph"
import { Types } from "bioterms";
import { S3Component } from "sbolgraph";
import Layout from "biocad/cad/layout/Layout";
import LayoutThumbnail from "biocad/cad/LayoutThumbnail";
import SBOLDroppable from "biocad/droppable/SBOLDroppable";
import CircuitMode from 'biocad/mode/circuit/CircuitMode'
import { node } from 'rdfoo'

import { click as clickEvent } from '@biocad/jfw/event'

export default class PartSummaryView extends View {

    graph:Graph|null
    uri:string

    layout:Layout|null
    layoutThumbnail:LayoutThumbnail|null

    constructor(app:BiocadApp, uri:string) {

        super(app)


        this.graph = null
        this.uri = uri
        this.layout = null
        this.layoutThumbnail = null


        fetch(uri + '/sbol').then(async r => {

            let str = await r.text()

            SBOL3GraphView.loadString(str).then((gv:SBOL3GraphView) => {

                this.graph = gv.graph
                this.layout = new Layout(gv.graph)
                this.layout.syncAllDepictions(5)
                this.layout.configurate([])
                this.layoutThumbnail = new LayoutThumbnail(app, this.layout)

                this.layoutThumbnail.attr = {
                    style: {
                        'max-width': '100%'
                    }
                }

                this.update()

            })

        })

    }

    activate() { 



    }

    render():VNode {

        const elements:VNode[] = []

        if(this.graph === null) {

            elements.push(h('div.loader'))

        } else {

            const type:string|undefined = sbol3(this.graph).getType(node.createUriNode(this.uri))

            elements.push(this.renderComponent())
        }

        return h('div.jfw-flow-grow.jfw-flow-ttb.jfw-light', [
            elements
        ])
        
    }

    private renderComponent():VNode {

        if(this.graph === null || this.layoutThumbnail === null)
            throw new Error('???')

        const cd:S3Component = new S3Component(sbol3(this.graph), node.createUriNode(this.uri))

        const elements:VNode[] = []

        elements.push(h('div.jfw-flow-ltr', [
            h('h1', {
                style: {
                    'flex-grow': '0.5'
                }
            }, cd.displayName),
            h('h1', {
                style: {
                    'flex-grow': '0.5'
                }
            }, h('button.jfw-big-button', {
                'ev-click': clickEvent(onClickUsePart, { view: this, part: cd })
            }, 'Use Part'))
        ]))
            

        if(cd.description)
            elements.push(h('p', cd.description))

        elements.push(this.layoutThumbnail.render())


        return h('div', elements)
    }

    onClickUsePart(part:any) {

        if(this.graph === null)
            throw new Error('???')

        const app:BiocadApp = this.app as BiocadApp

        if(part instanceof S3Component) {

            app.setMode(app.modes.filter((mode) => mode instanceof CircuitMode)[0])
            app.dropOverlay.startDropping(new SBOLDroppable(app, this.graph, [ part.uri ]))

        }

    }

}

function onClickUsePart(data) {

    const { view, part } = data

    view.onClickUsePart(part)

}
