
import  { h } from 'jfw/vdom'

import { View, TreeView } from 'jfw/ui'
import BiocadApp from "biocad/BiocadApp";
import { SXComponent, SBOLXGraph } from "sbolgraph";
import { TreeNode } from 'jfw/ui/TreeView';

import { Hook } from 'jfw/util'

export default class ComponentBrowser extends View {

    filter:(SXComponent)=>boolean
    tree:TreeView

    onCreate:Hook<string>
    onSelect:Hook<string>

    constructor(app, filter) {

        super(app)

        this.filter = filter

        this.tree = new TreeView(app)
        this.tree.setEditable(true)

        this.tree.onSelect.listen((uri:string) => {
            //fn(new SXComponent(app.graph, uri))
        })

        this.tree.onCreate.listen((uri:string) => {
            this.onCreate.fire(uri)
        })


        const fetchTreeNodes = ():TreeNode[] => {

            const graph:SBOLXGraph = app.graph

            const nodes = []

            return graph.rootComponents.filter(this.filter).map(SXComponentToNode)

            function SXComponentToNode(component:SXComponent):TreeNode {

                const subnodes = component.subComponents.filter((component) => {
                    return filter(component.instanceOf)
                }).map((component) => {
                    return SXComponentToNode(component.instanceOf)
                })

                var node:TreeNode = new TreeNode()

                node.id = component.uri
                node.title = component.displayName || '???'
                node.subnodes = subnodes

                return node
            }

        }


        this.tree.setNodeFetcher(fetchTreeNodes)

    }


    render() {

        return h('div', [

            this.tree.render()

        ])
    }

    select(c:SXComponent) {
        this.tree.select(c.uri)
    }
}

