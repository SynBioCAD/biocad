
import { View, TabbedView, Tab, DataTable, DataTableColumn } from "@biocad/jfw/ui";
import { VNode, h, create, svg } from "@biocad/jfw/vdom";

import { Graph, S3Collection, S3Component, S3Identified, sbol2, sbol3, SBOLConverter } from "sboljs";
import BiocadApp from "../BiocadApp";
import BiocadProject from "../BiocadProject";
import getNameFromRole from "../util/getNameFromRole";
import RepoBrowser from "./RepoBrowser";

import { getComponents } from "./RepoClient";


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

	project?:BiocadProject

	repoBrowser:RepoBrowser

	collection: S3Collection
	type: MemberType

	loading: boolean

	dt:DataTable<any>


	constructor(repoBrowser:RepoBrowser, collection: S3Collection, type: MemberType) {

		super(repoBrowser)
		this.project = repoBrowser.project

		this.repoBrowser = this.repoBrowser
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

		// this.project.openOrphanView(new PartSummaryView(this.project, uri))


	}

	async load() {

		this.loading = true
		this.update()

		let coll = this.collection

		switch(this.type) {
			case MemberType.Component:
				this.dt = new DataTable<any>(this, [
					{
						id: '',
						title: 'Type',
						getValue: (row: any) => displayType(row)
					},
					{
						id: 'displayId',
						title: 'Identifier',
						getValue: (row: any) => row.displayId
					},
					{
						id: 'name',
						title: 'Name',
						getValue: (row: any) => row.name
					},
					{
						id: 'description',
						title: 'Description',
						getValue: (row: any) => row.description
					},
					{
						id: 'created',
						title: 'Created',
						getValue: (row: any) => new Date(row.created).toDateString()
					}
				], async (offset:number, limit:number, sortBy:DataTableColumn<any>|undefined, sortOrder:'asc'|'desc') => {

					let { rows, total } = await getComponents(coll.uri, {
						offset,
						limit,
						sortBy:'http://purl.org/dc/terms/title',
						sortOrder,
						filter: ''
					})

					return {
						rows: transformJson(rows), total
					}
				})

				break
			case MemberType.Sequence:
				this.dt = new DataTable(this, [
					{
						id: 'http://sbols.org/v2#displayId',
						title: 'Identifier',
						getValue: (row: any) => row['http://sbols.org/v2#displayId']?.[0]?.value
					},
					{
						id: 'http://purl.org/dc/terms/title',
						title: 'Name',
						getValue: (row: any) => row['http://purl.org/dc/terms/title']?.[0]?.value
					},
					{
						id: 'http://purl.org/dc/terms/description',
						title: 'Description',
						getValue: (row: any) => row['http://purl.org/dc/terms/description']?.[0]?.value
					},
					{
						id: 'http://purl.org/dc/terms/created',
						title: 'Created',
						getValue: (row: any) => new Date(row.created).toDateString()
					}
				], async (offset:number, limit:number, sortBy:DataTableColumn<any>|undefined, sortOrder:'asc'|'desc') => {
					return {rows:[],total:0}
				})

				break
			case MemberType.Collection:
				this.dt = new DataTable(this, [
					{
						id: 'http://sbols.org/v2#displayId',
						title: 'Identifier',
						getValue: (row: any) => row['http://sbols.org/v2#displayId']?.[0]?.value
					},
					{
						id: 'http://purl.org/dc/terms/title',
						title: 'Name',
						getValue: (row: any) => row['http://purl.org/dc/terms/title']?.[0]?.value
					},
					{
						id: 'http://purl.org/dc/terms/description',
						title: 'Description',
						getValue: (row: any) => row['http://purl.org/dc/terms/description']?.[0]?.value
					},
					{
						id: 'http://purl.org/dc/terms/created',
						title: 'Created',
						getValue: (row: any) => new Date(row.created).toDateString()
					}
				], async (offset:number, limit:number, sortBy:DataTableColumn<any>|undefined, sortOrder:'asc'|'desc') => {
					return {rows:[],total:0}
				})

				break
			case MemberType.Other:
				this.dt = new DataTable(this, [
					{
						id: 'http://sbols.org/v2#displayId',
						title: 'Identifier',
						getValue: (row: any) => row['http://sbols.org/v2#displayId']?.[0]?.value
					},
					{
						id: 'http://purl.org/dc/terms/title',
						title: 'Name',
						getValue: (row: any) => row['http://purl.org/dc/terms/title']?.[0]?.value
					},
					{
						id: 'http://purl.org/dc/terms/description',
						title: 'Description',
						getValue: (row: any) => row['http://purl.org/dc/terms/description']?.[0]?.value
					},
					{
						id: 'http://purl.org/dc/terms/created',
						title: 'Created',
						getValue: (row: any) => new Date(row.created).toDateString()
					}
				], async (offset:number, limit:number, sortBy:DataTableColumn<any>|undefined, sortOrder:'asc'|'desc') => {
					return {rows:[],total:0}
				})

				break
		}



		function transformJson(m) {
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
			return m
		}

		this.dt.onClickRow.listen((row) => {
			this.repoBrowser.load(row.uri)
			
		})

		this.loading = false

		this.update()
	}

}



function displayType(member) {
	if (member['http://sbols.org/v2#role']) {
		return (member['http://sbols.org/v2#role'][0].value && getNameFromRole(member['http://sbols.org/v2#role'][0].value)) || 'Component'
	}
	return 'Other'
}

