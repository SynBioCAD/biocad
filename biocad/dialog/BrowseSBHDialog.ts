
import Dialog from "jfw/ui/dialog/Dialog";
import BiocadApp from "biocad/BiocadApp";
import { DialogOptions } from "jfw/ui/dialog";
import { Repository, S3Component } from "sbolgraph"
import { SearchQuery, SearchResult } from "sbolgraph"
import { Specifiers, Types } from "bioterms";
import { h, VNode } from "jfw/vdom";
import { click as clickEvent } from 'jfw/event'
import { InspectComponentDialogOptions } from "biocad/dialog/InspectComponentDialog"
import InspectComponentDialog from "biocad/dialog/InspectComponentDialog"
import App from "jfw/App";

export class BrowseSBHDialogOptions extends DialogOptions {

    constructor() {

        super()

        this.query = new SearchQuery()
        this.targetComponent = null
    }

    query:SearchQuery
    targetComponent:S3Component|null

}

export default class BrowseSBHDialog extends Dialog {

    repo:Repository

    results:SearchResult[]

    query:SearchQuery

    targetComponent:S3Component|null

    onUsePart:(part:S3Component)=>void

    constructor(app:BiocadApp, opts:BrowseSBHDialogOptions) {

        super(app, opts)

        this.query = opts.query
        this.targetComponent = opts.targetComponent

        this.setTitle('Find Part')

        this.setWidthAndCalcPosition('75%')

        this.repo = new Repository('https://synbiohub.org')

        this.results = []

        this.query.addObjectType('ComponentDefinition')

        this.repo.searchMetadata(this.query).then((results:SearchResult[]) => {

            this.results = results
            this.update()

        })
    }

    getContentView():VNode {

        let criteraItems:VNode[] = []

        for(let c of this.query.criteria) {

            if(c.key === 'objectType')
                continue

            let t = JSON.stringify(c)


            criteraItems.push(h('span.addremove-item', [
                h('span.addremove-remove.fa.fa-times-circle'),
                ' ' + t
            ]))
        }

        criteraItems.push(h('span.addremove-add', [
            h('span.fa.fa-plus')
        ]))

        return h('div', [

            h('span.addremove', criteraItems),
            
            h('table.jfw-list', [

                h('thead', [
                    h('th', 'Name'),
                    h('th', 'Description'),
                ]),

                h('tbody', {
                    'ev-click': clickEvent(clickResult, { dialog: this })
                }, this.results.map((result:SearchResult) => {

                    return h('tr', {
                        dataset: {
                            uri: result.uri
                        }
                    }, [
                        h('td', result.name),
                        h('td', result.description)
                    ])

                }))
            ])
        ])

    }

}

function clickResult(data) {

    const dialog:BrowseSBHDialog = data.dialog

    var element = data.target

    while(!element.tagName || element.tagName.toLowerCase() !== 'tr') {
        element = element.parentNode

        if(!element)
            return
    }

    const uri = element.dataset['uri']


    const inspectDialogOpts:InspectComponentDialogOptions = new InspectComponentDialogOptions()
    inspectDialogOpts.uri = uri
    inspectDialogOpts.parent = dialog
    inspectDialogOpts.targetComponent = dialog.targetComponent

    const app:App = dialog.app

    const inspectDialog:InspectComponentDialog = new InspectComponentDialog(app as BiocadApp, inspectDialogOpts)

    if(dialog.onUsePart)
        inspectDialog.onUsePart = dialog.onUsePart

    app.openDialog(inspectDialog)


}

