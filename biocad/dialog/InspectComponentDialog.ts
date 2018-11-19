
import TabbedDialog, { Tab } from "jfw/ui/dialog/TabbedDialog";
import { DialogOptions } from "jfw/ui/dialog";
import BiocadApp from "biocad/BiocadApp";
import { SBOLXGraph } from "sbolgraph";
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

export class InspectComponentDialogOptions extends DialogOptions {

    uri:string

}

export default class InspectComponentDialog extends TabbedDialog {

    graph:SBOLXGraph
    component:SXComponent

    constructor(app:BiocadApp, opts:InspectComponentDialogOptions) {

        super(app, opts)

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

        return h('div', [
            h('button.jfw-button.jfw-big-button.jfw-green-button', {
                style: {
                    position: 'absolute',
                    right: '16px'
                },
                'ev-click': clickEvent(clickInsert, { dialog: this })
            }, [
                h('span.fa.fa-plus'),
                ' Add to Design'
            ]),

            super.getContentView()
        ])

    }

}

function clickInsert(data) {

    const dialog:InspectComponentDialog = data.dialog

    const component:SXComponent = dialog.component

    const app:BiocadApp = dialog.app as BiocadApp

    const droppable:SBOLDroppable = new SBOLDroppable(app, component.graph, [ component.uri ])

    app.dropOverlay.startDropping(droppable)

    app.closeDialogAndParents(dialog)

}