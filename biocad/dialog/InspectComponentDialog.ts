
import TabbedDialog, { Tab } from "jfw/ui/dialog/TabbedDialog";
import { DialogOptions } from "jfw/ui/dialog";
import BiocadApp from "biocad/BiocadApp";
import { SBOLXGraph, SXIdentified } from "sbolgraph";
import { VNode, h } from "jfw/vdom";
import { SXComponent } from "sbolgraph"
import LayoutThumbnail from "biocad/cad/LayoutThumbnail";
import Layout from "biocad/cad/Layout";
import Rect from "jfw/geom/Rect";
import Vec2 from "jfw/geom/Vec2";
import InspectComponentThumbnailView from "biocad/dialog/InspectComponentThumbnailView";
import SequenceEditor from "biocad/mode/sequence/SequenceEditor";
import { click as clickEvent } from 'jfw/event'
import SBOLDroppable from "biocad/droppable/SBOLDroppable";
import copySBOL from "biocad/util/copySBOL";

export class InspectComponentDialogOptions extends DialogOptions {

    uri:string

    targetComponent:SXComponent|null

}

export default class InspectComponentDialog extends TabbedDialog {

    graph:SBOLXGraph
    component:SXComponent
    targetComponent:SXComponent|null

    constructor(app:BiocadApp, opts:InspectComponentDialogOptions) {

        super(app, opts)


        this.targetComponent = opts.targetComponent

        this.setWidthAndCalcPosition('75%')

        SBOLXGraph.loadURL(opts.uri + '/sbol').then((graph:SBOLXGraph) => {

            this.graph = graph
            this.component = new SXComponent(graph, opts.uri)

            const displayName:string|undefined = this.component.displayName

            if(displayName !== undefined)
                this.setTitle(displayName)

            const sequenceView:SequenceEditor = new SequenceEditor(app, this)
            sequenceView.setComponent(this.component)
            sequenceView.darkMode = true
            sequenceView.showTopToolbar = false
            sequenceView.readOnly = true

            this.setTabs([
                new Tab('Visual', new InspectComponentThumbnailView(app, this.component) , true),
                new Tab('Sequence', sequenceView, false)
            ])

        })
    }

    getContentView():VNode {

        let buttonChildren:VNode[] = []

        buttonChildren.push(
            h('span.fa.fa-plus'),
            ' Use this Part'
        )

        return h('div', [
            h('button.jfw-button.jfw-big-button.jfw-green-button', {
                style: {
                    position: 'absolute',
                    right: '16px'
                },
                'ev-click': clickEvent(clickInsert, { dialog: this })
            }, buttonChildren),

            super.getContentView()
        ])

    }

}

function clickInsert(data) {

    const dialog:InspectComponentDialog = data.dialog

    const component:SXComponent = dialog.component

    const app:BiocadApp = dialog.app as BiocadApp

    if(dialog.targetComponent) {

        let identityMap = 
            copySBOL(component.graph, dialog.targetComponent.graph, dialog.targetComponent.uriPrefix)

        let newComponentUri = identityMap.get(component.uri)

        if(!newComponentUri) {
            console.dir(identityMap)
            throw new Error(component.uri + ' not found in identityMap')
        }

        let newComponent = dialog.targetComponent.graph.uriToFacade(newComponentUri)

        if(! (newComponent instanceof SXComponent)) {
            throw new Error('???')
        }

        for(let instance of dialog.targetComponent.graph.getInstancesOfComponent(dialog.targetComponent)) {
            instance.instanceOf = newComponent
        }

        dialog.targetComponent.destroy()

    } else {
        const droppable:SBOLDroppable = new SBOLDroppable(app, component.graph, [ component.uri ])

        app.dropOverlay.startDropping(droppable)
    }
    
    app.closeDialogAndParents(dialog)
}