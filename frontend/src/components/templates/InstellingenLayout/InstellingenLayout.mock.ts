import { TagManagerMock } from '../../organisms/TagManager/TagManager.mock'
import { SequenceNumberSettingMock } from '../../molecules/SequenceNumberSetting/SequenceNumberSetting.mock'
import type { InstellingenLayoutInterface } from './InstellingenLayout.interface'

export const InstellingenLayoutMock: InstellingenLayoutInterface = {
  activeTab: 'tags',
  onTabChange: () => {},
  tagManager: TagManagerMock,
  sequenceNumberSetting: SequenceNumberSettingMock,
}
