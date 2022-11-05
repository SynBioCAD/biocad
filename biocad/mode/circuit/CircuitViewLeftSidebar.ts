

import { Sidebar, SidebarDivision, SidebarSection } from '@biocad/jfw/ui'
import PartsListView from './PartsListView'

import palettes from 'data/palettes'
import Glyph from 'biocad/glyph/Glyph'
import BiocadProject from '../../BiocadProject'

export default class CircuitViewLeftSidebar extends Sidebar {

	project:BiocadProject

    constructor(project) {

        super(project)

	this.project = project

        let divisions:Array<SidebarDivision> = []




        for(let _division of palettes) {

            //if(!GlobalConfig.get(palette.id))
                //continue

            let division = new SidebarDivision(_division.name)

            for(let palette of _division.sections) {

                let p = (palette.members as string[]).map((member) => {

                    for(let glyph of Glyph.glyphs) {
                        if(glyph.glyphName === member) {
                            return glyph
                        }
                    }

                    throw new Error('member ' + member + ' had no match???')

                })

                division.sections.push(
                    new SidebarSection(
                        new PartsListView(project, p),
                        palette.name
                    )
                )
            }

            divisions.push(division)
        }


        /*
        if(GlobalConfig.get("biocad.palette.sbolv")) {
            sections.push(
                new SidebarSection(
                    new PartsListView(project, (part:any) => (part.typeUri === Specifiers.SBOL2.Type.DNA)),
                    'SBOL Visual'
                )
            )
        }

        if(GlobalConfig.get("biocad.palette.protlang")) {

            sections.push(
                new SidebarSection(
                    new PartsListView(project, (part:any) => (part.typeUri === Specifiers.SBOL2.Type.Protein)),
                    'Protein'
                )
            )

        }*/



        this.setDivisions(divisions)



    }
}

