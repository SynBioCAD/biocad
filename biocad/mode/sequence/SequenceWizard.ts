
import { View } from '@biocad/jfw/ui'
import { S3Component, Graph, S3Sequence, SBOL3GraphView, sbol3 } from 'sbolgraph';
import BiocadApp from 'biocad/BiocadApp';
import { h } from '@biocad/jfw/vdom'
import { click as clickEvent } from '@biocad/jfw/event'
import fileDialog = require('file-dialog')
import copySBOL from 'biocad/util/copySBOL';
import BrowseSBHDialog, { BrowseSBHDialogOptions } from 'biocad/dialog/BrowseSBHDialog';

export default class SequenceWizard extends View {

    component:S3Component

    // sometimes a different component because we might swap it with
    // one from a registry
    //
    onLoadedPart:(component:S3Component)=>void

    constructor(app:BiocadApp, component:S3Component) {

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

            let gv = await SBOL3GraphView.loadString(reader.result + '', file[0].type)

            let seq = gv.sequences[0]

            if(!seq) {
                console.error('no sequences in file')
            }
            
            // TODO: allow picking sequence if multiple (SBOL only)

            let c:S3Component = view.component

            let identityMap = copySBOL(gv.graph, c.graph, c.uriPrefix)

            let newSeqUri = identityMap.get(seq.uri)

            if(!newSeqUri) {
                throw new Error('???')
            }

            let newSeq = sbol3(c.graph).uriToFacade(newSeqUri)

            if(! (newSeq instanceof S3Sequence)) {
                // TODO: graceful error
                throw new Error('???')
            }

            c.addSequence(newSeq)

            view.onLoadedPart(c)
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

    dialog.onUsePart = (c:S3Component) => {
        view.onLoadedPart(c)
    }
}

async function clickEdit(data) {

    let view:SequenceWizard = data.view

    let app = view.app as BiocadApp
    let graph = app.graph
    let component = view.component

    let newSeq = sbol3(graph).createSequence(component.uriPrefix, component.displayId + '_sequence')
    component.addSequence(newSeq)

    view.onLoadedPart(component)

}

