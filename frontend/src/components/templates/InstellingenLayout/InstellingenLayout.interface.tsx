import type { TagManagerInterface } from '../../organisms/TagManager/TagManager.interface'

export type InstellingenTab = 'tags' | 'template' | 'algemeen'

export interface InstellingenLayoutInterface {
  activeTab: InstellingenTab
  onTabChange: (tab: InstellingenTab) => void
  tagManager: TagManagerInterface
  testID?: string
}
