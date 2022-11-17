
import { GlobalConfig } from '@biocad/jfw/ui'
import BiocadApp from './BiocadApp'

import config from '../configs/default'
import Glyph from './glyph/Glyph'

async function main() {

    await GlobalConfig.init(config)
    await Glyph.loadGlyphs()

    const app = new BiocadApp(document.getElementsByTagName('body')[0])

    await app.init()
}

main()

