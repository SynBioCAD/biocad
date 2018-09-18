
import { Sidebar, ListMenu } from 'jfw/ui'
import { SidebarSection } from 'jfw/ui/Sidebar'

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

