
import BiocadApp from "biocad/BiocadApp";

import { View } from "@biocad/jfw/ui";
import { VNode, h } from "@biocad/jfw/vdom";

export default class HeadlessView extends View {

    constructor(app:BiocadApp) {
        super(app)
    }

    render():VNode {

        return h('div')

    }
    

/*
    createLayout():void {

        const app = this.app as BiocadApp

        this.layout = new Layout(app.graph)
        this.layout.syncAllDepictions(5, true)
        this.layoutEditor = new LayoutEditor(app, this.layout)
    
        this.layoutEditor.onSelectDepictions.listen((depictions:Depiction[]) => {

            this.rightSidebar.inspector.inspect(depictions)
        
            console.log(JSON.stringify(LayoutPOD.serialize(this.layout), null, 2))
        })
    }*/

}

