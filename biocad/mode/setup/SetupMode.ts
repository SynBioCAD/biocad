
import App from '../../BiocadApp'

import SetupCurrentDocumentView from './SetupCurrentDocumentView'
import SetupViewSidebar from './SetupViewSidebar'
import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";

export default class SetupViewMode extends Mode {

    constructor(app:App, active:boolean) {

        super(
            app,
            active,
            new SetupCurrentDocumentView(app),
            new SetupViewSidebar(app),
            null
        )

    }

    getName():VNode {
        return h('span.fa.fa-cog', '')
    }

}


