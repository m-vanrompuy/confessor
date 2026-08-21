// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import SelectSrc from './Select'
// import type { SelectInterface } from './Select.interface'
import { SelectMock } from './Select.mock'

/// TODO: Adapt Stories for Select
const SelectMeta: Meta<typeof SelectSrc> = {
    title: "Components/atoms/Select",
    component: SelectSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof SelectSrc>
export const Select: Story = {
    args: { ...SelectMock }
}

export default SelectMeta
