import { View, TreeView, TreeNode } from "@biocad/jfw/ui";
import BiocadApp from "biocad/BiocadApp";
import { h, VNode } from "@biocad/jfw/vdom";
import { Hook } from "@biocad/jfw/util";
import { click as clickEvent } from '@biocad/jfw/event'

export default class RepoCollectionList extends View {

	collectionUri:string|null
	collections:any[]

    onSelectCollection:Hook<string> = new Hook()

    constructor(updateable) {

        super(updateable)

	this.collectionUri = null

	this.fetchCollections()

    }

    render():VNode {

	if(!this.collections) {
		return h('div.loading')
	}

	let elements:any[] = []

	if(!this.collectionUri) {
		elements.push(h('h2', 'Collections (' + this.collections.length + ')'))
	}

	elements.push(h('div.biocad-repo-collection-list-entries', [
		this.collections.map(coll => {
			return h('div.biocad-repo-collection-list-entry', {
				'ev-click': clickEvent(clickCollection, { view : this, coll })
			 }, h('a', '» ' +coll.name))
		})
	]))
	

	return h('div.biocad-repo-collection-list', elements)
	

			// let tn = new TreeNode()
			// tn.id = coll.uri
			// tn.title = coll.name
			// // tn.fetchSubnodes = async () => {
			// // 	let scs = await (await fetch(coll.uri + '/subCollections')).json()
			// // 	return collsToNodes(scs)
			// // }
			// tn.subnodes = []

    }



    async fetchCollections() {

	let rootColls = await (await fetch('https://synbiohub.org/rootCollections')).json()

	this.collections = rootColls
	this.update()



    }

}

function clickCollection(data)  {

	let { view, coll } = data

	view.onSelectCollection.fire(coll.uri)
}



