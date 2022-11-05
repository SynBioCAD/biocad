
import BiocadApp from 'biocad/BiocadApp';

import { View } from '@biocad/jfw/ui'
import { createGrid } from '@biocad/jfw/graphics'

import { h, VNode, svg } from '@biocad/jfw/vdom'

import LayoutEditorToolbar from './LayoutEditorToolbar'

import { Graph } from "sboljs"
import CircuitViewLeftSidebar from "biocad/mode/circuit/CircuitViewLeftSidebar";
import CircuitViewRightSidebar from "biocad/mode/circuit/CircuitViewRightSidebar";
import { GlobalConfig } from '@biocad/jfw/ui'
import LayoutEditor from './LayoutEditor';
import BiocadProject from '../../BiocadProject';

export default abstract class LayoutEditorView extends View {

	project:BiocadProject

    toolbar: View

    layoutEditor: LayoutEditor

    leftSidebar:CircuitViewLeftSidebar
    rightSidebar:CircuitViewRightSidebar

    constructor(project:BiocadProject) {

        super(project)

	this.project = project

        this.leftSidebar = new CircuitViewLeftSidebar(project)
        this.rightSidebar = new CircuitViewRightSidebar(this)

        this.toolbar = new LayoutEditorToolbar(this)

        this.createLayout()


        project.onLoadGraph.listen((graph:Graph) => {
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