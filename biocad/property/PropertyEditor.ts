
import { View } from 'jfw/ui'
import { Graph } from 'sbolgraph';

export default abstract class PropertyEditor {
    abstract render(graph:Graph)
}
