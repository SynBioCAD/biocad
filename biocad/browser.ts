
import GlobalConfig from 'jfw/GlobalConfig'
import BiocadApp from './BiocadApp'

GlobalConfig.init().then(() => {

    const app = new BiocadApp(document.getElementsByTagName('body')[0])

    app.init()

})

