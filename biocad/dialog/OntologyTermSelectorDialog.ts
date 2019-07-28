
import { Dialog, DialogOptions } from 'jfw/ui/dialog'
import OntologyTreeView from 'biocad/view/OntologyTreeView'
import { App } from 'jfw'
import { h } from 'jfw/vdom'

export default class OntologyTermSelectorDialog extends Dialog {

    treeView:OntologyTreeView

    constructor(app:App, opts:DialogOptions, ontology:any, rootTermID:string|null) {

        super(app, opts)

        this.treeView = new OntologyTreeView(app, this, ontology, rootTermID)
        this.treeView.setSearchable(true)
    }

    getContentView() {
        return h('div', {
            style: {
                'overflow-x': 'hidden',
                'overflow-y': 'visible',
                'max-height': '500px'
            }
        }, [
            this.treeView.render()
        ])
    }


    static async selectTerm(app:App, dialogTitle:string, dialogParent:Dialog|null, ontology:any, rootTermID:string|null):Promise<string|null> {

        let dialogOpts = new DialogOptions()
        dialogOpts.parent = dialogParent
        dialogOpts.modal = true

        let dialog = new OntologyTermSelectorDialog(app, dialogOpts, ontology, rootTermID)
        dialog.setTitle(dialogTitle)

        app.openDialog(dialog)

        return new Promise<string|null>((resolve, reject) => {
            let selected = false
            dialog.treeView.onSelect.listen((id) => {
                selected = true
                app.closeDialog(dialog)
                resolve(id)
            })
            dialog.onClose.listen(() => {
                if(!selected)
                    resolve(null)
            })
        })
    }


}


