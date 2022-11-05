
import { View } from '@biocad/jfw/ui'
import { h, svg, VNode } from '@biocad/jfw/vdom'

import SequenceViewSidebar from './SequenceViewSidebar'
import SequenceEditor from './SequenceEditor'

import CreateComponentDialog, { CreateComponentDialogDefaults } from '../../dialog/CreateComponentDialog'
import BiocadApp from "biocad/BiocadApp";
import { S3Component } from "sboljs";
import SequenceWizard from './SequenceWizard';
import BiocadProject from '../../BiocadProject'

var n = 0

export default class SequenceView extends View {

	project:BiocadProject

    source:string
    sidebar:SequenceViewSidebar
    sequenceEditor:SequenceEditor
    sequenceWizard:SequenceWizard|null

    constructor(_project:BiocadProject) {

        const project = _project

        super(project)
	this.project = project

        this.source = ''
        this.sidebar = new SequenceViewSidebar(project)
        this.sequenceEditor = new SequenceEditor(project)


        let select = (component:S3Component) => {
            let seq = component.sequences[0]

            if(seq) {
                this.sequenceEditor.setComponent(component)
                this.sequenceWizard = null
            } else {
                this.sequenceWizard = new SequenceWizard(project, component)
                this.sequenceWizard.onLoadedPart = (c:S3Component) => {
                    this.sequenceEditor.setComponent(c)
                    this.sequenceWizard = null
                }
            }
        }

        this.sidebar.onSelect.listen(select)
        
        this.sidebar.onCreate.listen((created) => {

            let { type, parentUri } = created

            project.dialogs.openDialog(new CreateComponentDialog(project, {

                modal: true,
                parent: null,

                componentType: type,
                componentParentUri: parentUri,
                onCreate: (c:S3Component) => {
                    select(c)
                    this.sidebar.select(c)
                }
            
            }, new CreateComponentDialogDefaults()))

        })
    }

    activate():void {

        //const project = this.project
        //const graph = project.graph

	this.sidebar.browser.tree.refresh()
    }

    render():VNode {

        //const sidebar:Sidebar = this.sidebar

        let main = h('div', {
            style: {
                'text-align': 'center'
            }
        }, [
            h('br'),
            'Select or create a part to edit sequence'
        ])

        if(this.sequenceWizard)
            main = this.sequenceWizard.render()
        else if (this.sequenceEditor.component)
            main = this.sequenceEditor.render()

        console.time('render seq view')
        const res:VNode = h('div.jfw-main-view.sf-sequence-view', {
        }, [
            main
        ])
        console.timeEnd('render seq view')


        return res
    }
}


