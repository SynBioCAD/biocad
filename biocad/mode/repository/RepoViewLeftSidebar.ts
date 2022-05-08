
import RepoView from "biocad/mode/repository/RepoView";
import { Sidebar, SidebarSection } from "@biocad/jfw/ui";
import RepoTree from "biocad/mode/repository/RepoTree";
import { Hook } from "@biocad/jfw/util";

export default class RepoViewLeftSidebar extends Sidebar {

    repositoryView:RepoView

    tree:RepoTree

    onSelectCollection:Hook<string> = new Hook()

    constructor(app, repositoryView:RepoView) {

        super(app)

	this.tree = new RepoTree(app)

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

