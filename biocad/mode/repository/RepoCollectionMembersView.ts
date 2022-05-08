
import { View, TabbedView, Tab, DataTable } from "@biocad/jfw/ui";
import { VNode, h, create, svg } from "@biocad/jfw/vdom";

import { Graph, S3Collection, S3Component, S3Identified, sbol2, sbol3, SBOLConverter } from "sbolgraph";
import BiocadApp from "../../BiocadApp";
import getNameFromRole from "../../util/getNameFromRole";
import RepoView from "./RepoView";


/* Shows a top level from a repo

could be a collection or a component etc

*/

export enum MemberType {
	Collection,
	Component,
	Sequence,
	Other
}

export default class RepoCollectionMembersView extends View {

	repoView:RepoView

	collection: S3Collection
	type: MemberType

	loading: boolean

	dt:DataTable


	constructor(repoView:RepoView, collection: S3Collection, type: MemberType) {

		super(repoView.app)

		this.repoView = repoView
		this.collection = collection
		this.type = type

	}


	activate() {
		console.log('activate view')
		if(!this.dt)
			this.load()
	}

	render(): VNode {

		return this.dt ? this.dt.render() : h('div.loader')

	}

	onClickPart(uri: string) {

		// this.app.openOrphanView(new PartSummaryView(this.app as BiocadApp, uri))


	}

	async doQuery(constructQuery:(uri, offset, limit)=>string):any {

		let offset = 0
		let limit = 10000
		let allres: any = {}

		for (; ;) {
			let res = await fetch('https://synbiohub.org/sparql?query=' + encodeURIComponent(constructQuery(this.collection.uri, offset, limit)), {
				headers: {
					accept: 'application/json'
				}
			})
			let json = await res.json()
			if (!json || JSON.stringify(json) === '{}')
				break
			allres = { ...allres, ...json }
			offset += limit
		}

		return allres

	}

	async load() {

		this.loading = true
		this.update()

		let coll = this.collection

		let allres:any = {}

		switch(this.type) {
			case MemberType.Component:
				allres = {
					...(await this.doQuery((uri, offset, limit) => ComponentsQuery(uri, offset, limit))),
					...(await this.doQuery((uri, offset, limit) => ModulesQuery(uri, offset, limit))),
				}
				this.dt = new DataTable(this.app, [
					{
						title: 'Type',
						getValue: (row: any) => displayType(row)
					},
					{
						title: 'Identifier',
						getValue: (row: any) => row['http://sbols.org/v2#displayId']?.[0]?.value
					},
					{
						title: 'Name',
						getValue: (row: any) => row['http://purl.org/dc/terms/title']?.[0]?.value
					},
					{
						title: 'Description',
						getValue: (row: any) => row['http://purl.org/dc/terms/description']?.[0]?.value
					},
					{
						title: 'Created',
						getValue: (row: any) => new Date(row.created).toDateString()
					}
				])

				break
			case MemberType.Sequence:
				allres = {
					...(await this.doQuery((uri, offset, limit) => SequencesQuery(uri, offset, limit))),
				}
				this.dt = new DataTable(this.app, [
					{
						title: 'Identifier',
						getValue: (row: any) => row['http://sbols.org/v2#displayId']?.[0]?.value
					},
					{
						title: 'Name',
						getValue: (row: any) => row['http://purl.org/dc/terms/title']?.[0]?.value
					},
					{
						title: 'Description',
						getValue: (row: any) => row['http://purl.org/dc/terms/description']?.[0]?.value
					},
					{
						title: 'Created',
						getValue: (row: any) => new Date(row.created).toDateString()
					}
				])
				break
			case MemberType.Collection:
				allres = {
					...(await this.doQuery((uri, offset, limit) => CollectionsQuery(uri, offset, limit))),
				}
				this.dt = new DataTable(this.app, [
					{
						title: 'Identifier',
						getValue: (row: any) => row['http://sbols.org/v2#displayId']?.[0]?.value
					},
					{
						title: 'Name',
						getValue: (row: any) => row['http://purl.org/dc/terms/title']?.[0]?.value
					},
					{
						title: 'Description',
						getValue: (row: any) => row['http://purl.org/dc/terms/description']?.[0]?.value
					},
					{
						title: 'Created',
						getValue: (row: any) => new Date(row.created).toDateString()
					}
				])
				break
			case MemberType.Other:
				allres = {
					// ...(await this.doQuery((uri, offset, limit) => OtherQuery(uri, offset, limit))),
				}
				this.dt = new DataTable(this.app, [
					{
						title: 'Identifier',
						getValue: (row: any) => row['http://sbols.org/v2#displayId']?.[0]?.value
					},
					{
						title: 'Name',
						getValue: (row: any) => row['http://purl.org/dc/terms/title']?.[0]?.value
					},
					{
						title: 'Description',
						getValue: (row: any) => row['http://purl.org/dc/terms/description']?.[0]?.value
					},
					{
						title: 'Created',
						getValue: (row: any) => new Date(row.created).toDateString()
					}
				])
				break
		}


		console.time('transform json')
		let m = Object.keys(allres).map(k => ({uri:k, ...allres[k]}))

		for (let obj of m) {
			let mv = obj['http://purl.org/dc/terms/created']?.[0]?.value
			if (mv) {
				obj.created = Date.parse(mv)
			} else {
				obj.created = 0
			}
		}

		m.sort((a, b) => {
			return b.created - a.created

		})

		console.timeEnd('transform json')

		this.dt.setRows(m)

		this.dt.onClickRow.listen((row) => {
			this.repoView.load(row.uri)
			
		})

		this.loading = false

		this.update()
	}

}


