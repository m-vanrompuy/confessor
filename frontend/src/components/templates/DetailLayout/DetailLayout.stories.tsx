// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import DetailLayoutSrc from './DetailLayout'
// import type { DetailLayoutInterface } from './DetailLayout.interface'
import { DetailLayoutMock } from './DetailLayout.mock'

/// TODO: Adapt Stories for DetailLayout
const DetailLayoutMeta: Meta<typeof DetailLayoutSrc> = {
    title: "Components/templates/DetailLayout",
    component: DetailLayoutSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof DetailLayoutSrc>
export const DetailLayout: Story = {
    args: { ...DetailLayoutMock }
}

export default DetailLayoutMeta
