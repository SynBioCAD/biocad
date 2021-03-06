
import App from '../../BiocadApp'

import SequenceView from './SequenceView'
import SequenceViewSidebar from './SequenceViewSidebar'
import Mode from 'jfw/ui/Mode'
import { VNode, h } from "jfw/vdom";

export default class SequenceViewMode extends Mode {

    seqView:SequenceView

    constructor(app:App, active:boolean) {
           
        const seqView = new SequenceView(app)

        super(
            app,
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


