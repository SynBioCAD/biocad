
import DetailPreset from './DetailPreset'
import DetailPreset1 from './DetailPreset1'
import DetailPreset2 from './DetailPreset2'
import DetailPreset5 from './DetailPreset5'

export default function levelToPreset(level:number):DetailPreset {

    if(level === 0) {

        return new DetailPreset1()

    } else if(level === 1) {

        return new DetailPreset2()

    } else if(level === 2) {

        return new DetailPreset5()

    } else {

        return new DetailPreset5()

    }


}


