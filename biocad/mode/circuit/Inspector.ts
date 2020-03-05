

import { h, svg, VNode } from 'jfw/vdom'
import { View } from 'jfw/ui'
import BiocadApp from "biocad/BiocadApp";
import Depiction from "biocad/cad/Depiction";
import { S3Identified, S3SubComponent, S3Component, S3Interaction, sbol3, S2ExperimentalData } from "sbolgraph"

import describeSOUri from 'data/describeSOUri'
import renderCDTypeChooser from "biocad/stateless-ui/renderCDTypeChooser";
import renderCDStrandChooser from "biocad/stateless-ui/renderCDStrandChooser";

import visbolite from 'visbolite'
import Vec2 from "jfw/geom/Vec2";

import { click as clickEvent } from 'jfw/event'
import TextInput from 'jfw/ui/form-control/TextInput';

import soTrie from 'data/soTrie'
import { Predicates, Specifiers } from 'bioterms';
import PropertyEditor from '../../property/PropertyEditor';
import DepictionRef from 'biocad/cad/DepictionRefByUid';
import PropertyEditorOneline from '../../property/PropertyEditorOneline';
import PropertyEditorTermSet from '../../property/PropertyEditorTermSet';
import PropertyEditorCombo from '../../property/PropertyEditorCombo';
import PropertyEditorInteractionParticipants from '../../property/PropertyEditorInteractionParticipants'
import LayoutEditorView from '../../cad/LayoutEditorView';
import InteractionDepiction from '../../cad/InteractionDepiction';
import PropertyEditorSiblingComponent from '../../property/PropertyEditorSubComponent';
import ComponentDepiction from '../../cad/ComponentDepiction';
import BackboneDepiction from '../../cad/BackboneDepiction';
import PropertyAccessorString from '../../property/PropertyAccessorString';
import PropertyAccessorStrand from '../../property/PropertyAccessorStrand';
import PropertyAccessorURI from '../../property/PropertyAccessorURI';
import PropertyAccessorURISet from '../../property/PropertyAccessorURISet';

import { Prefixes } from 'bioterms'

import so from 'data/sequence-ontology'
import systemsBiologyOntology from 'data/systems-biology-ontology';
import PropertyEditorDebug from '../../property/PropertyEditorDebug';

const strands = [
    {
        name: 'Forward',
        uri: Specifiers.SBOL3.Orientation.Inline
    },
    {
        name: 'Reverse Complement',
        uri: Specifiers.SBOL3.Orientation.ReverseComplement
    }
]

const types = [
    {
        name: 'DNA',
        uri: Specifiers.SBOL3.Type.DNA
    },
    {
        name: 'RNA',
        uri: Specifiers.SBOL3.Type.RNA
    },
    {
        name: 'Protein',
        uri: Specifiers.SBOL3.Type.Protein
    },
    {
        name: 'Complex',
        uri: Specifiers.SBOL3.Type.Complex
    },
    {
        name: 'Small Molecule',
        uri: Specifiers.SBOL3.Type.SmallMolecule
    },
    {
        name: 'Effector',
        uri: Specifiers.SBOL3.Type.Effector
    }
]

export default class Inspector extends View {

    private inspecting:{ uri:string, depiction:DepictionRef }[]

    renderThumb:any

    editors:PropertyEditor[]

    layoutEditorView:LayoutEditorView

    constructor(layoutEditorView:LayoutEditorView) {

        if(!layoutEditorView.app) {
            throw new Error('lev has no app?')
        }

        super(layoutEditorView.app)

        this.layoutEditorView = layoutEditorView

        this.editors = []
        this.inspecting = []
        this.renderThumb = null
    }

