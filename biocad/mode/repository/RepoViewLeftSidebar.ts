
import RepoView from "biocad/mode/repository/RepoView";
import { Sidebar, SidebarSection } from "@biocad/jfw/ui";
import RepoTree from "biocad/mode/repository/RepoTree";
import { Hook } from "@biocad/jfw/util";
import BiocadProject from "../../BiocadProject";

export default class RepoViewLeftSidebar extends Sidebar {

	project:BiocadProject

    repositoryView:RepoView

    tree:RepoTree

    onSelectCollection:Hook<string> = new Hook()

    constructor(project, repositoryView:RepoView) {

        super(project)

	this.project = project

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

    }

}