function ComponentsQuery(uri:string, offset:number, limit:number) {

	return ` PREFIX sbol: <http://sbols.org/v2#>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
		CONSTRUCT {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#ComponentDefinition> .
		?s sbol:displayId ?displayId .
		?s dcterms:title ?title .
		?s dcterms:description ?description .
		?s dcterms:created ?created .
		?s dcterms:modified ?modified .
		?s sbh:ownedBy ?ownedBy .
		?s sbol:role ?role .
		?s sbol:encoding ?encoding .
		} WHERE {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#ComponentDefinition> .
		?s sbol:displayId ?displayId .
		OPTIONAL { ?s dcterms:created ?created . }
		OPTIONAL { ?s dcterms:modified ?modified . }
		OPTIONAL { ?s dcterms:title ?title . }
		OPTIONAL { ?s dcterms:description ?description . }
		OPTIONAL { ?s sbol:role ?role . }
		} 
		OFFSET ${offset}
		LIMIT ${limit}
	`

		// OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
		// OPTIONAL { ?s sbol:encoding ?encoding . }

		// ${searchQuery ? sparqlFilterFromSearchQuery('?s', searchQuery) : ''}
		// ${searchQuery ? sparqlBindOrderPredicateFromSearchQuery('?s', searchQuery) : ''}
}

function SequencesQuery(uri:string, offset:number, limit:number) {

	return ` PREFIX sbol: <http://sbols.org/v2#>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
		CONSTRUCT {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#Sequence> .
		?s sbol:displayId ?displayId .
		?s dcterms:title ?title .
		?s dcterms:description ?description .
		?s dcterms:created ?created .
		?s dcterms:modified ?modified .
		?s sbh:ownedBy ?ownedBy .
		?s sbol:encoding ?encoding .
		} WHERE {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#Sequence> .
		?s sbol:displayId ?displayId .
		?s sbol:encoding ?encoding .
		OPTIONAL { ?s dcterms:created ?created . }
		OPTIONAL { ?s dcterms:modified ?modified . }
		OPTIONAL { ?s dcterms:title ?title . }
		OPTIONAL { ?s dcterms:description ?description . }
		} 
		OFFSET ${offset}
		LIMIT ${limit}
	`

		// OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
		// OPTIONAL { ?s sbol:encoding ?encoding . }

		// ${searchQuery ? sparqlFilterFromSearchQuery('?s', searchQuery) : ''}
		// ${searchQuery ? sparqlBindOrderPredicateFromSearchQuery('?s', searchQuery) : ''}
}

function ModulesQuery(uri:string, offset:number, limit:number) {

	return ` PREFIX sbol: <http://sbols.org/v2#>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
		CONSTRUCT {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#ModuleDefinition> .
		?s sbol:displayId ?displayId .
		?s dcterms:title ?title .
		?s dcterms:description ?description .
		?s dcterms:created ?created .
		?s dcterms:modified ?modified .
		?s sbh:ownedBy ?ownedBy .
		?s sbol:role ?role .
		} WHERE {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#ModuleDefinition> .
		?s sbol:displayId ?displayId .
		OPTIONAL { ?s dcterms:created ?created . }
		OPTIONAL { ?s dcterms:modified ?modified . }
		OPTIONAL { ?s dcterms:title ?title . }
		OPTIONAL { ?s dcterms:description ?description . }
		OPTIONAL { ?s sbol:role ?role . }
		} 
		OFFSET ${offset}
		LIMIT ${limit}
	`

		// OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
		// OPTIONAL { ?s sbol:encoding ?encoding . }

		// ${searchQuery ? sparqlFilterFromSearchQuery('?s', searchQuery) : ''}
		// ${searchQuery ? sparqlBindOrderPredicateFromSearchQuery('?s', searchQuery) : ''}
}

function CollectionsQuery(uri:string, offset:number, limit:number) {

	return ` PREFIX sbol: <http://sbols.org/v2#>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
		CONSTRUCT {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#Collection> .
		?s sbol:displayId ?displayId .
		?s dcterms:title ?title .
		?s dcterms:description ?description .
		?s dcterms:created ?created .
		?s dcterms:modified ?modified .
		?s sbh:ownedBy ?ownedBy .
		} WHERE {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#Collection> .
		?s sbol:displayId ?displayId .
		OPTIONAL { ?s dcterms:created ?created . }
		OPTIONAL { ?s dcterms:modified ?modified . }
		OPTIONAL { ?s dcterms:title ?title . }
		OPTIONAL { ?s dcterms:description ?description . }
		} 
		OFFSET ${offset}
		LIMIT ${limit}
	`

		// OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
		// OPTIONAL { ?s sbol:encoding ?encoding . }

		// ${searchQuery ? sparqlFilterFromSearchQuery('?s', searchQuery) : ''}
		// ${searchQuery ? sparqlBindOrderPredicateFromSearchQuery('?s', searchQuery) : ''}
}

function sparqlBindOrderPredicateFromSearchQuery(subject:string, searchQuery:any):string {

	if(searchQuery.sortByPredicate) {
	return `${subject} <${searchQuery.sortByPredicate}> ?sortBy .`
	} else {
	return ''
	}
}

function sparqlFilterFromSearchQuery(subject:string, searchQuery:any):string {

	let substr = searchQuery.substring

	if(substr) {
	return `FILTER(
		CONTAINS(lcase(str(${subject})), lcase(${substr})) ||
		CONTAINS(lcase(?displayId), lcase(${substr})) ||
		CONTAINS(lcase(?title), lcase(${substr})) ||
		CONTAINS(lcase(?description), lcase(${substr}))
	)`
	} else {
	return ''
	}
}

		function displayType(member) {
			if (member['http://sbols.org/v2#role']) {
				return (member['http://sbols.org/v2#role'][0].value && getNameFromRole(member['http://sbols.org/v2#role'][0].value)) || 'Component'
			}
			return 'Other'
		}