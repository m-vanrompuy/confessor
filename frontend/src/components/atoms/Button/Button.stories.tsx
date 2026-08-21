// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import ButtonSrc from './Button'
// import type { ButtonInterface } from './Button.interface'
import { ButtonMock } from './Button.mock'

/// TODO: Adapt Stories for Button
const ButtonMeta: Meta<typeof ButtonSrc> = {
    title: "Components/atoms/Button",
    component: ButtonSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof ButtonSrc>
export const Button: Story = {
    args: { ...ButtonMock }
}

export default ButtonMeta
