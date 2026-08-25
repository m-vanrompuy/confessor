// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import InstellingenSrc from './Instellingen'
// import type { InstellingenInterface } from './Instellingen.interface'
import { InstellingenMock } from './Instellingen.mock'

/// TODO: Adapt Stories for Instellingen
const InstellingenMeta: Meta<typeof InstellingenSrc> = {
    title: "Components/pages/Instellingen",
    component: InstellingenSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof InstellingenSrc>
export const Instellingen: Story = {
    args: { ...InstellingenMock }
}

export default InstellingenMeta
