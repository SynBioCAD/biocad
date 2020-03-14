import Depiction from "./Depiction";
import Layout from "./Layout";

// Layouts get replaced but refs to depictions need to persist
// Also depictions go away and we don't want to hold references to them in that case

export default class DepictionRefByUid {

    private uid:number

    constructor(depiction:Depiction) {
        this.uid = depiction.uid
    }

    toDepiction(layout:Layout):Depiction|undefined {
        return layout.getDepictionForUid(this.uid)
    }

}
