
import { View } from 'jfw/ui'
import { h, svg, VNode } from 'jfw/vdom'

import SequenceViewSidebar from './SequenceViewSidebar'
import SequenceEditor from './SequenceEditor'

import CreateComponentDialog, { CreateComponentDialogDefaults } from '../../dialog/CreateComponentDialog'
import { App } from "jfw";
import BiocadApp from "biocad/BiocadApp";
import { SXComponent } from "sbolgraph";

var n = 0

export default class SequenceView extends View {

    source:string
    sidebar:SequenceViewSidebar
    sequenceEditor:SequenceEditor

    constructor(_app:App) {

        const app = _app as BiocadApp

        super(app)

        this.source = ''
        this.sidebar = new SequenceViewSidebar(app)
        this.sequenceEditor = new SequenceEditor(app)


        this.sidebar.onSelect((component:SXComponent) => {

            this.sequenceEditor.setComponent(component)

        })

        this.sidebar.onCreate((type, parentUri) => {

            app.openDialog(new CreateComponentDialog(app, {

                modal: true,
                parent: null,

                componentType: type,
                componentParentUri: parentUri
            
            }, new CreateComponentDialogDefaults()))

        })
    }

    activate():void {

        //const app = this.app
        //const graph = app.graph

    }

    render():VNode {

        //const sidebar:Sidebar = this.sidebar

        console.time('render seq view')
        const res:VNode = h('div.jfw-main-view.sf-sequence-view', {
        }, [
            this.sequenceEditor.render()
        ])
        console.timeEnd('render seq view')


        return res
    }
}


