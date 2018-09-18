
import App from '../../BiocadApp'

import Mode from 'jfw/ui/Mode'
import { VNode, h } from "jfw/vdom";
import LibraryView from "biocad/mode/library/LibraryView";
import LibraryViewLeftSidebar from 'biocad/mode/library/LibraryViewLeftSidebar';

export default class LibraryMode extends Mode {

    constructor(app:App, active:boolean) {

        const libraryView:LibraryView = new LibraryView(app)

        super(
            app,
            active,
            libraryView,
            new LibraryViewLeftSidebar(app, libraryView),
            null
        )

    }

    getName():VNode {
        return h('span', 'Library')
    }

}


