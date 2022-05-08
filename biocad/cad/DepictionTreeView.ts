
import { TreeView, TreeNode } from '@biocad/jfw/ui';
import { VNode, h } from '@biocad/jfw/vdom'
import Layout from 'biocad/cad/layout/Layout';
import App from '@biocad/jfw/App'
import { Dialog } from '@biocad/jfw/ui';
import Depiction from 'biocad/cad/layout/Depiction';

export default class DepictionTreeView extends TreeView {

    layout:Layout

    constructor(app:App, dialog?:Dialog|undefined) {

        super(app, dialog)

        this.setNodeFetcher(():Promise<TreeNode[]> => {

            let nodes:TreeNode[] = []

            if(this.layout) {

                for(let depiction of this.layout.depictions) {
                    if(!depiction.parent) {
                        nodes.push(depictionToNode(this, depiction))
                    }
                }

            }

            return Promise.resolve(nodes)

        })

        function depictionToNode(tree:DepictionTreeView, depiction: Depiction) {

            let node = new TreeNode()
            node.id = depiction.uid + ''
            node.title = depiction.debugName
            node.expanded = true
            node.subnodes = []

            for (let child of depiction.children) {
                node.subnodes.push(depictionToNode(tree, child))
            }

            tree.expanded[node.id] = true

            return node

        }

    }

    setLayout(layout:Layout) {

        this.layout = layout
        this.app.update()

    }

    render():VNode {

        if(this.layout) {
            return super.render()
        } else {
            return h('div', 'no layout')
        }
    }


}

