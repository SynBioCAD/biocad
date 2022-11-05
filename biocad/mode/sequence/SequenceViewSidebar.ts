
import { Sidebar, SidebarSection } from '@biocad/jfw/ui'

import ComponentBrowser from './ComponentBrowser'

import { Specifiers } from 'bioterms'
import { S3Component } from "sboljs";

import { Hook } from '@biocad/jfw/util'
import BiocadProject from '../../BiocadProject';

export default class SequenceViewSidebar extends Sidebar {

	project:BiocadProject

    onCreate: Hook<{ /*type:string,*/ uri:string }>
    onSelect: Hook<S3Component>

    browser:ComponentBrowser

    constructor(project) {

        super(project)

	this.project = project

        this.onCreate = new Hook()
        this.onSelect = new Hook()

        const connectBrowser = (browser:ComponentBrowser) => {

            browser.onSelect.listen((component:S3Component) => {
                console.log('sequenceViewSidebar: selected ' + component.displayName)
                this.onSelect.fire(component)
                project.update()
            })

            browser.onCreate.listen((uri) => {
                this.onCreate.fire({ /*type: browser.type,*/ uri })
                project.update()
            })

        }

        let browser = new ComponentBrowser(project, (cd) => true)
        this.browser = browser

        connectBrowser(browser)

        this.setSections([
            new SidebarSection(
                browser,
                'Parts'
            )
        ])



    }

    select(c:S3Component) {
        this.browser.select(c)
    }

}

