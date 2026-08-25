// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import TagFormSrc from './TagForm'
// import type { TagFormInterface } from './TagForm.interface'
import { TagFormMock } from './TagForm.mock'

/// TODO: Adapt Stories for TagForm
const TagFormMeta: Meta<typeof TagFormSrc> = {
    title: "Components/molecules/TagForm",
    component: TagFormSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof TagFormSrc>
export const TagForm: Story = {
    args: { ...TagFormMock }
}

export default TagFormMeta
