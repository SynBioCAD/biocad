import { App } from '@biocad/jfw/ui';

import { Dialog, DialogOptions } from '@biocad/jfw/ui';
import { h } from '@biocad/jfw/vdom'

import extend = require('xtend')

import componentTypes from 'bioterms/human/componentTypes'

import { Specifiers, Predicates, Types, Prefixes } from 'bioterms'

import nameToDisplayId from '../util/nameToDisplayId'
import { TextInput, Combo } from "@biocad/jfw/ui";

import cdTypes from 'data/cdTypes'

import { click as clickEvent } from '@biocad/jfw/event'
import { Graph, sbol3 } from "sbolgraph";
import BiocadApp from "biocad/BiocadApp";

import { node as graphNode } from "sbolgraph"
import { S3Component, S3Sequence } from "sbolgraph"
import PropertyEditorTermSet from 'biocad/property/PropertyEditorTermSet';
import PropertyAccessorURISet from 'biocad/property/PropertyAccessorURISet';

import so from 'data/sequence-ontology'
import systemsBiologyOntology from 'data/systems-biology-ontology';

export class CreateComponentDialogDefaults {

    isSubcomponent:boolean = false
    parentUri:string = ''
    name:string = ''
    identifier:string = ''
    type:string = Specifiers.SBOL2.Type.DNA
    role:string = Specifiers.SO.CDS
    uri:string = ''

}

export interface CreateComponentDialogOptions extends DialogOptions {

    componentType:string
    componentParentUri:string

    onCreate:(c:S3Component)=>void

}

export default class CreateComponentDialog extends Dialog {

    nameBox:TextInput
    identifierBox:TextInput
    typeBox:Combo
    roleBox:PropertyEditorTermSet
    uriBox:TextInput

    tempGraph:Graph

    onCreate:(c:S3Component)=>void

    constructor(app:App, opts:CreateComponentDialogOptions, defs:CreateComponentDialogDefaults) {

        super(app, opts)

        this.onCreate = opts.onCreate
        

        this.tempGraph = new Graph([])

        this.setTitle('Create Part')

        this.setWidthAndCalcPosition('75%')

        this.nameBox = new TextInput(this, defs.name)
        this.identifierBox = new TextInput(this, defs.identifier)
        this.typeBox = new Combo(this, cdTypes.map((type) => {

            return {
                name: type.name,
                value: type.value
            }

        }), defs.type)

        this.roleBox = new PropertyEditorTermSet(
            app as BiocadApp,
            'Roles',
            new PropertyAccessorURISet('temp', Predicates.SBOL3.role),
            Prefixes.sequenceOntologyIdentifiersOrg,
            so,
            'SO:0000110'
        )

        this.uriBox = new TextInput(this, defs.uri)

        this.nameBox.onChange((newName:string) => {

            const displayId = nameToDisplayId(newName)

            this.identifierBox.setValue(displayId)
            this.uriBox.setValue(displayId)

        })


    }

    onClickCreate() {

        const app:BiocadApp = this.app as BiocadApp
        const graph:Graph = app.graph


        let roles = [] // TODO?

        let prefix = sbol3(graph).mostPopularUriPrefix

        if(!prefix) {
            prefix = 'http://bazprefix/'
        }

        let c = sbol3(graph).createComponent(prefix, this.identifierBox.getValue())

        for(let role of roles) {
            c.addRole(role)
        }

        app.closeDialog(this)

        this.onCreate(c)

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

        const roleSelector = this.roleBox.render(this.tempGraph)

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
            ' This is part of an existing part'
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
