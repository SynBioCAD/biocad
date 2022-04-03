
import { View } from '@biocad/jfw/ui'
import { h, VNode } from '@biocad/jfw/vdom'

import RemoveURIPrefixDialog from './RemoveURIPrefixDialog'

import { click as clickEvent } from '@biocad/jfw/event'
import { Graph, sbol3 } from "sbolgraph";
import BiocadApp from "biocad/BiocadApp";
import TextInput from '@biocad/jfw/ui/form-control/TextInput';

export default class SetupCurrentDocumentView extends View {

    organism:TextInput

    constructor(app) {

        super(app)

        this.organism = new TextInput(this, '')

    }

    activate():void {


    }

    render():VNode {

        const app:BiocadApp = this.app as BiocadApp
        const graph:Graph = app.graph


        return h('div.jfw-main-view.sf-setup-view', {
        }, [

            h('label.jfw-form-label', 'Host Organism'),
            h('div.jfw-form-group', [
                this.organism.render()
            ]),

            h('label.jfw-form-label', 'URI Prefixes'),
            h('div.jfw-form-group', [
                h('table', [
                    h('th', 'Prefix'),
                    h('th', 'Default'),
                    h('th'),
                    h('tbody', 
                        sbol3(graph).uriPrefixes.map((uriPrefix) => {
                            return h('tr', [
                                h('td', [
                                    h('div.sf-setup-uri-prefix', h('code', uriPrefix))
                                ]),
                                h('td', [
                                    h('input', {
                                        type: 'radio'
                                    })
                                ]),
                                h('td.jfw-hover-actions', [
                                    '\u00a0',
                                    '\u00a0',
                                    h('span.fa.fa-pencil', {
                                    }),
                                    '\u00a0',
                                    '\u00a0',
                                    h('span.fa.fa-times', {
                                        'ev-click': clickEvent(clickRemoveURIPrefix, { view: this, uriPrefix: uriPrefix })
                                    }),
                                ]),
                            ])
                        })
                    )
                ])
            ])
        ])

    }


}

function clickRemoveURIPrefix(data) {

    const { view, uriPrefix } = data

    const app = view.app

    app.openDialog(new RemoveURIPrefixDialog(app, {

        removeUriPrefix: {
            uriPrefix: uriPrefix
        }

    }))

}


