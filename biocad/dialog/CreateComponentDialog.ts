import { App } from 'jfw';

import { Dialog, DialogOptions } from 'jfw/ui/dialog'
import { h } from 'jfw/vdom'

import extend = require('xtend')

import componentTypes from 'bioterms/human/componentTypes'

import { Specifiers, Predicates, Types } from 'bioterms'

import nameToDisplayId from '../util/nameToDisplayId'
import { TextInput, Combo } from "jfw/ui/form-control";

import cdTypes from 'data/cdTypes'
import cdRoles from 'data/roles'

import { click as clickEvent } from 'jfw/event'
import { SBOLXGraph } from "sbolgraph";
import BiocadApp from "biocad/BiocadApp";

import { node as graphNode } from "sbolgraph"
import { SBOLXCompliantURIs, SXComponent, SXSequence } from "sbolgraph"

export class CreateComponentDialogDefaults {

    isSubcomponent:boolean = false
    parentUri:string = ''
    name:string = ''
    identifier:string = ''
    type:string = Specifiers.SBOL2.Type.DNA
    role:string = Specifiers.SBOL2.Role.CDS
    uri:string = ''

}

export interface CreateComponentDialogOptions extends DialogOptions {

    componentType:string
    componentParentUri:string

}

export default class CreateComponentDialog extends Dialog {

    nameBox:TextInput
    identifierBox:TextInput
    typeBox:Combo
    roleBox:Combo
    uriBox:TextInput

    constructor(app:App, opts:CreateComponentDialogOptions, defs:CreateComponentDialogDefaults) {

        super(app, opts)

        this.setTitle('Create Component')

        this.setWidthAndCalcPosition('75%')

        this.nameBox = new TextInput(this, defs.name)
        this.identifierBox = new TextInput(this, defs.identifier)
        this.typeBox = new Combo(this, cdTypes.map((type) => {

            return {
                name: type.name,
                value: type.value
            }

        }), defs.type)

        this.roleBox = new Combo(this, cdRoles, defs.role)
        this.uriBox = new TextInput(this, defs.uri)

        this.nameBox.onChange((newName:string) => {

            const displayId = nameToDisplayId(newName)

            this.identifierBox.setValue(displayId)
            this.uriBox.setValue(displayId)

        })


    }

    onClickCreate() {

        const app:BiocadApp = this.app as BiocadApp
        const graph:SBOLXGraph = app.graph


        const cdUri:string = graph.generateURI('http://dummyprefix/' + this.identifierBox.getValue() + '$n?$/1')

        graph.insertProperties(cdUri, {
            [Predicates.a]: graphNode.createUriNode(Types.SBOLX.Component),
            [Predicates.SBOLX.id]: graphNode.createStringNode(SBOLXCompliantURIs.getId(cdUri)),
            [Predicates.SBOLX.persistentIdentity]: graphNode.createUriNode(SBOLXCompliantURIs.getPersistentIdentity(cdUri)),
            [Predicates.SBOLX.version]: graphNode.createStringNode(SBOLXCompliantURIs.getVersion(cdUri)),
            [Predicates.SBOLX.type]: graphNode.createUriNode(this.typeBox.getValue()),
            [Predicates.SBOLX.hasRole]: graphNode.createUriNode(this.roleBox.getValue())
        })


        const seqUri:string = graph.generateURI('http://dummyprefix/' + this.identifierBox.getValue() + '_sequence$n?$/1')

        graph.insertProperties(seqUri, {
            [Predicates.a]: graphNode.createUriNode(Types.SBOLX.Sequence),
            [Predicates.SBOLX.id]: graphNode.createStringNode(SBOLXCompliantURIs.getId(seqUri)),
            [Predicates.SBOLX.persistentIdentity]: graphNode.createUriNode(SBOLXCompliantURIs.getPersistentIdentity(seqUri)),
            [Predicates.SBOLX.version]: graphNode.createStringNode(SBOLXCompliantURIs.getVersion(seqUri)),
            [Predicates.SBOLX.sequenceEncoding]: graphNode.createUriNode(Specifiers.SBOL2.SequenceEncoding.NucleicAcid),
            [Predicates.SBOLX.sequenceElements]: graphNode.createStringNode('')
        })



        const cd = new SXComponent(graph, cdUri)
        cd.setSequence(new SXSequence(graph, seqUri))



        app.closeDialog(this)


    }

    getContentView() {
            

        return h('div', {
            style: {
                //display: 'flex',
                //'flex-direction': 'column'
            }
        }, [
            h('label', 'Identity'),
            this.renderMetadataSection(),
            h('br'),
            h('label', 'Attributes'),
            this.renderTypesSection(),
            h('br'),
            h('label', 'Hierarchy'),
            this.renderHierarchySection(),
            h('br'),
            this.renderButtons()
        ])

    }

        
    renderButtons() {

        return h('button.jfw-button', {
            'ev-click': clickEvent(clickCreate, { dialog: this })
        }, 'Create')

    }

    renderMetadataSection() {

        const nameInput = h('label', [
            'Name',
            h('br'),
            this.nameBox.render()
        ])

        const displayIdInput = h('label', [
            'Identifier',
            h('br'),
            this.identifierBox.render()
        ])

        const uriInput = h('label', [
            'URI',
            h('br'),
            this.uriBox.render()
        ])

        return h('div.jfw-form-group', {
            style: {
                flex: '1 0 100%',
                display: 'flex',
                'flex-direction': 'row'
            }
        }, [
            h('div', {
                style: {
                    flex: '1 0 0'
                }
            }, [
                nameInput
            ]),
            h('div', {
                style: {
                    flex: '1 0 0'
                }
            }, [
                displayIdInput,
                h('br'),
                uriInput
            ])
        ])
    }

    renderTypesSection() {
        
        const typeSelector = h('label', [
            'Type',
            h('br'),
            this.typeBox.render()
        ])

        const roleSelector = h('label', [
            'Role',
            h('br'),
            this.roleBox.render()
        ])

        return h('div.jfw-form-group', {
            style: {
                flex: '1 0 100%',
                display: 'flex',
                'flex-direction': 'row'
            }
        }, [
            h('div', {
                style: {
                    flex: '1 0 0'
                }
            }, [
                typeSelector
            ]),
            h('div', {
                style: {
                    flex: '1 0 0'
                }
            }, [
                roleSelector
            ])
        ])
    }

    renderHierarchySection() {

        const isSubcomponentOf = h('label', [
            h('input', { type: 'checkbox' }),
            ' This is a subcomponent'
        ])

        return h('div.jfw-form-group', {
            style: {
                flex: '1 0 100%',
                display: 'flex',
                'flex-direction': 'row'
            }
        }, [
            h('div', {
                style: {
                    flex: '1 0 0'
                }
            }, [
                isSubcomponentOf
            ]),
            h('div', {
                style: {
                    flex: '1 0 0'
                }
            }, [
            ])
        ])

    }

}

function clickCreate(data) {

    const dialog:CreateComponentDialog = data.dialog

    dialog.onClickCreate()


}