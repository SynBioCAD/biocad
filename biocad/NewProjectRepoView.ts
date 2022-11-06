import { View } from "@biocad/jfw/ui"
import { h, VNode } from "@biocad/jfw/vdom"
import RepoBrowser from "./repo-browser/RepoBrowser"
import RepoCollectionList from "./repo-browser/RepoCollectionList"
import RepoTree from "./repo-browser/RepoTree"

export default class NewProjectRepoView extends View {

	repoCollectionList:RepoCollectionList
	repoBrowser:RepoBrowser

    constructor(updateable) {

        super(updateable)

	this.repoCollectionList = new RepoCollectionList(updateable)

	this.repoCollectionList.onSelectCollection.listen((collUri) => {
		this.repoBrowser = new RepoBrowser(updateable)
		this.repoBrowser.load(collUri)
		this.update()
	})
    }

    render():VNode {

	if(this.repoBrowser) {
		return h('div', {
			style: {
				'max-width': '80%',
				'margin-left': 'auto',
				'margin-right': 'auto',
			}
		}, [
			this.repoBrowser.render()
		])
	} else {
		return this.repoCollectionList.render()
	}

    }

}

/*

	project:BiocadProject

repoBrowser:RepoBrowser

    tree:RepoTree

    onSelectCollection:Hook<string> = new Hook()

    constructor(project, repoBrowser:RepoBrowser) {

        super(project)

	this.project = project

	this.repoBrowser = repoBrowser

	this.tree = new RepoTree(project)

	this.tree.onSelectCollection.listen((uri:string) => {
		this.onSelectCollection.fire(uri)
	})


        this.setLightMode(true)

        this.setSections([
            new SidebarSection(
		this.tree,
                'Repositories'
            )
        ])
*/
