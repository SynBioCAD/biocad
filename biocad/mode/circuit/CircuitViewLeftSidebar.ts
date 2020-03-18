

import { Sidebar, SidebarDivision, SidebarSection } from 'jfw/ui'
import PartsListView from './PartsListView'

import palettes from 'data/palettes'
import Glyph from 'biocad/glyph/Glyph'

export default class CircuitViewLeftSidebar extends Sidebar {

    constructor(app) {

        super(app)

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
                        new PartsListView(app, p),
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
                    new PartsListView(app, (part:any) => (part.typeUri === Specifiers.SBOL2.Type.DNA)),
                    'SBOL Visual'
                )
            )
        }

        if(GlobalConfig.get("biocad.palette.protlang")) {

            sections.push(
                new SidebarSection(
                    new PartsListView(app, (part:any) => (part.typeUri === Specifiers.SBOL2.Type.Protein)),
                    'Protein'
                )
            )

        }*/



        this.setDivisions(divisions)



    }
}

