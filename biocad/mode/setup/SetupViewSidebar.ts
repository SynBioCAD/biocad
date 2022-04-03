
import { Sidebar, ListMenu } from '@biocad/jfw/ui'
import { SidebarSection } from '@biocad/jfw/ui/Sidebar'

export default class SetupViewSidebar extends Sidebar {

    curDocSetup: ListMenu
    globalSetup: ListMenu

    constructor(app) {

        super(app)

        this.curDocSetup = new ListMenu(app)
        this.globalSetup = new ListMenu(app)


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

