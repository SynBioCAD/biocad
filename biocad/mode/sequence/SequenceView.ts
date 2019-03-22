
import { View } from 'jfw/ui'
import { h, svg, VNode } from 'jfw/vdom'

import SequenceViewSidebar from './SequenceViewSidebar'
import SequenceEditor from './SequenceEditor'

import CreateComponentDialog, { CreateComponentDialogDefaults } from '../../dialog/CreateComponentDialog'
import { App } from "jfw";
import BiocadApp from "biocad/BiocadApp";
import { SXComponent } from "sbolgraph";
import SequenceWizard from './SequenceWizard';

var n = 0

export default class SequenceView extends View {

    source:string
    sidebar:SequenceViewSidebar
    sequenceEditor:SequenceEditor
    sequenceWizard:SequenceWizard|null

    constructor(_app:App) {

        const app = _app as BiocadApp

        super(app)

        this.source = ''
        this.sidebar = new SequenceViewSidebar(app)
        this.sequenceEditor = new SequenceEditor(app)


        let select = (component:SXComponent) => {
            let seq = component.sequence

            if(seq) {
                this.sequenceEditor.setComponent(component)
                this.sequenceWizard = null
            } else {
                this.sequenceWizard = new SequenceWizard(app, component)
                this.sequenceWizard.onLoadedSequence = () => {
                    this.sequenceEditor.setComponent(component)
                    this.sequenceWizard = null
                }
            }
        }

        this.sidebar.onSelect(select)
        
        this.sidebar.onCreate((type, parentUri) => {

            app.openDialog(new CreateComponentDialog(app, {

                modal: true,
                parent: null,

                componentType: type,
                componentParentUri: parentUri,
                onCreate: (c:SXComponent) => {
                    select(c)
                    this.sidebar.select(c)
                }
            
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
            this.sequenceWizard ? this.sequenceWizard.render() : this.sequenceEditor.render()
        ])
        console.timeEnd('render seq view')


        return res
    }
}


