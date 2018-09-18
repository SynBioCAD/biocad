
import { View } from 'jfw/ui'
import { CodeMirrorWidget } from 'jfw/ui/widget'
import { h, VNode } from 'jfw/vdom'
import BiocadApp from "biocad/BiocadApp";
import LayoutPOD from "biocad/cad/LayoutPOD";

export default class SourceView extends View {

    source:string

    constructor(app) {

        super(app)

        this.source = ''
    }

    activate() {

        const app:BiocadApp = this.app as BiocadApp

        const graph = app.graph

        this.source = graph.serializeXML()
        app.update()
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
            widget
        ])

    }


}


