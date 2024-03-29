import { View, TreeView, TreeNode } from "@biocad/jfw/ui";
import BiocadApp from "biocad/BiocadApp";
import { VNode } from "@biocad/jfw/vdom";
import { Hook } from "@biocad/jfw/util";
import BiocadProject from "../../BiocadProject";

export default class RepoTree extends View {

	project:BiocadProject

    treeView:TreeView

    onSelectCollection:Hook<string> = new Hook()

    constructor(project:BiocadProject) {

        super(project)

	this.project = project







        this.treeView = new TreeView(project)

	this.treeView.onSelect.listen((uri:string) => {
		this.onSelectCollection.fire(uri)
	})

	this.fetchCollections()

    }

    render():VNode {

        return this.treeView.render()

    }



    async fetchCollections() {

	let rootColls = await (await fetch('https://synbiohub.org/rootCollections')).json()

	this.treeView.setNodeFetcher( () => {
		 return Promise.resolve(collsToNodes(rootColls))
	})

	async function collsToNodes(colls) {

		return await Promise.all(colls.map(async coll => {

			let tn = new TreeNode()
			tn.id = coll.uri
			tn.title = coll.name
			// tn.fetchSubnodes = async () => {
			// 	let scs = await (await fetch(coll.uri + '/subCollections')).json()
			// 	return collsToNodes(scs)
			// }
			tn.subnodes = []


			return tn
		}))
	}


    }

}

