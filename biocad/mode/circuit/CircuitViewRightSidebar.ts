
import { Sidebar, SidebarSection } from '@biocad/jfw/ui'
import Inspector from './Inspector'
import DepictionTreeView from '../../cad/DepictionTreeView';
import CircuitView from './CircuitView';

export default class CircuitViewRightSidebar extends Sidebar {

    inspector:Inspector


    debugDepictionTreeView:DepictionTreeView


    constructor(circuitView:CircuitView) {

        super(circuitView)

	let project = circuitView.project

        this.inspector = new Inspector(circuitView)

        this.debugDepictionTreeView = new DepictionTreeView(project)

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