    inspect(depictions:Depiction[]) {

        this.inspecting = depictions.map((d) => {
            let dOf = d.depictionOf
            if(!dOf) {
                throw new Error('???')
            }
            return { uri: dOf.uri, depiction: new DepictionRef(d) }
        })

        this.editors = []

        for(let depiction of depictions) {

            let dOf = depiction.depictionOf

            if(!dOf) {
                continue
            }

            let effectiveComponent:null|S3Component = null

            if(dOf instanceof S3Component) {
                effectiveComponent = dOf
            } else if(dOf instanceof S3SubComponent) {
                effectiveComponent = dOf.instanceOf
            }

            let changeNonRecursive = () => {
                let layout = this.layoutEditorView.layoutEditor.layout
                if(effectiveComponent) {
                    for(let d of layout.getDepictionsForUri(effectiveComponent.uri)) {
                        d.touch()
                    }
                    let instantiations = sbol3(effectiveComponent.graph).getInstancesOfComponent(effectiveComponent)
                    for(let instance of instantiations) {
                        for(let d of layout.getDepictionsForUri(instance.uri)) {
                            d.touch()
                        }
                    }
                } else {
                    if(dOf) {
                        for(let d of layout.getDepictionsForUri(dOf.uri)) {
                            d.touch()
                        }
                    }
                }
            }

            let changeRecursive = () => {
                let layout = this.layoutEditorView.layoutEditor.layout
                if(effectiveComponent) {
                    for(let d of layout.getDepictionsForUri(effectiveComponent.uri)) {
                        d.touchRecursive()
                    }
                    let instantiations = sbol3(effectiveComponent.graph).getInstancesOfComponent(effectiveComponent)
                    for(let instance of instantiations) {
                        for(let d of layout.getDepictionsForUri(instance.uri)) {
                            d.touchRecursive()
                        }
                    }
                } else {
                    if(dOf) {
                        for(let d of layout.getDepictionsForUri(dOf.uri)) {
                            d.touchRecursive()
                        }
                    }
                }
            }

            function changeName() {

                if(effectiveComponent) {
                    effectiveComponent.deleteProperty('http://biocad.io/terms/untitled')
                } else if(dOf) {
                    dOf.deleteProperty('http://biocad.io/terms/untitled')
                }

                changeNonRecursive()
            }

            this.editors.push(new PropertyEditorOneline('Name', new PropertyAccessorString(dOf.uri, Predicates.Dcterms.title, changeName)))
            this.editors.push(new PropertyEditorOneline('Identifier', new PropertyAccessorString(dOf.uri, Predicates.SBOL3.id, changeNonRecursive)))

            if(effectiveComponent) {

                this.editors.push(new PropertyEditorCombo('Type', new PropertyAccessorURI(effectiveComponent.uri, Predicates.SBOL3.type), types))
                this.editors.push(new PropertyEditorTermSet(this.app as BiocadApp, 'Roles', new PropertyAccessorURISet(effectiveComponent.uri, Predicates.SBOL3.role, changeNonRecursive), Prefixes.sequenceOntologyIdentifiersOrg, so, 'SO:0000110'))
                //this.editors.push(new PropertyEditorTermSet('Roles', dOf.uri, Predicates.SBOL3.hasRole, strands))

            }

            if(depiction.parent instanceof BackboneDepiction) {
                this.editors.push(new PropertyEditorCombo('Strand', new PropertyAccessorStrand(dOf.uri, changeRecursive), strands))
            }
            
            if(depiction instanceof InteractionDepiction) {
                let interaction = depiction.depictionOf

                if(! (interaction instanceof S3Interaction)) {
                    throw new Error('???')
                }

                let changeInteraction = () => {
                    depiction.touch()
                    this.update()
                }

                this.editors.push(new PropertyEditorTermSet(this.app as BiocadApp, 'Roles', new PropertyAccessorURISet(interaction.uri, Predicates.SBOL3.type, changeNonRecursive), Prefixes.sbo, systemsBiologyOntology, 'SBO:0000231'))

                //this.editors.push(new PropertyEditorSiblingComponent('Participant', interaction.containingModule.uri, participation.uri, Predicates.SBOL3.participant))
                this.editors.push(new PropertyEditorInteractionParticipants(this.app as BiocadApp, interaction.uri, changeInteraction))
            }

            this.editors.push(new PropertyEditorDebug(depiction))
        }

        this.update()

    }

