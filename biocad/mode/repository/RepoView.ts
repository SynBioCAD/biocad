
import { View, TabbedView, Tab } from "@biocad/jfw/ui";
import { VNode, h, create, svg } from "@biocad/jfw/vdom";
import BiocadApp from "biocad/BiocadApp";

import { search, SearchResult } from 'sbh-proxy-client'

import { Graph, S3Collection, S3Component, S3Identified, sbol2, sbol3, SBOLConverter } from "sboljs";
import getNameFromRole from "../../util/getNameFromRole";
import RepoCollectionMembersView, { MemberType } from "./RepoCollectionMembersView";
import { Types } from "bioterms";
import RepoComponentVisualView from "./RepoComponentVisualView";
import RepoComponentSeqView from "./RepoComponentSeqView";
import SequenceEditor from "../sequence/SequenceEditor";

import { click as clickEvent } from '@biocad/jfw/event'
import assert from "assert";
import SBOLDroppable from "../../droppable/SBOLDroppable";
import CircuitMode from "../circuit/CircuitMode";
import BiocadProject from "../../BiocadProject";


/* Shows a top level from a repo

could be a collection or a component etc

*/

export default class RepoView extends View {

	project:BiocadProject

	loading:boolean

	g:Graph|undefined
	uri:string

	tabs:TabbedView

    constructor(project:BiocadProject) {

        super(project)

	this.project = project


	this.loading = false


    }

    render():VNode {

	if(!this.g|| this.loading) {
		return h('div.loader')
	}

	let tl = sbol3(this.g!).uriToFacade(this.uri)

	let actions:any = []

	if(tl instanceof S3Component) {

		actions.push(h('div.sf-biglighticons', {
			style: {
				position: 'absolute',
				top: 0,
				right: 0
			}
            }, [
                h('a', {
			'ev-click': clickEvent(clickOpen, { view: this })
                }, [
                    h('span.fa.fa-folder-open', []),
                    h('span.icon-text.jfw-no-select', ' Open')
                ]),
                h('a', {
			'ev-click': clickEvent(clickAdd, { view: this })
                }, [
                    h('span.fa.fa-plus', []),
                    h('span.icon-text.jfw-no-select', ' Add to Design')
                ])
	    ]))
	}

        return h('div', {
		style: {
			padding: '8px',
			display: 'flex',
			flexDirection: 'column',
			minHeight: 0,
			flex: 1
		}
	},[
		h('div', {
			style: {
				position: 'relative'
			}
		},[
				h('h1', tl.displayName),
				h('p', [
					h('a', { href: tl.uri, target: '_blank' }, h('code', tl.uri))
				]),
				h('p', tl.description),
				...actions
			]),
		 this.tabs.render()
			])

        
    }

    onClickPart(uri:string) {

        // this.project.openOrphanView(new PartSummaryView(this.project, uri))


    }

    async load(uri:string) {

	this.uri = uri

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

		this.tabs = new TabbedView(this.project, {})

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

    clickOpen() {

	assert(this.g)

	let project = this.project

	project.loadGraph(this.g, true)
	project.setMode(project.modes.filter((mode) => mode instanceof CircuitMode)[0])

    }

    clickAdd() {

	assert(this.g)

	let project = this.project

	project.setMode(project.modes.filter((mode) => mode instanceof CircuitMode)[0])

	;((this.project).app as BiocadApp).dropOverlay.startDropping(
		new SBOLDroppable(this.project, this.g, [this.uri])
	)

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

function clickOpen({view}) {
	view.clickOpen()
}

function clickAdd({view}) {
	view.clickAdd()
}