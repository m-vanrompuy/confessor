// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import StatsEditorSrc from './StatsEditor'
// import type { StatsEditorInterface } from './StatsEditor.interface'
import { StatsEditorMock } from './StatsEditor.mock'

/// TODO: Adapt Stories for StatsEditor
const StatsEditorMeta: Meta<typeof StatsEditorSrc> = {
    title: "Components/molecules/StatsEditor",
    component: StatsEditorSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof StatsEditorSrc>
export const StatsEditor: Story = {
    args: { ...StatsEditorMock }
}

export default StatsEditorMeta
