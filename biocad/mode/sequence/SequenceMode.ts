
import App from '../../BiocadApp'

import SequenceView from './SequenceView'
import SequenceViewSidebar from './SequenceViewSidebar'
import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import BiocadProject from '../../BiocadProject';

export default class SequenceViewMode extends Mode {

    seqView:SequenceView

    constructor(app:App, project:BiocadProject, active:boolean) {
           
        const seqView = new SequenceView(project)

        super(
	app,
            project,
            active,
            seqView,
            seqView.sidebar,
            null
        )

        this.seqView = seqView



    }

    getName():VNode {
        return h('span', 'Sequence View')
    }
}


