
import Dialog from "jfw/ui/dialog/Dialog";
import BiocadApp from "biocad/BiocadApp";
import { DialogOptions } from "jfw/ui/dialog";
import { Repository } from "sbolgraph"
import { SearchQuery, SearchResult } from "sbolgraph"
import { Specifiers, Types } from "bioterms";
import { h, VNode } from "jfw/vdom";
import { click as clickEvent } from 'jfw/event'
import { InspectComponentDialogOptions } from "biocad/dialog/InspectComponentDialog"
import InspectComponentDialog from "biocad/dialog/InspectComponentDialog"
import App from "jfw/App";

export class BrowseSBHDialogOptions extends DialogOptions {

    query:SearchQuery

}

export default class BrowseSBHDialog extends Dialog {

    repo:Repository

    results:SearchResult[]

    constructor(app:BiocadApp, opts:BrowseSBHDialogOptions) {

        super(app, opts)

        this.setTitle('Find Part')

        this.setWidthAndCalcPosition('75%')

        this.repo = new Repository('https://synbiohub.org')

        this.results = []

        opts.query.addObjectType('ComponentDefinition')

        this.repo.searchMetadata(opts.query).then((results:SearchResult[]) => {

            this.results = results
            this.update()

        })
    }

    getContentView():VNode {

        return h('table.jfw-list', [

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

    }

}

function clickResult(data) {

    const dialog:BrowseSBHDialog = data.dialog

    var element = data.target

    while(element.tagName.toLowerCase() !== 'tr')
        element = element.parentNode

    const uri = element.dataset['uri']


    const inspectDialogOpts:InspectComponentDialogOptions = new InspectComponentDialogOptions()
    inspectDialogOpts.uri = uri
    inspectDialogOpts.parent = dialog

    const app:App = dialog.app

    const inspectDialog:InspectComponentDialog = new InspectComponentDialog(app as BiocadApp, inspectDialogOpts)

    app.openDialog(inspectDialog)


}

