
import { TreeView, TreeNode } from '@biocad/jfw/ui';
import { Dialog } from '@biocad/jfw/ui';
import { App } from '@biocad/jfw/ui'

export default class OntologyTreeView extends TreeView {

    constructor(project:BiocadProject, dialog:Dialog|undefined, ontology:any, rootTermID:string|null) {

        super(project, dialog)

        this.setNodeFetcher(fetchNodes)

        // TODO make fetchNodes only fetch subnodes on demand so don't have
        // to create TreeNodes for the entire ontology.
        //
        function fetchNodes():Array<TreeNode> {

            if(rootTermID) {
                return mapNodes(ontology[rootTermID].children)
            } else {
                throw new Error('cant do that yet')
            }

            function mapNodes(nodeIDs:string[]):TreeNode[] {
                return nodeIDs.map((id) => {
                    let term = ontology[id]
                    let node = new TreeNode()
                    node.id = id
                    node.title = term.name
                    node.subnodes = term.children ? mapNodes(term.children) : []
                    return node
                })
            }


        }
    }

}

