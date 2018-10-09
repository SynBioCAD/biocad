
import { View } from 'jfw/ui'
import { CodeMirrorWidget } from 'jfw/ui/widget'
import { h, VNode } from 'jfw/vdom'
import BiocadApp from "biocad/BiocadApp";
import LayoutPOD from "biocad/cad/LayoutPOD";
import EncodingSelector, { Encoding } from './EncodingSelector';
import { SBOL2Graph, Graph } from 'sbolgraph';
import CytoscapeRDFWidget from 'biocad/view/CytoscapeRDFWidget'

export default class SourceView extends View {

    encodingSelector:EncodingSelector
    source:string
    graph:Graph|undefined

    constructor(app) {

        super(app)

        this.source = ''
        this.encodingSelector = new EncodingSelector(app)

        this.encodingSelector.onChangeEncoding = (encoding:Encoding) => {
            this.updateSerialization()
        }
    }

    async updateSerialization() {

        const app:BiocadApp = this.app as BiocadApp

        const graph = app.graph

        let sbol2Graph = new SBOL2Graph()
        await sbol2Graph.loadString(graph.serializeXML())

        switch(this.encodingSelector.currentEncoding) {
            case Encoding.SBOLX:
                this.source = graph.serializeXML()
                break
            case Encoding.SBOL2:
                this.source = sbol2Graph.serializeXML()
                break
            case Encoding.SBOLXGraph:
                this.source = ''
                this.graph = graph
                break
            case Encoding.SBOL2Graph:
                this.source = ''
                this.graph = sbol2Graph
                break
        }

        this.update()

    }

    activate() {

        this.updateSerialization()

    }

    render() {

        const app = this.app as BiocadApp
        const graph = app.graph

        var widget:any

        if(this.graph) {

            widget = new CytoscapeRDFWidget(this.graph)

        } else {

         widget = 
            new CodeMirrorWidget({

                lineNumbers: true,
                //viewportMargin: Infinity,
                mode: 'xml',
                value: this.source,
                readOnly: true
                                
            }, {

                width: '100%',
                height: '100%',

                /*
                position: 'absolute',
                left: 0,
                top: (topbarHeight + languageBarHeight) + 'px',
                width: '100%',
                height: (bodyHeight - topbarHeight - languageBarHeight) + 'px'*/
                                
            })
        }

        return h('div.jfw-main-view-no-sidebar', {
            style: {
                width: '100%',
                height: '100%'
            }
        }, [
            h('div.jfw-flow-ttb', {
                style: {
                    width: '100%',
                    height: '100%'
                }
            }, [
                this.encodingSelector.render(),
                widget
            ])
        ])

    }


}


