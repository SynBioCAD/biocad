
import App from '../../BiocadApp'

import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import LibraryView from "biocad/mode/library/LibraryView";
import LibraryViewLeftSidebar from 'biocad/mode/library/LibraryViewLeftSidebar';
import BiocadProject from '../../BiocadProject';

export default class LibraryMode extends Mode {

    constructor(app:App, project:BiocadProject, active:boolean) {

        const libraryView:LibraryView = new LibraryView(project)

        super(
            app,
	    project,
            active,
            libraryView,
            new LibraryViewLeftSidebar(project, libraryView),
            null
        )

    }

    getName():VNode {
        return h('span', 'Library')
    }

}


