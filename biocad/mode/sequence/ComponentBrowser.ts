
import  { h } from '@biocad/jfw/vdom'

import { View, TreeView } from '@biocad/jfw/ui'
import BiocadApp from "biocad/BiocadApp";
import { S3Component, Graph, sbol3 } from "sboljs";
import { TreeNode } from '@biocad/jfw/ui';

import { Hook } from '@biocad/jfw/util'
import BiocadProject from '../../BiocadProject';

export default class ComponentBrowser extends View {
	
	project:BiocadProject

    filter:(S3Component)=>boolean
    tree:TreeView

    onCreate:Hook<string> = new Hook()
    onSelect:Hook<S3Component> = new Hook()

    constructor(project, filter) {

        super(project)

	this.project = project

        this.filter = filter

        this.tree = new TreeView(project)
        this.tree.setEditable(true)

        this.tree.onSelect.listen((uri:string) => {
            this.onSelect.fire(sbol3(project.graph).uriToFacade(uri) as S3Component)
        })

        this.tree.onCreate.listen((uri:string) => {
            this.onCreate.fire(uri)
        })


        const fetchTreeNodes = async ():Promise<TreeNode[]> => {

            const graph:Graph = project.graph

            const nodes = []

            return Promise.resolve( sbol3(graph).rootComponents.filter(this.filter).map(S3ComponentToNode) )

            function S3ComponentToNode(component:S3Component):TreeNode {

                const subnodes = component.subComponents.filter((component) => {
                    return filter(component.instanceOf)
                }).map((component) => {
                    return S3ComponentToNode(component.instanceOf)
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

    select(c:S3Component) {
        this.tree.select(c.uri)
    }
}

