

import { h, svg, VNode } from 'jfw/vdom'
import { View } from 'jfw/ui'
import BiocadApp from "biocad/BiocadApp";
import Depiction from "biocad/cad/Depiction";
import { SXIdentified, SXSubComponent, SXComponent, SXInteraction } from "sbolgraph"

import describeSOUri from 'data/describeSOUri'
import renderCDTypeChooser from "biocad/stateless-ui/renderCDTypeChooser";
import renderCDStrandChooser from "biocad/stateless-ui/renderCDStrandChooser";

import visbolite from 'visbolite'
import Vec2 from "jfw/geom/Vec2";

import { click as clickEvent } from 'jfw/event'
import TextInput from 'jfw/ui/form-control/TextInput';

import soTrie from 'data/soTrie'
import { Predicates, Specifiers } from 'bioterms';
import PropertyEditor from './PropertyEditor';
import DepictionRef from 'biocad/cad/DepictionRef';
import PropertyEditorOneline from './PropertyEditorOneline';
import PropertyEditorTermSet from './PropertyEditorTermSet';
import PropertyEditorCombo from './PropertyEditorCombo';
import LayoutEditorView from '../../cad/LayoutEditorView';
import ABInteractionDepiction from '../../cad/ABInteractionDepiction';
import PropertyEditorSiblingComponent from './PropertyEditorSubComponent';
import ComponentDepiction from '../../cad/ComponentDepiction';
import BackboneDepiction from '../../cad/BackboneDepiction';
import PropertyAccessorString from './PropertyAccessorString';
import PropertyAccessorStrand from './PropertyAccessorStrand';
import PropertyAccessorURI from './PropertyAccessorURI';

const strands = [
    {
        name: 'Forward',
        uri: Specifiers.SBOLX.Orientation.Inline
    },
    {
        name: 'Reverse Complement',
        uri: Specifiers.SBOLX.Orientation.ReverseComplement
    }
]

const types = [
    {
        name: 'DNA',
        uri: Specifiers.SBOLX.Type.DNA
    },
    {
        name: 'RNA',
        uri: Specifiers.SBOLX.Type.RNA
    },
    {
        name: 'Protein',
        uri: Specifiers.SBOLX.Type.Protein
    },
    {
        name: 'Complex',
        uri: Specifiers.SBOLX.Type.Complex
    },
    {
        name: 'Small Molecule',
        uri: Specifiers.SBOLX.Type.SmallMolecule
    },
    {
        name: 'Effector',
        uri: Specifiers.SBOLX.Type.Effector
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

            let effectiveComponent:null|SXComponent = null

            if(dOf instanceof SXComponent) {
                effectiveComponent = dOf
            } else if(dOf instanceof SXSubComponent) {
                effectiveComponent = dOf.instanceOf
            }

            let changeNonRecursive = () => {
                let layout = this.layoutEditorView.layoutEditor.layout
                if(effectiveComponent) {
                    for(let d of layout.getDepictionsForUri(effectiveComponent.uri)) {
                        d.touch()
                    }
                    let instantiations = effectiveComponent.graph.getInstancesOfComponent(effectiveComponent)
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
                    let instantiations = effectiveComponent.graph.getInstancesOfComponent(effectiveComponent)
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

            this.editors.push(new PropertyEditorOneline('Name', new PropertyAccessorString(dOf.uri, Predicates.Dcterms.title, changeNonRecursive)))
            this.editors.push(new PropertyEditorOneline('Identifier', new PropertyAccessorString(dOf.uri, Predicates.SBOLX.id, changeNonRecursive)))

            if(effectiveComponent) {

                this.editors.push(new PropertyEditorCombo('Type', new PropertyAccessorURI(effectiveComponent.uri, Predicates.SBOLX.type), types))
                //this.editors.push(new PropertyEditorTermSet('Roles', dOf.uri, Predicates.SBOLX.hasRole, strands))

            }

            if(depiction.parent instanceof BackboneDepiction) {
                this.editors.push(new PropertyEditorCombo('Strand', new PropertyAccessorStrand(dOf.uri, changeRecursive), strands))
            }
            
            if(depiction instanceof ABInteractionDepiction) {
                let interaction = depiction.depictionOf

                if(! (interaction instanceof SXInteraction)) {
                    throw new Error('???')
                }

                for(let participation of interaction.participations) {
                    this.editors.push(new PropertyEditorSiblingComponent('Participant', interaction.containingModule.uri, participation.uri, Predicates.SBOLX.participant))
                }
            }
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

            const depictionOf = graph.uriToFacade(this.inspecting[0].uri)

            if(depictionOf) {

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

            const depictionOf:SXIdentified|undefined = depiction.depictionOf

            if(depictionOf !== undefined) {

                tableElements.push(propertyEditorOneline(depictionOf, Predicates.Dcterms.title))

                var cd:SXComponent|null = cdFromDepiction(depictionOf)

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

                    const cd: SXComponent | null = cdFromDepiction(depiction.depictionOf)

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
function cdFromDepiction(depictionOf:SXIdentified):SXComponent|null {


    if (depictionOf instanceof SXSubComponent) {
        return (depictionOf as SXSubComponent).instanceOf
    } else if (depictionOf instanceof SXComponent) {
        return (depictionOf as SXComponent)
    }

    return null

}

function clickRemoveRole(data) {

    const view:Inspector = data.view
    const cd:SXComponent = data.cd
    const role:string = data.role

    cd.removeRole(role)

    //cd.touch()

    // I want to update anything that is watching the cd
    // the graph watcher will do that
}


function propertyEditorOneline(title:string, object:SXIdentified, predicate:string) {

    return h('tr.sf-inspector-oneline', [
        h('td', 'Name'),
        h('td', object.getStringProperty(predicate))
    ])

}

function propertyEditorCombo(title:string, object:SXIdentified, predicate:string, options:{name:string,value:string}[]) {

    return h('select.jfw-select', {
        //'ev-change': changeEvent(onChange, { cd: cd }),
        value: 'TODO'
    }, options.map((option) => {

        return h('option', {
            value: option.value,
        }, option.name)

    }))

}

function propertyEditorSet(title:string, object:SXIdentified, predicate:string, options:{name:string,value:string}[]) {

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