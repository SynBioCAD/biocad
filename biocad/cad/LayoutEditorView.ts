
import BiocadApp from 'biocad/BiocadApp';

import { View } from 'jfw/ui'

import { h, VNode, svg } from 'jfw/vdom'

import LayoutEditorToolbar from './LayoutEditorToolbar'

import LayoutEditor from 'biocad/cad/LayoutEditor'

import { Graph } from "sbolgraph"
import CircuitViewLeftSidebar from "biocad/mode/circuit/CircuitViewLeftSidebar";
import CircuitViewRightSidebar from "biocad/mode/circuit/CircuitViewRightSidebar";
import GlobalConfig from 'jfw/GlobalConfig';

export default abstract class LayoutEditorView extends View {

    toolbar: View

    layoutEditor: LayoutEditor

    leftSidebar:CircuitViewLeftSidebar
    rightSidebar:CircuitViewRightSidebar

    constructor(app:BiocadApp) {

        super(app)

        this.leftSidebar = new CircuitViewLeftSidebar(app)
        this.rightSidebar = new CircuitViewRightSidebar(this)

        this.toolbar = new LayoutEditorToolbar(this)

        this.createLayout()


        app.onLoadGraph.listen((graph:Graph) => {
            this.createLayout()
        })

    }

    abstract createLayout():void


    render():VNode {

        let elements:any[] = [
        ]

        if(GlobalConfig.get("biocad.layoutEditor.showToolbar")) {
            elements.push(this.toolbar.render())
        }

        elements.push(this.layoutEditor.render())


        elements.push(
            h('div', {
                style: {
                    position: 'fixed',
                    right: '8px',
                    bottom: '8px',
                    'z-index': '99999'
                }
            }, [
                h('a', {
                    style: {
                        color: 'white',
                    },
                    href: 'https://github.com/ngbiocad/biocad/issues'
                }, 'Report an Issue')
            ])
        )

        return h('div.jfw-flow-grow.jfw-flow-ttb', {
        }, elements)
    }


}