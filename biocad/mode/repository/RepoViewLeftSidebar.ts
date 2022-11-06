
import { Sidebar, SidebarSection } from "@biocad/jfw/ui";
import { Hook } from "@biocad/jfw/util";
import BiocadProject from "../../BiocadProject";
import RepoBrowser from "../../repo-browser/RepoBrowser";
import RepoTree from "../../repo-browser/RepoTree";

export default class RepoViewLeftSidebar extends Sidebar {

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

    }

}

