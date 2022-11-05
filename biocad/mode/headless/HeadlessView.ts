
import BiocadApp from "biocad/BiocadApp";

import { View } from "@biocad/jfw/ui";
import { VNode, h } from "@biocad/jfw/vdom";
import BiocadProject from "../../BiocadProject";

export default class HeadlessView extends View {

	project:BiocadProject

    constructor(project:BiocadProject) {
        super(project)
	this.project = project
    }

    render():VNode {

        return h('div')

    }
    

/*
    createLayout():void {

        const project = this.project

        this.layout = new Layout(project.graph)
        this.layout.syncAllDepictions(5, true)
        this.layoutEditor = new LayoutEditor(project, this.layout)
    
        this.layoutEditor.onSelectDepictions.listen((depictions:Depiction[]) => {

            this.rightSidebar.inspector.inspect(depictions)
        
            console.log(JSON.stringify(LayoutPOD.serialize(this.layout), null, 2))
        })
    }*/

}

