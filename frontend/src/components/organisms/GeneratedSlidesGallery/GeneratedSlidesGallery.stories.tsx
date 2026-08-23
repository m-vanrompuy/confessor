// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import GeneratedSlidesGallerySrc from './GeneratedSlidesGallery'
// import type { GeneratedSlidesGalleryInterface } from './GeneratedSlidesGallery.interface'
import { GeneratedSlidesGalleryMock } from './GeneratedSlidesGallery.mock'

/// TODO: Adapt Stories for GeneratedSlidesGallery
const GeneratedSlidesGalleryMeta: Meta<typeof GeneratedSlidesGallerySrc> = {
    title: "Components/organisms/GeneratedSlidesGallery",
    component: GeneratedSlidesGallerySrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof GeneratedSlidesGallerySrc>
export const GeneratedSlidesGallery: Story = {
    args: { ...GeneratedSlidesGalleryMock }
}

export default GeneratedSlidesGalleryMeta
