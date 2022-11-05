

import LayoutEditorView from 'biocad/cad/layout-editor/LayoutEditorView'
import BiocadApp from "biocad/BiocadApp";

import Layout from 'biocad/cad/layout/Layout'
import LayoutPOD from 'biocad/cad/layout/LayoutPOD'
import LayoutEditor from 'biocad/cad/layout-editor/LayoutEditor'
import Depiction from 'biocad/cad/layout/Depiction'
import { Graph } from 'sboljs';
import { Vec2 } from '@biocad/jfw/geom'
import BiocadProject from '../../BiocadProject';

export default class CircuitView extends LayoutEditorView {

    project:BiocadProject

    constructor(project:BiocadProject) {
        super(project)

	this.project = project

    }

    createLayout():void {

	let project = this.project

        let layout = new Layout(this.project.graph)
        layout.syncAllDepictions(5)
        layout.configurate([])
        layout.size = layout.getBoundingSize().add(Vec2.fromXY(2, 2)).max(layout.size)
        // layout.startWatchingGraph(this.project)

        if(this.layoutEditor)
            this.layoutEditor.cleanup()

        this.layoutEditor = new LayoutEditor(project, layout)
    
        this.layoutEditor.onSelectDepictions.listen((depictions:Depiction[]) => {

            this.rightSidebar.inspector.inspect(depictions)
        
            //console.log(JSON.stringify(LayoutPOD.serialize(this.layout), null, 2))
        })

        this.layoutEditor.onNewGraph.listen((graph:Graph) => {

            project.graph = graph

        })




        this.rightSidebar.debugDepictionTreeView.setLayout(layout)

        this.layoutEditor.onProposeLayout.listen((layout:Layout) => {
            this.rightSidebar.debugDepictionTreeView.setLayout(layout)
        })



    }

}

