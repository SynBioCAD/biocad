
import { Sidebar, ListMenu } from '@biocad/jfw/ui'
import { SidebarSection } from '@biocad/jfw/ui';
import BiocadProject from '../../BiocadProject';

export default class SetupViewSidebar extends Sidebar {

	project:BiocadProject

    curDocSetup: ListMenu
    globalSetup: ListMenu

    constructor(project) {

        super(project)

	this.project = project

        this.curDocSetup = new ListMenu(project)
        this.globalSetup = new ListMenu(project)


        this.curDocSetup.setItems([
            {
                title: 'Metadata'
            }
        ])




        this.setSections([
            new SidebarSection(this.curDocSetup, 'Current Document'),
            new SidebarSection(this.globalSetup, 'Global Settings')
        ])
    }

}

