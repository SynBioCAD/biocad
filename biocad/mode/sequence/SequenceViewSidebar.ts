
import { Sidebar, SidebarSection } from 'jfw/ui'

import SXComponentBrowser from './ComponentBrowser'

import { Specifiers } from 'bioterms'
import { SXComponent } from "sbolgraph";

export default class SequenceViewSidebar extends Sidebar {

    _onCreate: (type:string, uri:string) => void;
    _onSelect: (component:SXComponent) => void;

    constructor(app) {

        super(app)

        this._onSelect = () => {}
        this._onCreate = () => {}

        const connectBrowser = (browser) => {

            browser.onSelect((component:SXComponent) => {
                console.log('sequenceViewSidebar: selected ' + component.displayName)
                this._onSelect(component)
                app.update()
            })

            browser.onCreate((uri) => {
                this._onCreate(browser.type, uri)
                app.update()
            })

        }

        let browser = new SXComponentBrowser(app, (cd) => true)

        connectBrowser(browser)

        this.setSections([
            new SidebarSection(
                browser,
                'Parts'
            )
        ])



    }

    onSelect(onSelect) {

        this._onSelect = onSelect

    }

    onCreate(onCreate) {

        this._onCreate = onCreate

    }
}

