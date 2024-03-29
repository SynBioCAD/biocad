import { Graph, sbol3 } from "sboljs";

import { Vec2, Matrix } from '@biocad/jfw/geom'
import { View } from '@biocad/jfw/ui'
import { h, svg, VNode} from '@biocad/jfw/vdom'
import { click as clickEvent, contextMenu as contextMenuEvent } from '@biocad/jfw/event'

import { App } from "@biocad/jfw/ui";
import BiocadApp from "biocad/BiocadApp";

import SBOLDroppable from "biocad/droppable/SBOLDroppable";
import BrowseSBHDialog, { BrowseSBHDialogOptions } from "biocad/dialog/BrowseSBHDialog";
import { SearchQuery } from "../../Repository"

import { FinalizeEvent } from 'biocad/DropOverlay'
import { S3Component } from "sboljs";
import Glyph from "biocad/glyph/Glyph";
import colors from '../../../data/colors'
import { Prefixes, Specifiers } from "bioterms";
import BiocadProject from "../../BiocadProject";

export default class PartsListView extends View {

    project:BiocadProject

    parts:Glyph[]

    constructor(project:BiocadProject, parts:Glyph[]) {

        super(project)

	this.project = project
        this.parts = parts

    }

    render():VNode {

        var project:BiocadProject = this.project

        function renderPartEntry(glyph:Glyph) {

            /*
            var glyphInfoBW = {
                type: part.shortName,
                color: 'white',
                stroke: 'none',
                size: boxSize,
                thickness: 2,
                autoApplyScale: true
            }*/

	    const baseSize = 30

	    let suggestedDefaultAspect = glyph.getSuggestedDefaultAspect()
	    let hasFixedAspect = glyph.hasFixedAspect()

	    if(hasFixedAspect) {
		    var width = baseSize
		    var height = glyph.getFixedAspectHeight({ width })
	    } else {
		if(suggestedDefaultAspect < 1) {
			var width = baseSize
			var height = width * suggestedDefaultAspect
		} else {
			var height = baseSize
			var width = height / suggestedDefaultAspect
		}
		}


            var renderOpts = {
		color: colors[glyph.glyphName] || 'white',
		lineColor: 'white',
		backgroundFill: 'none',
                thickness: 2,
		width,
		height,
		params: {}
            }


	    let ascent = glyph.getAscent(renderOpts)

	//     if(glyph.glyphName === 'DNACleavageSite') {
	//     console.log(glyph.glyphName, 'suggestedDefaultAspect ' + suggestedDefaultAspect + ', hasFixedAspect ' + hasFixedAspect + ', ascent ' + ascent)
	//     }


            //var glyphSvgBW = visbolite.render(glyphInfoBW)
            var glyphSvgColor = Glyph.render(glyph.glyphName, renderOpts)


            return h('div.sf-plv-entry', {
                'ev-mousedown': clickEvent(mousedownPart, { project: project, part: glyph }),
                'ev-contextmenu': contextMenuEvent(clickSearch, { project: project, part: glyph })
            }, [
                /*svg('svg', {
                    'class': 'sf-plv-bw',
                    'viewBox': [
                        0,
                        0,
                        boxSize.x,
                        boxSize.y
                    ].join(' ')
                }, [
                    glyphSvgBW
                ]),*/
		h('div.glyph', [
			svg('svg', {
			'class': 'sf-plv-color',

			width,
			height,

			'viewBox': [
				0,
				0,
				width,
				height
			].join(' ')
			}, [
			glyphSvgColor
			])
		]),

                h('div.sf-plv-entry-label', [
                    glyph.glyphName,

                    h('span.fa.fa-search.sf-part-search-button', {
                        'ev-mousedown': clickEvent(clickSearch, { project: project, part: glyph })
                    }, [
                    ])
                ])
            ])
        }

        return renderSection(project, [

            h('div.sf-plv', this.parts.map(renderPartEntry))

        ])

        function renderSection(project, children) {

            return h('div.jfw-sidebar-section', {

            }, children)

        }
    }


}


function mousedownPart(data:any) {

    console.log('foomd')

    const project:BiocadProject = data.project
    let app:BiocadApp = project.app as BiocadApp

    const part = data.part

    const graph:Graph = new Graph([])

    let component = sbol3(graph).createComponent(project.defaultPrefix, part.glyphName)

    for(let soTerm of part.soTerms) {
	component.addRole(Prefixes.sequenceOntologyIdentifiersOrg + soTerm)
    }

//     component.addType(part.typeUri)
    component.addType(Specifiers.SBOL3.Type.DNA)

    //console.log('uri is ' + uri)

    const droppable:SBOLDroppable = new SBOLDroppable(project, graph, [ component.uri ])
    app.dropOverlay.setFinalizeEvent(FinalizeEvent.MouseUp)
    app.dropOverlay.startDropping(droppable)

}

function clickSearch(data:any) {

    const project:BiocadProject = data.project
    const part = data.part


    const browseDialogOpts:BrowseSBHDialogOptions = new BrowseSBHDialogOptions()

    browseDialogOpts.query = new SearchQuery()

    for(let term of part.soTerms)
	browseDialogOpts.query.addRole(Prefixes.sequenceOntologyIdentifiersOrg + term)

    
    const browseDialog:BrowseSBHDialog = new BrowseSBHDialog(project, browseDialogOpts)

    browseDialog.onUsePart = (part:S3Component) => {
	    project.dropOverlay.startDropping(new SBOLDroppable(project, part.graph, [ part.subject.value ]))
    }

    project.dialogs.openDialog(browseDialog)


}

