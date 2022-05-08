

import { View } from 'jfw/ui'
import { h } from 'jfw/vdom'

//import { Slider } from 'jfw/ui/form-control'

import { click as clickEvent } from 'jfw/event'

import RelayoutDialog from '../RelayoutDialog'
import LayoutEditorView from "./LayoutEditorView";

export default class CircuitViewToolbar extends View {

    layoutEditorView:LayoutEditorView

    constructor(layoutEditorView) {

        super(layoutEditorView.app)

        this.layoutEditorView = layoutEditorView

        const app = layoutEditorView.app

        /*
        this.detailSlider = new Slider(app, parseInt(app.detailLevel))

        this.detailSlider.setMin(1)
        this.detailSlider.setMax(5)

        this.detailSlider.onChange((newValue) => {
            app.setDetailLevel(newValue)
        })*/

    }

    render() {

        /*
        return h('div.sf-circuit-view-toolbar', [
            
            h('label', [
                'Detail',
                this.detailSlider.render()
            ])

        ])*/

        return h('div.sf-circuit-view-toolbar', [
            h('button.jfw-button', {
                'ev-click': clickEvent(clickLayout, { view: this })
            }, 'Layout')
        ])

    }


}

function clickLayout(data) {

    const { view } = data

    const app = view.app

    app.openDialog(new RelayoutDialog(app, {
        //modal: true
    }))

}



