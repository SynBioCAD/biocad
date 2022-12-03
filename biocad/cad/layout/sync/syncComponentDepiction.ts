import assert from "assert"
import { S3SubComponent, S3Component } from "sboljs"
import S3ComponentReference from "sboljs/dist/sbol3/S3ComponentReference"
import IdentifiedChain from "../../../IdentifiedChain"
import DetailPreset from "../../detail-preset/DetailPreset"
import ComponentDepiction from "../ComponentDepiction"
import ComponentDisplayList from "./ComponentDisplayList"
import Depiction, { Orientation, Opacity } from "../Depiction"
import Layout from "../Layout"
import syncBackboneGroup from "./syncBackboneGroup"
import syncLabel from "./syncLabel"

export default function syncComponentDepiction(
	layout:Layout,
	preset:DetailPreset,
	depictionOf:S3Component|S3SubComponent|S3ComponentReference,
	component:S3Component,
	chain:IdentifiedChain,
	parent:Depiction|undefined,
	nestDepth:number,
	orientation:Orientation):ComponentDepiction {

        const opacity:Opacity = preset.getComponentOpacity(component, nestDepth)

        var cDepiction:ComponentDepiction

        var depiction:Depiction|undefined = layout.identifiedChainToDepiction.get(chain.stringify())

        if(depiction !== undefined) {

            assert(depiction instanceof ComponentDepiction)

            depiction.stamp = Layout.nextStamp

            cDepiction = depiction as ComponentDepiction

	    if(parent)
		layout.attachToParent(depiction, parent)

        } else {

            cDepiction = new ComponentDepiction(layout, depictionOf, component, chain, parent)
            cDepiction.setSameVersionAs(layout)

            layout.addDepiction(cDepiction, parent)

            cDepiction.opacity = opacity

        }

        cDepiction.orientation = orientation
        cDepiction.depictionOf = component
        cDepiction.isExpandable = component.subComponents.length > 0

        if(cDepiction.opacity === Opacity.Whitebox) {

            var displayList:ComponentDisplayList = ComponentDisplayList.fromComponent(layout.graph, component)

            //console.log(displayList.backboneGroups.length + ' bb groups for ' + component.uriChain)

            for(let backboneGroup of displayList.backboneGroups) {
                syncBackboneGroup(layout, preset, backboneGroup, chain, cDepiction, nestDepth + 1, orientation)
            }

            for(let child of displayList.ungrouped) {

                if(! (child instanceof S3SubComponent))
                    throw new Error('???')

                let nextChain = chain.extend(child)

                let ci = syncComponentDepiction(layout, preset, child, child.instanceOf, nextChain, cDepiction, nestDepth + 1, orientation)
                syncLabel(layout, preset, cDepiction, ci, nestDepth)

            }

            //console.log(definition.displayName + ' has ' + definition.interactions.length + ' interactions')

            for(let interaction of component.interactions) {

                let newChain = chain.extend(interaction)

                layout.createInteractionDepiction(preset, interaction, newChain, cDepiction)
            }
        }

        return cDepiction
    }