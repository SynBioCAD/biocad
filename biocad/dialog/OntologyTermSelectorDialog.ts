
import { Dialog, DialogOptions } from '@biocad/jfw/ui';
import OntologyTreeView from 'biocad/view/OntologyTreeView'
import { App } from '@biocad/jfw/ui'
import { h } from '@biocad/jfw/vdom'
import BiocadProject from '../BiocadProject';

export default class OntologyTermSelectorDialog extends Dialog {

    treeView:OntologyTreeView

    constructor(project:BiocadProject, opts:DialogOptions, ontology:any, rootTermID:string|null) {

        super(project, project.dialogs, opts)

        this.treeView = new OntologyTreeView(project, this, ontology, rootTermID)
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


    static async selectTerm(project:BiocadProject, dialogTitle:string, dialogParent:Dialog|null, ontology:any, rootTermID:string|null):Promise<string|null> {

        let dialogOpts = new DialogOptions()
        dialogOpts.parent = dialogParent
        dialogOpts.modal = true

        let dialog = new OntologyTermSelectorDialog(project, dialogOpts, ontology, rootTermID)
        dialog.setTitle(dialogTitle)

        project.dialogs.openDialog(dialog)

        return new Promise<string|null>((resolve, reject) => {
            let selected = false
            dialog.treeView.onSelect.listen((id) => {
                selected = true
                project.dialogs.closeDialog(dialog)
                resolve(id)
            })
            dialog.onClose.listen(() => {
                if(!selected)
                    resolve(null)
            })
        })
    }


}


