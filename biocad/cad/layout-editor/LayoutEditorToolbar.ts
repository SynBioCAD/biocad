

import { View } from '@biocad/jfw/ui'
import { h } from '@biocad/jfw/vdom'

//import { Slider } from '@biocad/jfw/ui/form-control'

import { click as clickEvent } from '@biocad/jfw/event'

import RelayoutDialog from '../RelayoutDialog'
import LayoutEditorView from "./LayoutEditorView";

export default class CircuitViewToolbar extends View {

    layoutEditorView:LayoutEditorView

    constructor(layoutEditorView) {

        super(layoutEditorView.project)

        this.layoutEditorView = layoutEditorView

        const project = layoutEditorView.project

        /*
        this.detailSlider = new Slider(project, parseInt(project.detailLevel))

        this.detailSlider.setMin(1)
        this.detailSlider.setMax(5)

        this.detailSlider.onChange((newValue) => {
            project.setDetailLevel(newValue)
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

    const project = view.project

    project.dialogs.openDialog(new RelayoutDialog(project, {
        //modal: true
    }))

}



