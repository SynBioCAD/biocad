
import LibraryView from "biocad/mode/library/LibraryView";
import { Sidebar, SidebarSection } from "@biocad/jfw/ui";
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
