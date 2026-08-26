// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import MemePreviewSrc from './MemePreview'
// import type { MemePreviewInterface } from './MemePreview.interface'
import { MemePreviewMock } from './MemePreview.mock'

/// TODO: Adapt Stories for MemePreview
const MemePreviewMeta: Meta<typeof MemePreviewSrc> = {
    title: "Components/molecules/MemePreview",
    component: MemePreviewSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof MemePreviewSrc>
export const MemePreview: Story = {
    args: { ...MemePreviewMock }
}

export default MemePreviewMeta
