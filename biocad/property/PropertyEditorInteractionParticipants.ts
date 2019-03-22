
import PropertyEditor from './PropertyEditor'
import { SXParticipation, SXSubComponent } from 'sbolgraph'
import { click as clickEvent, change as changeEvent } from 'jfw/event'
import BiocadApp from 'biocad/BiocadApp'
import OntologyTermSelectorDialog from 'biocad/dialog/OntologyTermSelectorDialog'
import sbo from 'data/systems-biology-ontology'
import { SBOLXGraph, SXInteraction } from 'sbolgraph'
import { h } from 'jfw/vdom'

export default class PropertyEditorInteractionParticipants extends PropertyEditor {

    app:BiocadApp
    interactionURI:string
    onChange:undefined|(()=>void)

    constructor(app:BiocadApp, interactionURI:string, onChange?:()=>void) {
        super()
        this.interactionURI = interactionURI
        this.app = app
        this.onChange = onChange
    }

    render(graph:SBOLXGraph) {

        let interaction = graph.uriToFacade(this.interactionURI)

        if(! (interaction instanceof SXInteraction)) {
            return h('tr', [])
        }

        let component = interaction.containingModule

        let editor = this

        return interaction.participations.map((participation:SXParticipation) => {
            return h('tr', [
                h('td', {
                    colSpan: 2
                }, [
                    h('div.sf-inspector-interactionparticipant', [
                        h('span', [
                            renderComponentSelector(participation)
                        ]),
                        h('br'),
                        h('span', [
                            renderRoleSelector(participation)
                        ])
                    ])
                ])
            ])
        })

        function renderComponentSelector(participation:SXParticipation) {
            let participant = participation.participant
            return h('select.jfw-select', {
                'ev-change': changeEvent(changeParticipant, { editor, participation })
             },  component.subComponents.map((subComponent) => {
                return h('option', {
                    selected: participant && participant.uri === subComponent.uri,
                    value: subComponent.uri
                }, subComponent.displayName)
            }))
        }

        // TODO code duplication from PropertyEditorTermSet
        //
        function renderRoleSelector(participation) {
            return h('span.addremove', participation.roles.map((role) => {
                return h('span.addremove-item', {
                        'ev-click': clickEvent(clickRemoveRole, { editor, participation, role })
                }, [
                    h('span.addremove-remove.fa.fa-times-circle'),
                    ' ' + sbo[uriToTerm(role)].name
                ])
            }).concat([
                h('span.addremove-add', {
                    'ev-click': clickEvent(clickChooseRole, { editor, participation })
                }, [
                    h('span.fa.fa-plus')
                ])
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

        if(editor.onChange)
            editor.onChange()
    }

}

function clickRemoveRole(data) {

    let editor:PropertyEditorInteractionParticipants = data.editor
    let participation:SXParticipation = data.participation
    let role:string = data.role

    participation.removeRole(role)

    if (editor.onChange)
        editor.onChange()


}

function changeParticipant(data) {

    let editor:PropertyEditorInteractionParticipants = data.editor
    let participation:SXParticipation = data.participation
    let interaction = participation.interaction
    let graph = participation.graph

    if(!interaction) {
        console.warn('interaction was null?')
        return
    }

    let newParticipantURI = data.value
    let newParticipant = graph.uriToFacade(newParticipantURI)

    if(!newParticipant) {
        console.warn('new participant was null?')
        return
    }

    let otherParticipations = interaction.participations.filter((other) => {
        return other.uri !== participation.uri
    })

    for(let other of otherParticipations) {

        let otherParticipant = other.participant

        if(!otherParticipant)
            continue

        if(otherParticipant.uri === newParticipantURI) {

            // replace the other one with our old one

            other.participant = participation.participant
            break
        }
    }

    participation.participant = newParticipant as SXSubComponent

    if(editor.onChange)
        editor.onChange()
}


function uriToTerm(uri:string):string {
    return uri.split('/').pop() as string
}

function termToURI(term:string):string {
    return 'http://identifiers.org/biomodels.sbo/' + term
}

