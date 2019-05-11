
import { View } from 'jfw/ui'
import { SXComponent, SBOLXGraph, SXSequence } from 'sbolgraph';
import BiocadApp from 'biocad/BiocadApp';
import { h } from 'jfw/vdom'
import { click as clickEvent } from 'jfw/event'
import fileDialog = require('file-dialog')
import copySBOL from 'biocad/util/copySBOL';
import BrowseSBHDialog, { BrowseSBHDialogOptions } from 'biocad/dialog/BrowseSBHDialog';

export default class SequenceWizard extends View {

    component:SXComponent

    onLoadedSequence:()=>void

    constructor(app:BiocadApp, component:SXComponent) {

        super(app)

        this.component = component
    }

    render() {

        return h('div', {
            style: {
                'text-align': 'center'
            }
        }, [
            h('br'),
            this.component.displayName + ' does not yet have a sequence',
            h('br'),
            h('br'),
            h('a', {
                'ev-click': clickEvent(clickImport, { view: this })
            }, [
                h('span.fa.fa-folder-open'),
                ' Import FASTA/GenBank/SBOL'
            ]),
            h('br'),
            h('br'),
            h('a', {
                'ev-click': clickEvent(clickSearch, { view: this })
            }, [
                h('span.fa.fa-search'),
                ' Search for parts'
            ]),
            h('br'),
            h('br'),
            h('a', {
                'ev-click': clickEvent(clickEdit, { view: this })
            }, [
                h('span.fa.fa-edit'),
                ' Edit sequence manually'
            ])
        ])
    }
}

async function clickImport(data) {

    let view = data.view

    let file = await fileDialog()

    if(file && file[0]) {

        let reader = new FileReader()

        reader.onload = async (ev) => {

            if(!ev.target)
                return

            let g = await SBOLXGraph.loadString(reader.result + '', file[0].type)

            let seq = g.sequences[0]

            if(!seq) {
                console.error('no sequences in file')
            }
            
            // TODO: allow picking sequence if multiple (SBOL only)

            let c:SXComponent = view.component

            let identityMap = copySBOL(g, c.graph, c.uriPrefix)

            let newSeqUri = identityMap.get(seq.uri)

            if(!newSeqUri) {
                throw new Error('???')
            }

            let newSeq = c.graph.uriToFacade(newSeqUri)

            if(! (newSeq instanceof SXSequence)) {
                // TODO: graceful error
                throw new Error('???')
            }

            c.addSequence(newSeq)

            view.onLoadedSequence()
        }

        reader.readAsText(file[0])
    }



}

async function clickSearch(data) {

    let view:SequenceWizard = data.view

    let app = view.app as BiocadApp
    let graph = app.graph
    let component = view.component
 
    let opts = new BrowseSBHDialogOptions()
    opts.modal = true
    opts.targetComponent = component

    for(let role of component.roles) {
        opts.query.addRole(role)
    }

    let dialog = new BrowseSBHDialog(app, opts)

    app.openDialog(dialog)

}

async function clickEdit(data) {

    let view:SequenceWizard = data.view

    let app = view.app as BiocadApp
    let graph = app.graph
    let component = view.component

    let newSeq = graph.createSequence(component.uriPrefix, component.id + '_sequence', component.version)
    component.addSequence(newSeq)

    view.onLoadedSequence()

}

