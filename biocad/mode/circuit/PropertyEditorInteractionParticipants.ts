
import PropertyEditor from './PropertyEditor'
import { SXParticipation } from 'sbolgraph'
import { click as clickEvent } from 'jfw/event'
import BiocadApp from 'biocad/BiocadApp'
import OntologyTermSelectorDialog from 'biocad/dialog/OntologyTermSelectorDialog'
import sbo from 'data/systems-biology-ontology'
import { SBOLXGraph, SXInteraction } from 'sbolgraph'
import { h } from 'jfw/vdom'

export default class PropertyEditorInteractionParticipants extends PropertyEditor {

    app:BiocadApp
    interactionURI:string

    constructor(app:BiocadApp, interactionURI:string) {
        super()
        this.interactionURI = interactionURI
        this.app = app
    }

    render(graph:SBOLXGraph) {

        let interaction = graph.uriToFacade(this.interactionURI)

        if(! (interaction instanceof SXInteraction)) {
            return h('tr', [])
        }

        let component = interaction.containingModule

        let editor = this

        return h('tr', interaction.participations.map((participation:SXParticipation) => {
            return h('span', [
                h('span', [
                    renderComponentSelector()
                ]),
                h('span', [
                    renderRoleSelector(participation)
                ]),
            ])
        }))

        function renderComponentSelector() {
            return h('select', component.subComponents.map((subComponent) => {
                return h('option', subComponent.displayName)
            }))
        }

        // TODO code duplication from PropertyEditorTermSet
        //
        function renderRoleSelector(participation) {
            return h('span.addremove', participation.roles.map((role) => {
                return h('span.addremove-item', [
                    h('span.addremove-remove.fa.fa-times-circle', {
                        'ev-click': clickEvent(clickRemoveRole, { editor, participation, role })
                    }),
                    sbo[uriToTerm(role)].name
                ])
            }).concat([
                h('span.addremove-add.fa.fa-plus-circle', {
                    'ev-click': clickEvent(clickChooseRole, { editor, participation })
                })
            ]))
        }

    }
}

async function clickChooseRole(data) {

    let editor:PropertyEditorInteractionParticipants = data.editor
    let participation:SXParticipation = data.participation

    let app = editor.app

    let term:string|null = await OntologyTermSelectorDialog.selectTerm(app, 'Choose participant role', null, sbo, 'SBO:0000003')

    if(term !== null) {
        participation.addRole(term)
    }

}

function clickRemoveRole(data) {

    let editor:PropertyEditorInteractionParticipants = data.editor
    let participation:SXParticipation = data.participation
    let role:string = data.role

    participation.removeRole(role)

}

function uriToTerm(uri:string):string {
    return uri.split('/').pop() as string
}

function termToURI(term:string):string {
    return 'http://identifiers.org/biomodels.sbo/' + term
}

