import assert from "assert"
import { S3Feature, S3SubComponent, S3SequenceFeature, S3Component } from "sboljs"
import S3ComponentReference from "sboljs/dist/sbol3/S3ComponentReference"
import IdentifiedChain from "../../../IdentifiedChain"
import DetailPreset from "../../detail-preset/DetailPreset"
import ComponentDepiction from "../ComponentDepiction"
import Depiction, { Orientation, Opacity } from "../Depiction"
import Layout from "../Layout"
import syncBackboneGroup from "./syncBackboneGroup"
import syncComponentDepiction from "./syncComponentDepiction"
import syncLabel from "./syncLabel"

export default function syncComponentReferenceDepiction(layout:Layout, preset:DetailPreset, ref:S3ComponentReference, chain:IdentifiedChain, parent:Depiction, nestDepth:number, orientation:Orientation):ComponentDepiction {

	console.log('syncComponentReferenceDepiction')

	let feature:S3Feature = ref.refersTo

	if(feature instanceof S3SubComponent) {

		let subComponent:S3SubComponent = feature as S3SubComponent

		return syncComponentDepiction(layout, preset, ref, subComponent.instanceOf, chain, parent, nestDepth+1, orientation)

	} else if(feature instanceof S3SequenceFeature) {

		let sequenceFeature:S3SequenceFeature = feature as S3SequenceFeature

	}


		throw new Error('not implemneted yet')
}

