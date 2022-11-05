
import LibraryView from "biocad/mode/library/LibraryView";
import { Sidebar, SidebarSection } from "@biocad/jfw/ui";
import LibraryTree from "biocad/mode/library/LibraryTree";
import BiocadProject from "../../BiocadProject";

export default class LibraryViewLeftSidebar extends Sidebar {

	project:BiocadProject

    libraryView:LibraryView

    constructor(project, libraryView:LibraryView) {

        super(project)

	this.project = project

        this.setLightMode(true)

        this.setSections([
            new SidebarSection(
                new LibraryTree(project),
                'Libraries'
            )
        ])

    }


}
