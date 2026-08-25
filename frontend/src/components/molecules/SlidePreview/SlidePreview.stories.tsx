// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import SlidePreviewSrc from './SlidePreview'
// import type { SlidePreviewInterface } from './SlidePreview.interface'
import { SlidePreviewMock } from './SlidePreview.mock'

/// TODO: Adapt Stories for SlidePreview
const SlidePreviewMeta: Meta<typeof SlidePreviewSrc> = {
    title: "Components/molecules/SlidePreview",
    component: SlidePreviewSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof SlidePreviewSrc>
export const SlidePreview: Story = {
    args: { ...SlidePreviewMock }
}

export default SlidePreviewMeta
