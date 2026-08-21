// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import ToolbarSrc from './Toolbar'
// import type { ToolbarInterface } from './Toolbar.interface'
import { ToolbarMock } from './Toolbar.mock'

/// TODO: Adapt Stories for Toolbar
const ToolbarMeta: Meta<typeof ToolbarSrc> = {
    title: "Components/organisms/Toolbar",
    component: ToolbarSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof ToolbarSrc>
export const Toolbar: Story = {
    args: { ...ToolbarMock }
}

export default ToolbarMeta
