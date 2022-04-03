
import BiocadApp from 'biocad/BiocadApp'

import { Dialog } from '@biocad/jfw/ui/dialog'
import { RadioButtons, Combo } from '@biocad/jfw/ui/form-control'

import { h, VNode } from '@biocad/jfw/vdom'

import extend = require('xtend')

export default class RemoveURIPrefixDialog extends Dialog {

    actionRadio: RadioButtons

    removeUriPrefixOpts:any
    topLevelsWithPrefix:any
    newPrefixCombo:Combo

    constructor(app, opts) {

        super(app, extend({

            modal: true
            
        }, opts))

        this.setTitle('Remove URI Prefix')
        this.setWidthAndCalcPosition('70%')

        this.removeUriPrefixOpts = extend({
            
            uriPrefix: ''

        }, opts.removeUriPrefix  || {})

        this.topLevelsWithPrefix =
            app.graph.getTopLevelsWithPrefix(opts.removeUriPrefix.uriPrefix)

        this.actionRadio = new RadioButtons(app, 'nop')

        const prefixes = app.graph.uriPrefixes

        this.newPrefixCombo = new Combo(app, prefixes.map((prefix) => {
            return {
                name: prefix,
                value: prefix
            }
        }), prefixes[0])

        /*
            h('div', [
                h('label', [
                    h('input', this.actionRadio.getInputAttr('remove')),
                    'Remove these objects from the document'
                ]),
                h('br'),
                h('label', [
                    h('input', this.actionRadio.getInputAttr('move')),
                    'Move these objects into a different prefix'
                ]),
                h('br'),
                h('label', [
                    h('input', this.actionRadio.getInputAttr('nop')),
                    'Do nothing'
                ])
            ]),*/

    }


    getContentView():VNode {

        const app:BiocadApp = this.app as BiocadApp
        const graph = app.graph

        const opts = this.removeUriPrefixOpts


        const elements = [
            h('div', [
                'The URI prefix ',
                h('code', this.removeUriPrefixOpts.uriPrefix),
                ' is used by ',
                this.topLevelsWithPrefix.length,
                ' top level object(s).'
            ]),

            h('br'),

            this.actionRadio.render()

        ]

        if(this.actionRadio.getValue() === 'move') {

            elements.push(
                h('br'),
                h('label', [
                    'New prefix',
                    h('br'),
                    this.newPrefixCombo.render()
                ])
            )

            elements.push(
                h('br'),
                h('button.jfw-button', 'Move ' + this.topLevelsWithPrefix.length + ' object(s)')
            )

        } else if(this.actionRadio.getValue() === 'remove') {

            elements.push(
                h('br'),
                h('button.jfw-button', 'Delete ' + this.topLevelsWithPrefix.length + ' object(s)')
            )

        } 

        elements.push(
            h('br'),
            h('button.jfw-button', 'Cancel')
        )

        return h('div', elements)
    }


}

