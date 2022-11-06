
import App from '../../BiocadApp'

import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import RepoViewLeftSidebar from 'biocad/mode/repository/RepoViewLeftSidebar';
import BiocadProject from '../../BiocadProject';
import RepoBrowser from '../../repo-browser/RepoBrowser';

export default class RepoMode extends Mode {

    constructor(app:App, project:BiocadProject, active:boolean) {

        const repoBrowser = new RepoBrowser(app, project)
	const sidebar = new RepoViewLeftSidebar(project, repoBrowser)

        super(
            app,
	    project,
            active,
            repoBrowser,
            sidebar,
            null
        )

	sidebar.onSelectCollection.listen((uri:string) => {
		repoBrowser.load(uri)
	})



    }

    getName():VNode {
        return h('span', 'SynBioHub')
    }

}



