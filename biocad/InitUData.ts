
import BiocadApp from "./BiocadApp";

import { UData } from '@biocad/jfw/udata'

export default class InitUData {

    static init(app:BiocadApp):void {

        const udata:UData = app.udata


        if(!udata.get('libraries')) {

            udata.set('libraries', [
                {
                    type: 'sbhproxy',
                    name: 'sbhproxy',
                    url: 'http://localhost:9992'
                }
            ])

        }
        

    }


}