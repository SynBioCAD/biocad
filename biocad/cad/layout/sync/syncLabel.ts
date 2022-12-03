import DetailPreset from "../../detail-preset/DetailPreset"
import Depiction from "../Depiction"
import LabelDepiction from "../LabelDepiction"
import Layout from "../Layout"

    export default function syncLabel(layout:Layout, preset:DetailPreset, parent:Depiction|undefined, labelFor:Depiction, nestDepth:number):void {

        let label:LabelDepiction|undefined = undefined

        let siblings = parent ? parent.children : layout.depictions // todo?

        for(let child of siblings) {
            if(child instanceof LabelDepiction && child.labelFor) {
                let existingChain = child.labelFor.identifiedChain
                let newChain = labelFor.identifiedChain
                if(existingChain && newChain && existingChain.stringify() === newChain.stringify()) {
                    label = child
                    break
                }
            }
        }

        if(label) {
            label.labelFor = labelFor
            labelFor.label = label
            label.setSameVersionAs(layout)
            label.stamp = Layout.nextStamp
        } else {
            label = new LabelDepiction(layout, labelFor, parent)
            layout.addDepiction(label, parent)
        }
    }