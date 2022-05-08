

import App from '../../BiocadApp'

import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";

export default class SimulatorMode extends Mode {

    constructor(app:App, active:boolean) {

        super(
            app,
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


