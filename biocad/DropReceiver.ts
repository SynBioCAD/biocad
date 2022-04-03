
import { Vec2, Rect } from '@biocad/jfw/geom'
import Droppable from './droppable/Droppable'

interface DropReceiver {

    onDroppableMoved(offset:Vec2, droppable:Droppable):void
    receiveDroppable(offset:Vec2, droppable:Droppable):void
    getDropZone():Rect|null


}

export default DropReceiver
