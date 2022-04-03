
import { Sidebar, SidebarSection } from '@biocad/jfw/ui'
import Inspector from './Inspector'
import DepictionTreeView from '../../cad/DepictionTreeView';
import CircuitView from './CircuitView';

export default class CircuitViewRightSidebar extends Sidebar {

    inspector:Inspector


    debugDepictionTreeView:DepictionTreeView


    constructor(circuitView:CircuitView) {

        super(circuitView.app)

        this.inspector = new Inspector(circuitView)

        this.debugDepictionTreeView = new DepictionTreeView(this.app)

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

