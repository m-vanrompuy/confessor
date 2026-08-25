// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import TagAssignmentSrc from './TagAssignment'
// import type { TagAssignmentInterface } from './TagAssignment.interface'
import { TagAssignmentMock } from './TagAssignment.mock'

/// TODO: Adapt Stories for TagAssignment
const TagAssignmentMeta: Meta<typeof TagAssignmentSrc> = {
    title: "Components/molecules/TagAssignment",
    component: TagAssignmentSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof TagAssignmentSrc>
export const TagAssignment: Story = {
    args: { ...TagAssignmentMock }
}

export default TagAssignmentMeta
