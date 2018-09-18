

import LayoutEditorView from 'biocad/cad/LayoutEditorView'
import BiocadApp from "biocad/BiocadApp";

import Layout from 'biocad/cad/Layout'
import LayoutPOD from 'biocad/cad/LayoutPOD'
import LayoutEditor from 'biocad/cad/LayoutEditor'
import Depiction from 'biocad/cad/Depiction'
import { SBOLXGraph } from 'sbolgraph';

export default class CircuitView extends LayoutEditorView {

    constructor(app:BiocadApp) {
        super(app)
    }

    createLayout():void {

        const app = this.app as BiocadApp

        this.layout = new Layout(app.graph)
        this.layout.syncAllDepictions(5)
        this.layout.configurate([])
        this.layout.startWatchingGraph(this.app)

        this.layoutEditor = new LayoutEditor(app, this.layout)
    
        this.layoutEditor.onSelectDepictions.listen((depictions:Depiction[]) => {

            this.rightSidebar.inspector.inspect(depictions)
        
            //console.log(JSON.stringify(LayoutPOD.serialize(this.layout), null, 2))
        })

        this.layoutEditor.onNewGraph.listen((graph:SBOLXGraph) => {

            app.graph = graph

        })




        this.rightSidebar.debugDepictionTreeView.setLayout(this.layout)

        this.layoutEditor.onProposeLayout.listen((layout:Layout) => {
            this.rightSidebar.debugDepictionTreeView.setLayout(layout)
        })



    }

}

