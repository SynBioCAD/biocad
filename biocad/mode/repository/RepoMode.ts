
import App from '../../BiocadApp'

import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import RepoView from "biocad/mode/repository/RepoView";
import RepoViewLeftSidebar from 'biocad/mode/repository/RepoViewLeftSidebar';
import BiocadProject from '../../BiocadProject';

export default class RepoMode extends Mode {

    constructor(app:App, project:BiocadProject, active:boolean) {

        const repositoryView:RepoView = new RepoView(project)
	const sidebar = new RepoViewLeftSidebar(project, repositoryView)

        super(
            app,
	    project,
            active,
            repositoryView,
            sidebar,
            null
        )

	sidebar.onSelectCollection.listen((uri:string) => {
		repositoryView.load(uri)
	})



    }

    getName():VNode {
        return h('span', 'SynBioHub')
    }

}



