
import assert from "assert"
import { Graph, S3Component, S3SubComponent, sbol3 } from "sboljs"
import IdentifiedChain from "../../../IdentifiedChain"
import DetailPreset from "../../detail-preset/DetailPreset"
import levelToPreset from "../../detail-preset/levelToPreset"
import ComponentDepiction from "../ComponentDepiction"
import ComponentDisplayList from "./ComponentDisplayList"
import Depiction, { Opacity, Orientation } from "../Depiction"
import Layout from "../Layout"
import syncBackboneGroup from "./syncBackboneGroup"
import syncComponentDepiction from "./syncComponentDepiction"
import syncLabel from "./syncLabel"

export default function syncDepictions(layout:Layout, detailLevel:number, URIs:string[]): void {

        console.log('syncDepictions', URIs.join(', '))

        ++ Layout.nextStamp

        layout.detailLevel = detailLevel

        const graph:Graph = layout.graph



        /* Create depictions for anything that doesn't already have one
         */

        const preset:DetailPreset = levelToPreset(detailLevel)

        let components:Array<S3Component> = []

        for(let uri of URIs) {

            let c = sbol3(graph).uriToFacade(uri)

            if(c instanceof S3Component) {
                components.push(c)
            }
        }

        //console.log('Layout: I have ' + rootComponents.length + ' root component(s)')
        //console.dir(rootComponents)

        for(let component of components) {

            let chain = new IdentifiedChain()
            chain = chain.extend(component)

	    let componentDepiction = syncComponentDepiction(layout, preset, component, component, chain, undefined, 0, Orientation.Forward)
	    syncLabel(layout, preset, undefined, componentDepiction, 0)
        }


        layout.verifyAcyclic()

        layout.depthSort()




        /// remove any depictions that weren't touched by layout sweep

        /// needs to be leaves first because removeDepiction updates child offsets

        // doesn't work because the parent has already been changed to not be the BB that
        // will be deleted

        // could do it at the time we change the parent?
        // or do a dry run and touch everything first before actually doing anything?

        for(var i = layout.depictions.length - 1; i >= 0
            // removeDepiction might remove the last one
            && i < layout.depictions.length; ) {

            let d = layout.depictions[i]

            //console.log('checking ' + d.debugName + ' depth' + d.calcDepth())

            if(d.stamp !== Layout.nextStamp) {

                console.log(`syncDepictions ${i}/${layout.depictions.length}: `, d.debugName + ' is gone')

                layout.removeDepiction(d)

            } else {

                console.log(`syncDepictions ${i}/${layout.depictions.length}: `, d.debugName + ' is still here')

            }

            -- i

        }


        ///






        layout.verifyAcyclic()

        layout.depthSort()

        console.timeEnd('syncDepictions')

    }