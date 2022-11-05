
import { View } from '@biocad/jfw/ui'
import { h, VNode } from '@biocad/jfw/vdom'

import RemoveURIPrefixDialog from './RemoveURIPrefixDialog'

import { click as clickEvent } from '@biocad/jfw/event'
import { Graph, sbol3 } from "sboljs";
import BiocadApp from "biocad/BiocadApp";
import { TextInput } from '@biocad/jfw/ui';
import BiocadProject from '../../BiocadProject';

export default class SetupCurrentDocumentView extends View {

	project:BiocadProject

    organism:TextInput

    constructor(project) {

        super(project)

	this.project = project

        this.organism = new TextInput(this, '')

    }

    activate():void {


    }

    render():VNode {

        const project:BiocadProject = this.project
        const graph:Graph = project.graph


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

    const project = view.project

    project.dialogs.openDialog(new RemoveURIPrefixDialog(project, {

        removeUriPrefix: {
            uriPrefix: uriPrefix
        }

    }))

}


