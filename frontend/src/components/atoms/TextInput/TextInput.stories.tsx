// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import TextInputSrc from './TextInput'
// import type { TextInputInterface } from './TextInput.interface'
import { TextInputMock } from './TextInput.mock'

/// TODO: Adapt Stories for TextInput
const TextInputMeta: Meta<typeof TextInputSrc> = {
    title: "Components/atoms/TextInput",
    component: TextInputSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof TextInputSrc>
export const TextInput: Story = {
    args: { ...TextInputMock }
}

export default TextInputMeta
