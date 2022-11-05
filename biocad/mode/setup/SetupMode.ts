
import App from '../../BiocadApp'

import SetupCurrentDocumentView from './SetupCurrentDocumentView'
import SetupViewSidebar from './SetupViewSidebar'
import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import BiocadProject from '../../BiocadProject';

export default class SetupViewMode extends Mode {

    constructor(app:App, project:BiocadProject, active:boolean) {

        super(
            app,
	    project,
            active,
            new SetupCurrentDocumentView(project),
            new SetupViewSidebar(project),
            null
        )

    }

    getName():VNode {
        return h('span.fa.fa-cog', '')
    }

}


