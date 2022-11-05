
import LoadSaveView from './LoadSaveView'
import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import { App } from "@biocad/jfw/ui";
import BiocadProject from '../../BiocadProject';

export default class LoadSaveMode extends Mode {

    constructor(app:App, project:BiocadProject, active:boolean) {

        super(
            app,
	    project,
            active,
            new LoadSaveView(project),
            null,
            null
        )

    }

    getName():VNode {
        return h('span.fa.fa-save', '')
    }

}


