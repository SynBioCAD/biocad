
import App from '../../BiocadApp'

import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import RepoView from "biocad/mode/repository/RepoView";
import RepoViewLeftSidebar from 'biocad/mode/repository/RepoViewLeftSidebar';

export default class RepoMode extends Mode {

    constructor(app:App, active:boolean) {

        const repositoryView:RepoView = new RepoView(app)
	const sidebar = new RepoViewLeftSidebar(app, repositoryView)

        super(
            app,
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


