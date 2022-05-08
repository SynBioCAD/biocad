
import { View, TabbedView, Tab } from "@biocad/jfw/ui";
import { VNode, h, create, svg } from "@biocad/jfw/vdom";
import BiocadApp from "biocad/BiocadApp";

import { search, SearchResult } from 'sbh-proxy-client'

import SVGScrollerWidget from './SVGScrollerWidget'
import RepoViewPartScroller from "biocad/mode/repository/RepoViewPartScroller";
import { Graph, S3Collection, S3Component, S3Identified, sbol2, sbol3, SBOLConverter } from "sbolgraph";
import getNameFromRole from "../../util/getNameFromRole";
import RepoCollectionMembersView, { MemberType } from "./RepoCollectionMembersView";
import { Types } from "bioterms";
import RepoComponentVisualView from "./RepoComponentVisualView";
import RepoComponentSeqView from "./RepoComponentSeqView";
import SequenceEditor from "../sequence/SequenceEditor";


/* Shows a top level from a repo

could be a collection or a component etc

*/

export default class RepoView extends View {

	loading:boolean
	g:Graph|undefined

	tabs:TabbedView

    constructor(app:BiocadApp) {

        super(app)


	this.loading = false


    }

    render():VNode {

	if(!this.g|| this.loading) {
		return h('div.loader')
	}

	let tl = sbol3(this.g!).topLevels[0]

        return h('div', {
		style: {
			padding: '8px',
			display: 'flex',
			flexDirection: 'column',
			minHeight: 0,
			flex: 1
		}
	},[
		h('div', [
				h('h1', tl.displayName),
				h('p', [
					h('a', { href: tl.uri, target: '_blank' }, h('code', tl.uri))
				]),
				h('p', tl.description),
			]),
		 this.tabs.render()
			])

        
    }

    onClickPart(uri:string) {

        // this.app.openOrphanView(new PartSummaryView(this.app as BiocadApp, uri))


    }

    async load(uri:string) {

	this.loading = true
	this.update()

	//let xml = await (await fetch(uri + '/sbolnr')).text()

	let res = await fetch('https://synbiohub.org/sparql?query=' + encodeURIComponent(FetchMetadataQuery(uri)), {
		headers: {
			accept: 'application/rdf+xml'
		}
	})
	let xml = await res.text()

	this.g = new Graph()

	console.time('load obj into graph')
	await this.g.loadString(xml)
	console.timeEnd('load obj into graph')

	console.time('load obj into graph 2to3')
	await SBOLConverter.convert2to3(this.g)
	console.timeEnd('load obj into graph 2to3')

	console.log(sbol3(this.g).serializeXML())

	let topLevel = sbol3(this.g!).uriToFacade(uri)

	if(!topLevel) {
		return h('div', 'bad result from sbh?')
	}

	if(topLevel instanceof S3Collection) {

		let [ countCd, countMd, countSeq, countColl ] = await Promise.all([
			runCount(Types.SBOL2.ComponentDefinition),
			runCount(Types.SBOL2.ModuleDefinition),
			runCount(Types.SBOL2.Sequence),
			runCount(Types.SBOL2.Collection),
		])

		this.tabs = new TabbedView(this.app)

		let tabs:any = []

		if(countCd + countMd > 0) {
			tabs.push(
			new Tab('Components (' + (countCd + countMd) + ')', new RepoCollectionMembersView(this, topLevel, MemberType.Component), true),
			)
		}
		if(countSeq > 0) {
			tabs.push(
			new Tab('Sequences (' + (countSeq) + ')', new RepoCollectionMembersView(this, topLevel, MemberType.Sequence), true),
			)
		}
		if(countColl > 0) {
			tabs.push(
			new Tab('Subcollections (' + (countColl) + ')', new RepoCollectionMembersView(this, topLevel, MemberType.Collection), true),
			)
		}

		this.tabs.setTabs(tabs)

	} else {

		let res = await fetch(topLevel.uri + '/sbol')

		let xml = await res.text()

		this.g = new Graph()

		console.time('load obj into graph 2')
		await this.g.loadString(xml)
		console.timeEnd('load obj into graph 2')

		console.time('load obj into graph 2to3 2')
		await SBOLConverter.convert2to3(this.g)
		console.timeEnd('load obj into graph 2to3 2')

		console.log(sbol3(this.g).serializeXML())

		// with everything this time
		topLevel = sbol3(this.g!).uriToFacade(uri)

		let tabs:any = []

		if(topLevel instanceof S3Component) {

			tabs.push(
				new Tab('Visual', new RepoComponentVisualView(this, this.g, topLevel), true)
			)

			console.log('tl sequences length is '+topLevel.sequences.length)

			if(topLevel.sequences.length > 0) {
				tabs.push(
					new Tab('Sequence', new RepoComponentSeqView(this, this.g, topLevel), false)
				)
			}

		}

		this.tabs.setTabs(tabs)

	}

	this.loading= false
	this.update()

	
	async function runCount(type) {

	let res = await fetch('https://synbiohub.org/sparql?query=' + encodeURIComponent(CountQuery(uri, type)), {
		headers: {
			accept: 'application/sparql-results+json'
		}
	})
	let json = await res.json()
	return parseInt(json.results.bindings[0].count.value)
	}


    }



}







function FetchMetadataQuery(uri:string) {

	return `PREFIX sbol: <http://sbols.org/v2#>
	PREFIX dcterms: <http://purl.org/dc/terms/>
	PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
	CONSTRUCT {
	    <${uri}> a ?type .
	    <${uri}> sbol:displayId ?displayId .
	    <${uri}> dcterms:title ?title .
	    <${uri}> dcterms:description ?desc .
	    <${uri}> sbh:ownedBy ?ownedBy .
	} WHERE {
	    <${uri}> a ?type .
	    <${uri}> sbol:displayId ?displayId .
	    OPTIONAL { <${uri}> dcterms:title ?title . }
	    OPTIONAL { <${uri}> dcterms:description ?desc . }
	    OPTIONAL { <${uri}> sbh:ownedBy ?ownedBy . }
	} 
    `

}



function CountQuery(uri:string, type:string) {

	return `PREFIX sbol: <http://sbols.org/v2#>
	PREFIX dcterms: <http://purl.org/dc/terms/>
	PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
	SELECT (count(?member) as ?count) WHERE {
	    <${uri}> sbol:member ?member .
	    ?member a <${type}> .
	}
    `

}