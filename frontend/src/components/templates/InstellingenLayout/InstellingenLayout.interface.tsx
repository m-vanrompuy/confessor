import type { TagManagerInterface } from '../../organisms/TagManager/TagManager.interface'
import type { SequenceNumberSettingInterface } from '../../molecules/SequenceNumberSetting/SequenceNumberSetting.interface'

export type InstellingenTab = 'tags' | 'template' | 'algemeen'

export interface InstellingenLayoutInterface {
  activeTab: InstellingenTab
  onTabChange: (tab: InstellingenTab) => void
  tagManager: TagManagerInterface
  /** Algemeen-tabblad (issue #116) - enige inhoud daar tot nu toe. */
  sequenceNumberSetting: SequenceNumberSettingInterface
  testID?: string
}
