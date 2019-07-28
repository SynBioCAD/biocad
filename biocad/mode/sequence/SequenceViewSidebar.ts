
import { Sidebar, SidebarSection } from 'jfw/ui'

import ComponentBrowser from './ComponentBrowser'

import { Specifiers } from 'bioterms'
import { SXComponent } from "sbolgraph";

import { Hook } from 'jfw/util'

export default class SequenceViewSidebar extends Sidebar {

    onCreate: Hook<{ type:string, uri:string }>
    onSelect: Hook<SXComponent>

    browser:ComponentBrowser

    constructor(app) {

        super(app)

        this.onCreate = new Hook()
        this.onSelect = new Hook()

        const connectBrowser = (browser:ComponentBrowser) => {

            browser.onSelect.listen((component:SXComponent) => {
                console.log('sequenceViewSidebar: selected ' + component.displayName)
                this.onSelect.fire(component)
                app.update()
            })

            browser.onCreate.listen((uri) => {
                //this.onCreate.fire({ type: browser.type, uri })
                app.update()
            })

        }

        let browser = new ComponentBrowser(app, (cd) => true)
        this.browser = browser

        connectBrowser(browser)

        this.setSections([
            new SidebarSection(
                browser,
                'Parts'
            )
        ])



    }

    select(c:SXComponent) {
        this.browser.select(c)
    }

}

