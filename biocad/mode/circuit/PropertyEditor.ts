
import { View } from 'jfw/ui'
import { SBOLXGraph } from 'sbolgraph';

export default abstract class PropertyEditor {
    abstract render(graph:SBOLXGraph)
}
