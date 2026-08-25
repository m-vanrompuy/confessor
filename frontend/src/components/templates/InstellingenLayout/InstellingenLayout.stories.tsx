// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import InstellingenLayoutSrc from './InstellingenLayout'
// import type { InstellingenLayoutInterface } from './InstellingenLayout.interface'
import { InstellingenLayoutMock } from './InstellingenLayout.mock'

/// TODO: Adapt Stories for InstellingenLayout
const InstellingenLayoutMeta: Meta<typeof InstellingenLayoutSrc> = {
    title: "Components/templates/InstellingenLayout",
    component: InstellingenLayoutSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof InstellingenLayoutSrc>
export const InstellingenLayout: Story = {
    args: { ...InstellingenLayoutMock }
}

export default InstellingenLayoutMeta
