
import { Topbar } from '@biocad/jfw/ui'
import { h } from '@biocad/jfw/vdom'

export default class BiocadTopbar extends Topbar {

    constructor(app) {

        super(app)

    }

    renderRight() {

        return h('div', {
        }, [
            /*
            h('label.jfw-checkbox', [
                h('input.jfw-checkbox', checkIf(app.opts.showGrid, {
                    type: 'checkbox',
                    name: 'showGrid',
                    'ev-change': hg.sendChange(changeShowGrid, { graph: graph })
                })),
                ' Show Grid'
            ]),

            h('span.jfw-spacer', ' '),

            h('label.jfw-checkbox', [
                h('input.jfw-checkbox', checkIf(app.opts.showGrid, {
                    type: 'checkbox',
                    name: 'darkMode',
                    'ev-change': hg.sendChange(changeDarkMode, { graph: graph })
                })),
                ' Dark Mode'
            ]),

            h('span.jfw-spacer', ' '),*/

            /*
            h('div.jfw-topbar-config-button.fa.fa-cog', {

                'ev-click': clickEvent(clickConfig, { app: app })
             
            }),
            h('span.jfw-spacer', ' '),
            h('div.jfw-topbar-config-button.fa.fa-share', {

                'ev-click': clickEvent(clickShare, { app: app })
             
            }),
            h('span.jfw-spacer', ' '),*/

            /*
            h('button.jfw-input.jfw-button', {
                'ev-click': hg.sendClick(clickSave, { app: app })
            }, 'Save'),

            h('span.jfw-spacer', ' '),

            h('button.jfw-input.jfw-button', {
                'ev-click': hg.sendClick(clickDebug, { app: app })
            }, 'Debug')*/
        ])
    }


}

function changeShowGrid(data) {

    const graph = data.graph

    //app.opts.showGrid = data.showGrid
    //app.requestRenderUI()

}

function changeDarkMode(data) {

    const graph = data.graph

    //app.opts.darkMode = data.darkMode
    //app.requestRenderUI()

}

function clickSave(data) {

    const app = data.app

}


function clickDebug(data) {

    const app = data.app

    //app.openDialog(new DebugDialog(app))

}

function clickConfig(data) {
    
    const app = data.app

    //app.openDialog(new ConfigDialog(app))


}

function clickShare(data) {
    
    const app = data.app

    //app.openDialog(new ShareDialog(app))


}

