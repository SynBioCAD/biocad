
import { Dialog } from '@biocad/jfw/ui'
import { h, VNode } from '@biocad/jfw/vdom'

//import LayoutMinimap from 'biocad/cad/LayoutMinimap'

import extend = require('xtend')

import { Slider, Button } from '@biocad/jfw/ui';

import detailLevels from 'data/detailLevels'

export default class RelayoutDialog extends Dialog {

    //minimap: LayoutMinimap
    detailSlider: Slider
    applyButton: Button

    constructor(app, opts) {


        super(app, extend({
            modal: true
        }, opts))
        
        this.setTitle('Layout')
        this.setWidthAndCalcPosition('60%')

        //this.minimap = new CircuitViewMinimap(app, this.tempGraph)

        this.detailSlider = new Slider(this, 5)
        this.detailSlider.setMin(0)
        this.detailSlider.setMax(detailLevels.length - 1)
        this.detailSlider.setValue(parseInt(app.detailLevel))

        this.applyButton = new Button(this)
        this.applyButton.setText('Apply')

        this.detailSlider.onChange(() => {
            //layout(this.tempGraph, this.detailSlider.getValue())
        })

        this.applyButton.onClick(() => {
            app.detailLevel = this.detailSlider.getValue() + ''
            //layout(app.graph, this.detailSlider.getValue())
            app.closeDialog(this)
        })
    }

    getContentView():VNode {

        const detailLevel = detailLevels[this.detailSlider.getValue()]

        return h('div', [
            
            h('label', [
                'Detail',
                h('br'),
                this.detailSlider.render()
            ]),
            
            h('br'),

            h('p', [
                h('b', detailLevel.name + ' ' + String.fromCharCode(8212) + ' '),
                detailLevel.description
            ]),

            h('br'),

            h('label', [
                'Preview',
                h('br'),
                h('div.sf-circuit-view-minimap', {
                    style: {
                    }
                }, [
                    //this.minimap.render()
                ])
            ]),

            this.applyButton.render()
        ])

    }


}

