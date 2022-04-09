
import { GlobalConfig } from '@biocad/jfw'
import BiocadApp from './BiocadApp'

import config from '../configs/default'

GlobalConfig.init(config).then(() => {

    const app = new BiocadApp(document.getElementsByTagName('body')[0])

    app.init()

})

