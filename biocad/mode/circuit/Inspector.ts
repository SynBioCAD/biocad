

import { h, svg, VNode } from 'jfw/vdom'
import { View } from 'jfw/ui'
import BiocadApp from "biocad/BiocadApp";
import Depiction from "biocad/cad/Depiction";
import { SXIdentified, SXSubComponent, SXComponent } from "sbolgraph"

import describeSOUri from 'data/describeSOUri'
import renderCDTypeChooser from "biocad/stateless-ui/renderCDTypeChooser";
import renderCDStrandChooser from "biocad/stateless-ui/renderCDStrandChooser";

import visbolite from 'visbolite'
import Vec2 from "jfw/geom/Vec2";

import { click as clickEvent } from 'jfw/event'
import TextInput from 'jfw/ui/form-control/TextInput';

import soTrie from 'data/soTrie'

export default class Inspector extends View {

    inspecting:Depiction[]

    panels:any[]

    roleInputs:Map<number, TextInput>

    constructor(app:BiocadApp) {

        super(app)

        this.panels = []
        this.inspecting = []

        this.roleInputs = new Map()
    }

    render():VNode {

        const elements:any[] = []

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
                tableElements.push(h('tr.sf-inspector-oneline', [
                    h('td', 'Name'),
                    h('td', depictionOf.name || '')
                ]))

                var cd:SXComponent|null = cdFromDepiction(depictionOf)

                if(cd !== null) {

                    tableElements.push(h('tr.sf-inspector-oneline', [
                        h('td', 'Type'),
                        h('td', renderCDTypeChooser(cd))
                    ]))

                    tableElements.push(h('tr.sf-inspector-oneline', [
                        h('td', 'Strand'),
                        h('td', renderCDStrandChooser(cd))
                    ]))

                    tableElements.push(h('tr.sf-inspector-twolines-header', {
                    }, [
                        h('td', {
                            colSpan: 2
                        }, [
                        'Roles'
                        ])
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

                    tableElements.push(h('tr.sf-inspector-twolines-value', h('td', {
                        colSpan: '2'
                    }, els)))
                }
            }

            /*
            tableElements.push(h('tr.sf-inspector-oneline', [
                h('td', 'Offset'),
                h('td', depiction.offset.toString())
            ]))
            tableElements.push(h('tr.sf-inspector-oneline', [
                h('td', 'Size'),
                h('td', depiction.size.toString())
            ]))
            tableElements.push(h('tr.sf-inspector-oneline', [
                h('td', 'Y Anchor'),
                h('td', depiction.getAnchorY().toString())
            ]))*/

        })
    
        elements.push(h('div.sf-inspector-container', [
            h('table.sf-inspector', tableElements)
        ]))

        elements.push(h('a', 'Replace with part from this design'))
        elements.push(h('a', 'Replace with part from the Web'))

        return h('span', elements)

    }

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

    }


}

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
