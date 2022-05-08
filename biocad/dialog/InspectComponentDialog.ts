
import { Tab, TabbedDialog, DialogOptions } from "@biocad/jfw/ui";
import BiocadApp from "biocad/BiocadApp";
import { Graph, S3Identified, sbol3, SBOL3GraphView } from "sbolgraph";
import { VNode, h } from "@biocad/jfw/vdom";
import { S3Component } from "sbolgraph"
import InspectComponentThumbnailView from "biocad/dialog/InspectComponentThumbnailView";
import SequenceEditor from "biocad/mode/sequence/SequenceEditor";
import { click as clickEvent } from '@biocad/jfw/event'
import SBOLDroppable from "biocad/droppable/SBOLDroppable";
import copySBOL from "biocad/util/copySBOL";
import { node } from 'rdfoo'
export class InspectComponentDialogOptions extends DialogOptions {

    uri:string

    targetComponent:S3Component|null

}

export default class InspectComponentDialog extends TabbedDialog {

    graph:Graph
    component:S3Component
    targetComponent:S3Component|null

    onUsePart:null|((part:S3Component)=>void)

    constructor(app:BiocadApp, opts:InspectComponentDialogOptions) {

        super(app, opts)


        this.targetComponent = opts.targetComponent

        this.setWidthAndCalcPosition('75%')

        fetch(opts.uri + '/sbol').then(async r => {

            let str = await r.text()

            SBOL3GraphView.loadString(str).then((gv:SBOL3GraphView) => {

                this.graph = gv.graph
                this.component = new S3Component(gv, node.createUriNode(opts.uri))

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
        })

    }

    getContentView():VNode {

        let buttonChildren:VNode[] = []

        if(this.onUsePart) {
            buttonChildren.push(
                h('button.jfw-button.jfw-big-button.jfw-green-button', {
                    style: {
                        position: 'absolute',
                        right: '16px'
                    },
                    'ev-click': clickEvent(clickInsert, { dialog: this })
                }, [
                    h('span.fa.fa-plus'),
                    ' Use this Part'
                ])
            )
        }

        return h('div', buttonChildren.concat([ super.getContentView() ]))
    }

}

function clickInsert(data) {

    const dialog:InspectComponentDialog = data.dialog

    const component:S3Component = dialog.component

    const app:BiocadApp = dialog.app as BiocadApp

    if(dialog.targetComponent) {

        let identityMap = 
            copySBOL(component.graph, dialog.targetComponent.graph, dialog.targetComponent.uriPrefix)

        let newComponentUri = identityMap.get(component.uri)

        if(!newComponentUri) {
            console.dir(identityMap)
            throw new Error(component.uri + ' not found in identityMap')
        }

        let newComponent = sbol3(dialog.targetComponent.graph).uriToFacade(newComponentUri)

        if(! (newComponent instanceof S3Component)) {
            throw new Error('???')
        }

        for(let instance of sbol3(dialog.targetComponent.graph).getInstancesOfComponent(dialog.targetComponent)) {
            instance.instanceOf = newComponent
        }

        dialog.targetComponent.destroy()

    } else {
        const droppable:SBOLDroppable = new SBOLDroppable(app, component.graph, [ component.uri ])

        app.dropOverlay.startDropping(droppable)
    }

    if(dialog.onUsePart) {
        dialog.onUsePart(component)
    }

    app.closeDialogAndParents(dialog)
}