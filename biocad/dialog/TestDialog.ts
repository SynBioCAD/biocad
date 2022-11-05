
import { Dialog } from '@biocad/jfw/ui';
import { h } from '@biocad/jfw/vdom'

export default class TestDialog extends Dialog {

    constructor(project, opts) {

        super(project, project.dialogs, opts)

    }

    getContentView() {

        return h('div', 'test dialog')

    }
}


