import type { ToolbarInterface } from '../../organisms/Toolbar/Toolbar.interface'
import type { ConfessionListInterface } from '../../organisms/ConfessionList/ConfessionList.interface'

export interface OverzichtLayoutInterface {
  toolbar: ToolbarInterface
  list: ConfessionListInterface
  testID?: string
}
