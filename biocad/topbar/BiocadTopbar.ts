
import { Topbar } from '@biocad/jfw/ui'
import { h } from '@biocad/jfw/vdom'
import BiocadProject from '../BiocadProject'

export default class BiocadTopbar extends Topbar {

	project:BiocadProject

    constructor(project) {

        super(project)
	this.project = project

    }

    renderRight() {

        return h('div', {
        }, [
            /*
            h('label.jfw-checkbox', [
                h('input.jfw-checkbox', checkIf(project.opts.showGrid, {
                    type: 'checkbox',
                    name: 'showGrid',
                    'ev-change': hg.sendChange(changeShowGrid, { graph: graph })
                })),
                ' Show Grid'
            ]),

            h('span.jfw-spacer', ' '),

            h('label.jfw-checkbox', [
                h('input.jfw-checkbox', checkIf(project.opts.showGrid, {
                    type: 'checkbox',
                    name: 'darkMode',
                    'ev-change': hg.sendChange(changeDarkMode, { graph: graph })
                })),
                ' Dark Mode'
            ]),

            h('span.jfw-spacer', ' '),*/

            /*
            h('div.jfw-topbar-config-button.fa.fa-cog', {

                'ev-click': clickEvent(clickConfig, { project: project })
             
            }),
            h('span.jfw-spacer', ' '),
            h('div.jfw-topbar-config-button.fa.fa-share', {

                'ev-click': clickEvent(clickShare, { project: project })
             
            }),
            h('span.jfw-spacer', ' '),*/

            /*
            h('button.jfw-input.jfw-button', {
                'ev-click': hg.sendClick(clickSave, { project: project })
            }, 'Save'),

            h('span.jfw-spacer', ' '),

            h('button.jfw-input.jfw-button', {
                'ev-click': hg.sendClick(clickDebug, { project: project })
            }, 'Debug')*/
        ])
    }


}

function changeShowGrid(data) {

    const graph = data.graph

    //project.opts.showGrid = data.showGrid
    //project.requestRenderUI()

}

function changeDarkMode(data) {

    const graph = data.graph

    //project.opts.darkMode = data.darkMode
    //project.requestRenderUI()

}

function clickSave(data) {

    const project = data.project

}


function clickDebug(data) {

    const project = data.project

    //project.dialogs.openDialog(new DebugDialog(project))

}

function clickConfig(data) {
    
    const project = data.project

    //project.dialogs.openDialog(new ConfigDialog(project))


}

function clickShare(data) {
    
    const project = data.project

    //project.dialogs.openDialog(new ShareDialog(project))


}

