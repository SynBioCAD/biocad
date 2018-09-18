
import { Sidebar, SidebarSection } from 'jfw/ui'
import Inspector from './Inspector'
import DepictionTreeView from '../../cad/DepictionTreeView';

export default class CircuitViewRightSidebar extends Sidebar {

    inspector:Inspector


    debugDepictionTreeView:DepictionTreeView


    constructor(app) {

        super(app)

        this.inspector = new Inspector(app)

        this.debugDepictionTreeView = new DepictionTreeView(app)

        let sections = [
            new SidebarSection(
                this.inspector,
                'Inspector'
            )
        ]

        /*
        sections.push(
            new SidebarSection(
                this.debugDepictionTreeView,
                'Debug: DepictionTreeView'
            )
        )*/

        this.setSections(sections)
    }
}

