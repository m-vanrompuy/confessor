// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import ColorInputSrc from './ColorInput'
// import type { ColorInputInterface } from './ColorInput.interface'
import { ColorInputMock } from './ColorInput.mock'

/// TODO: Adapt Stories for ColorInput
const ColorInputMeta: Meta<typeof ColorInputSrc> = {
    title: "Components/atoms/ColorInput",
    component: ColorInputSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof ColorInputSrc>
export const ColorInput: Story = {
    args: { ...ColorInputMock }
}

export default ColorInputMeta
