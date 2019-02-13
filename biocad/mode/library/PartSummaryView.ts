

import View from "jfw/ui/View";
import { VNode, h, create, svg } from "jfw/vdom";
import BiocadApp from "biocad/BiocadApp";
import { SBOLXGraph } from "sbolgraph"
import { Types } from "bioterms";
import { SXComponent } from "sbolgraph";
import Layout from "biocad/cad/Layout";
import LayoutThumbnail from "biocad/cad/LayoutThumbnail";
import SBOLDroppable from "biocad/droppable/SBOLDroppable";
import CircuitMode from 'biocad/mode/circuit/CircuitMode'

import { click as clickEvent } from 'jfw/event'

export default class PartSummaryView extends View {

    graph:SBOLXGraph|null
    uri:string

    layout:Layout|null
    layoutThumbnail:LayoutThumbnail|null

    constructor(app:BiocadApp, uri:string) {

        super(app)


        this.graph = null
        this.uri = uri
        this.layout = null
        this.layoutThumbnail = null


        SBOLXGraph.loadURL(uri + '/sbol').then((graph:SBOLXGraph) => {

            this.graph = graph
            this.layout = new Layout(graph)
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

    }

    activate() { 



    }

    render():VNode {

        const elements:VNode[] = []

        if(this.graph === null) {

            elements.push(h('div.loader'))

        } else {

            const type:string|undefined = this.graph.getType(this.uri)

            elements.push(this.renderComponent())
        }

        return h('div.jfw-flow-grow.jfw-flow-ttb.jfw-light', [
            elements
        ])
        
    }

    private renderComponent():VNode {

        if(this.graph === null || this.layoutThumbnail === null)
            throw new Error('???')

        const cd:SXComponent = new SXComponent(this.graph, this.uri)

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

        if(part instanceof SXComponent) {

            app.setMode(app.modes.filter((mode) => mode instanceof CircuitMode)[0])
            app.dropOverlay.startDropping(new SBOLDroppable(app, this.graph, [ part.uri ]))

        }

    }

}

function onClickUsePart(data) {

    const { view, part } = data

    view.onClickUsePart(part)

}