    render():VNode {

        let graph = (this.app as BiocadApp).graph

        let elements:any[] = []

        let layout = this.layoutEditorView.layoutEditor.layout

        if(this.inspecting.length === 1) {

            const thumbElements:any[] = []

            var thumb 

            let d = this.inspecting[0].depiction.toDepiction(layout)

            if(d) {
                const thumbSize:Vec2 = Vec2.fromXY(32, 32)
                thumbElements.push(d.renderThumb(thumbSize))

                thumb = svg('svg', {
                    style: {
                        display: 'inline',
                        width: thumbSize.x + 'px',
                        height: thumbSize.y + 'px',
                    }
                }, thumbElements)
            }

            const depictionOf = sbol3(graph).uriToFacade(this.inspecting[0].uri)

            if(depictionOf) {

                if(! (depictionOf instanceof S3Identified)) {
                    throw new Error('???')
                }

                elements.push(h('div.sf-inspector-top', [
                    thumb ? thumb : h('span'),
                    h('h1', depictionOf.displayName)
                ]))

                const desc:string|undefined = depictionOf.displayDescription

                elements.push(h('div.sf-inspector-desc', desc))

            }

        } else {
            for(let depiction of this.inspecting) {
                elements.push(h('div.sf-inspector-top', [
                    h('h1', this.inspecting.length + ' parts')
                ]))
            }
        }

        let tableElements:any[] = []

        for(let editor of this.editors) {
            tableElements.push(editor.render(graph))
        }

        elements.push(h('div.sf-inspector-container', [
            h('table.sf-inspector', tableElements)
        ]))

        return h('span', elements)

    }

}

        /*
        if(this.inspecting.length === 1) {

            const thumbElements:any[] = []

            const thumbSize:Vec2 = Vec2.fromXY(32, 32)

            thumbElements.push(this.inspecting[0].renderThumb(thumbSize))

            const thumb = svg('svg', {
                style: {
                    display: 'inline',
                    width: thumbSize.x + 'px',
                    height: thumbSize.y + 'px',
                }
             }, thumbElements)
            

            const depictionOf = this.inspecting[0].depictionOf

            if(depictionOf) {

                elements.push(h('div.sf-inspector-top', [
                    thumb,
                    h('h1', depictionOf.displayName)
                ]))

                const desc:string|undefined = depictionOf.displayDescription

                elements.push(h('div.sf-inspector-desc', desc))

            }

        } else {
            this.inspecting.forEach((depiction) => {
                elements.push(h('div.sf-inspector-top', [
                    h('h1', this.inspecting.length + ' parts')
                ]))
            })

        }

        const tableElements:any[] = []

        this.inspecting.forEach((depiction) => {

            const depictionOf:S3Identified|undefined = depiction.depictionOf

            if(depictionOf !== undefined) {

                tableElements.push(propertyEditorOneline(depictionOf, Predicates.Dcterms.title))

                var cd:S3Component|null = cdFromDepiction(depictionOf)

                if(cd !== null) {

                    tableElements.push()

                    tableElements.push(h('tr.sf-inspector-oneline', [
                        h('td', 'Strand'),
                        h('td', propertyEditorCombo(cd, 'http://biocad.io/terms#strand', [
                            {
                                name: 'Forward',
                                value: Specifiers.SBOL2.Orientation.Inline
                            },
                            {
                                name: 'Reverse Complement',
                                value: Specifiers.SBOL2.Orientation.ReverseComplement
                            }
                        ]))
    
                    ]))


                    var els: VNode[] = []

                    cd.roles.forEach((role: string) => {
                        els.push(
                            h('div.sf-inspector-role', [
                                describeSOUri(role).name,
                                ' ',
                                h('span.fa.fa-minus-circle.sf-inspector-role-remove', {
                                    'ev-click': clickEvent(clickRemoveRole, { view: this, cd: cd, role: role })
                                }, [])
                            ])
                        )
                    })

                    els.push(h('div.sf-inspector-add-role', [
                        h('span.fa.fa-plus-circle')
                    ]))

                    const roleInput:TextInput|undefined = this.roleInputs.get(depiction.uid)

                    if(roleInput !== undefined) {
                        els.push(roleInput.render())
                    }

                    tableElements.push()
                }
            }

        })*/
    
        /*
        elements.push(h('div.sf-inspector-container', [
            h('table.sf-inspector', tableElements)
        ]))

        elements.push(h('a', 'Replace with part from this design'))
        elements.push(h('a', 'Replace with part from the Web'))

        return h('span', elements)

}*/

    /*
    inspect(depictions:Depiction[]) {

        this.inspecting = depictions

        this.roleInputs = new Map()

        depictions.forEach((depiction:Depiction) => {

            const roleInput:TextInput = new TextInput(this, '')

            roleInput.enableAutocomplete(soTrie)

            roleInput.onSubmit((role:string) => {

                if(depiction.depictionOf !== undefined) {

                    const cd: S3Component | null = cdFromDepiction(depiction.depictionOf)

                    if (cd !== null) {
                        cd.addRole('http://lol/' + role)
                    }

                }
            })

            this.roleInputs.set(depiction.uid, roleInput)

        })

        this.update()

    }*/

/*
function cdFromDepiction(depictionOf:S3Identified):S3Component|null {


    if (depictionOf instanceof S3SubComponent) {
        return (depictionOf as S3SubComponent).instanceOf
    } else if (depictionOf instanceof S3Component) {
        return (depictionOf as S3Component)
    }

    return null

}

function clickRemoveRole(data) {

    const view:Inspector = data.view
    const cd:S3Component = data.cd
    const role:string = data.role

    cd.removeRole(role)

    //cd.touch()

    // I want to update anything that is watching the cd
    // the graph watcher will do that
}


function propertyEditorOneline(title:string, object:S3Identified, predicate:string) {

    return h('tr.sf-inspector-oneline', [
        h('td', 'Name'),
        h('td', object.getStringProperty(predicate))
    ])

}

function propertyEditorCombo(title:string, object:S3Identified, predicate:string, options:{name:string,value:string}[]) {

    return h('select.jfw-select', {
        //'ev-change': changeEvent(onChange, { cd: cd }),
        value: 'TODO'
    }, options.map((option) => {

        return h('option', {
            value: option.value,
        }, option.name)

    }))

}

function propertyEditorSet(title:string, object:S3Identified, predicate:string, options:{name:string,value:string}[]) {

    let els: VNode[] = []

    for(let uri of object.getUriProperties(predicate)) {

        els.push(
            h('div.sf-inspector-role', [
                describeSOUri(uri).name,
                ' ',
                h('span.fa.fa-minus-circle.sf-inspector-role-remove', {
                    //'ev-click': clickEvent(clickRemoveRole, { view: this, cd: cd, role: role })
                }, [])
            ])
        )
    }

    els.push(h('div.sf-inspector-add-role', [
        h('span.fa.fa-plus-circle')
    ]))

    return [
        h('tr.sf-inspector-twolines-header', {
        }, [
            h('td', {
                colSpan: 2
            }, [
                title
            ])
        ]),
        h('tr.sf-inspector-twolines-value', h('td', {
            colSpan: '2'
        }, els))
    ]
}






*/
