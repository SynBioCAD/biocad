
import View from "jfw/ui/View";
import { VNode, h, create, svg } from "jfw/vdom";
import BiocadApp from "biocad/BiocadApp";

import { search, SearchResult } from 'sbh-proxy-client'

import SVGScrollerWidget from './SVGScrollerWidget'
import LibraryView from "biocad/mode/library/LibraryView";
import Sidebar, { SidebarSection } from "jfw/ui/Sidebar";
import LibraryTree from "biocad/mode/library/LibraryTree";

export default class LibraryViewLeftSidebar extends Sidebar {

    libraryView:LibraryView

    constructor(app, libraryView:LibraryView) {

        super(app)

        this.setLightMode(true)

        this.setSections([
            new SidebarSection(
                new LibraryTree(app),
                'Libraries'
            )
        ])

    }


}
