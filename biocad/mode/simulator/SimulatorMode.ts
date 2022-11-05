

import App from '../../BiocadApp'

import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import BiocadProject from '../../BiocadProject';

export default class SimulatorMode extends Mode {

    constructor(app:App, project:BiocadProject, active:boolean) {

        super(
		app,
            project,
            active,
            null,
            null,
            null
        )

    }

    getName():VNode {
        return h('span', 'Simulator')
    }

}


