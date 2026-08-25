// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import TagManagerSrc from './TagManager'
// import type { TagManagerInterface } from './TagManager.interface'
import { TagManagerMock } from './TagManager.mock'

/// TODO: Adapt Stories for TagManager
const TagManagerMeta: Meta<typeof TagManagerSrc> = {
    title: "Components/organisms/TagManager",
    component: TagManagerSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof TagManagerSrc>
export const TagManager: Story = {
    args: { ...TagManagerMock }
}

export default TagManagerMeta
