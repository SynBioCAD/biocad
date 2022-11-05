
import App from '../../BiocadApp'

import CircuitView from './CircuitView'
import CircuitViewLeftSidebar from './CircuitViewLeftSidebar'
import CircuitViewRightSidebar from './CircuitViewRightSidebar'

import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import BiocadProject from '../../BiocadProject';

export default class CircuitViewMode extends Mode {

    constructor(app:App, project:BiocadProject, active:boolean) {

        const view:CircuitView = new CircuitView(project)

        super(
            app,
	    project,
            active,
            view,
            view.leftSidebar,
            view.rightSidebar
        )


    }

    getName():VNode {
        return h('span', 'Circuit View')
    }

}


