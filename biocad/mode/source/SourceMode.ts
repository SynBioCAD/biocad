
import App from '../../BiocadApp'

import SourceView from './SourceView'

import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import BiocadProject from '../../BiocadProject';

export default class SequenceViewMode extends Mode {

    constructor(app:App, project:BiocadProject, active:boolean) {

        super(
            app,
	    project,
            active,
            new SourceView(project),
            null,
            null
        )

    }

    getName():VNode {
        return h('span.fa.fa-file-code', '')
    }

}


