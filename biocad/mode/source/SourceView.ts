
import { View } from 'jfw/ui'
import { CodeMirrorWidget } from 'jfw/ui/widget'
import { h, VNode } from 'jfw/vdom'
import BiocadApp from "biocad/BiocadApp";
import LayoutPOD from "biocad/cad/LayoutPOD";
import EncodingSelector, { Encoding } from './EncodingSelector';
import { convertToSBOL2 } from 'sbolgraph'

export default class SourceView extends View {

    encodingSelector:EncodingSelector
    source:string

    constructor(app) {

        super(app)

        this.source = ''
        this.encodingSelector = new EncodingSelector(app)

        this.encodingSelector.onChangeEncoding = (encoding:Encoding) => {
            this.updateSerialization()
        }
    }

    updateSerialization() {

        const app:BiocadApp = this.app as BiocadApp

        const graph = app.graph

        switch(this.encodingSelector.currentEncoding) {
            case Encoding.SBOLX:
                this.source = graph.serializeXML()
                break
            case Encoding.SBOL2:
                let sbol2Graph = convertToSBOL2(graph)
                this.source = sbol2Graph.serializeXML()
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

        const widget = 
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

        return h('div.jfw-main-view-no-sidebar', {
        }, [
            h('div.jfw-flow-ttb', [
                this.encodingSelector.render(),
                widget
            ])
        ])

    }


}


