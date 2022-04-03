
import { Dialog } from '@biocad/jfw/ui/dialog'
import { h } from '@biocad/jfw/vdom'

export default class TestDialog extends Dialog {

    constructor(app, parent) {

        super(app, parent)

    }

    getContentView() {

        return h('div', 'test dialog')

    }
}


