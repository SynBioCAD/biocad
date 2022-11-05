
import { Dialog, DialogOptions } from '@biocad/jfw/ui';
import { h } from '@biocad/jfw/vdom'

export default class PopupMessageDialog extends Dialog {

    message:any

    constructor(project, title:string, message:any, opts:DialogOptions) {

        super(project, project.dialogs, opts)

        this.message = message
        this.setTitle(title)
    }

    getContentView() {

        return h('div', this.message.toString())

    }
}


