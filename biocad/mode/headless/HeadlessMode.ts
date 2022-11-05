

import App from '../../BiocadApp'

import HeadlessView from './HeadlessView'

import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import BiocadProject from '../../BiocadProject';

export default class HeadlessMode extends Mode {

    constructor(app:App, project:BiocadProject, active:boolean) {

        const view:HeadlessView = new HeadlessView(project)

        super(
            app,
	    project,
            active,
            view,
            null,
            null
        )

    }

    getName():VNode {
        return h('span', 'Headless Mode')
    }

}


