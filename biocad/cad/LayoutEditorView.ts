
import BiocadApp from 'biocad/BiocadApp';

import { View } from 'jfw/ui'
import { createGrid } from 'jfw/graphics'

import { h, VNode, svg } from 'jfw/vdom'

import { Types } from 'bioterms'

import LayoutEditorToolbar from './LayoutEditorToolbar'

import RelayoutDialog from './RelayoutDialog'

import Layout from 'biocad/cad/Layout'
import LayoutEditor from 'biocad/cad/LayoutEditor'
import { App } from "jfw";

import { SBOLXGraph } from "sbolgraph"
import Depiction from "biocad/cad/Depiction";
import CircuitViewLeftSidebar from "biocad/mode/circuit/CircuitViewLeftSidebar";
import CircuitViewRightSidebar from "biocad/mode/circuit/CircuitViewRightSidebar";
import LayoutPOD from "biocad/cad/LayoutPOD";
import GlobalConfig from 'jfw/GlobalConfig';

export default abstract class LayoutEditorView extends View {

    toolbar: View

    layout: Layout
    layoutEditor: LayoutEditor

    leftSidebar:CircuitViewLeftSidebar
    rightSidebar:CircuitViewRightSidebar

    constructor(app:BiocadApp) {

        super(app)

        this.leftSidebar = new CircuitViewLeftSidebar(app)
        this.rightSidebar = new CircuitViewRightSidebar(app)

        this.toolbar = new LayoutEditorToolbar(this)

        this.createLayout()


        app.onLoadGraph.listen((graph:SBOLXGraph) => {
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

        return h('div.jfw-flow-grow.jfw-flow-ttb', {
        }, elements)
    }


}