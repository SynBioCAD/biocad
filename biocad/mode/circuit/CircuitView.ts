

import LayoutEditorView from 'biocad/cad/LayoutEditorView'
import BiocadApp from "biocad/BiocadApp";

import Layout from 'biocad/cad/Layout'
import LayoutPOD from 'biocad/cad/LayoutPOD'
import LayoutEditor from 'biocad/cad/LayoutEditor'
import Depiction from 'biocad/cad/Depiction'
import { Graph } from 'sbolgraph';
import { Vec2 } from 'jfw/geom'

export default class CircuitView extends LayoutEditorView {

    constructor(app:BiocadApp) {
        super(app)
    }

    createLayout():void {

        const app = this.app as BiocadApp

        let layout = new Layout(app.graph)
        layout.syncAllDepictions(5)
        layout.configurate([])
        layout.size = layout.getBoundingSize().add(Vec2.fromXY(2, 2)).max(layout.size)
        layout.startWatchingGraph(this.app)

        if(this.layoutEditor)
            this.layoutEditor.cleanup()

        this.layoutEditor = new LayoutEditor(app, layout)
    
        this.layoutEditor.onSelectDepictions.listen((depictions:Depiction[]) => {

            this.rightSidebar.inspector.inspect(depictions)
        
            //console.log(JSON.stringify(LayoutPOD.serialize(this.layout), null, 2))
        })

        this.layoutEditor.onNewGraph.listen((graph:Graph) => {

            app.graph = graph

        })




        this.rightSidebar.debugDepictionTreeView.setLayout(layout)

        this.layoutEditor.onProposeLayout.listen((layout:Layout) => {
            this.rightSidebar.debugDepictionTreeView.setLayout(layout)
        })



    }

}

