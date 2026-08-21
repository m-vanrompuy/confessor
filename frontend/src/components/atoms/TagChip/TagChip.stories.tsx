// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import TagChipSrc from './TagChip'
// import type { TagChipInterface } from './TagChip.interface'
import { TagChipMock } from './TagChip.mock'

/// TODO: Adapt Stories for TagChip
const TagChipMeta: Meta<typeof TagChipSrc> = {
    title: "Components/atoms/TagChip",
    component: TagChipSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof TagChipSrc>
export const TagChip: Story = {
    args: { ...TagChipMock }
}

export default TagChipMeta
