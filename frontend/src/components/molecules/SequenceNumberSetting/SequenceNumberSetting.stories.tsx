// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import SequenceNumberSettingSrc from './SequenceNumberSetting'
// import type { SequenceNumberSettingInterface } from './SequenceNumberSetting.interface'
import { SequenceNumberSettingMock } from './SequenceNumberSetting.mock'

/// TODO: Adapt Stories for SequenceNumberSetting
const SequenceNumberSettingMeta: Meta<typeof SequenceNumberSettingSrc> = {
    title: "Components/molecules/SequenceNumberSetting",
    component: SequenceNumberSettingSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof SequenceNumberSettingSrc>
export const SequenceNumberSetting: Story = {
    args: { ...SequenceNumberSettingMock }
}

export default SequenceNumberSettingMeta
