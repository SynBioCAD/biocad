
import BiocadApp from 'biocad/BiocadApp';

import { View } from '@biocad/jfw/ui'
import { createGrid } from '@biocad/jfw/graphics'

import { h, VNode, svg } from '@biocad/jfw/vdom'

import { Types } from 'bioterms'

import LayoutEditorToolbar from './LayoutEditorToolbar'

import RelayoutDialog from './RelayoutDialog'

import Layout from 'biocad/cad/Layout'
import LayoutEditor from 'biocad/cad/LayoutEditor'
import { App } from "jfw";

import { Graph } from "sbolgraph"
import Depiction from "biocad/cad/Depiction";
import CircuitViewLeftSidebar from "biocad/mode/circuit/CircuitViewLeftSidebar";
import CircuitViewRightSidebar from "biocad/mode/circuit/CircuitViewRightSidebar";
import LayoutPOD from "biocad/cad/LayoutPOD";
import GlobalConfig from '@biocad/jfw/GlobalConfig';

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