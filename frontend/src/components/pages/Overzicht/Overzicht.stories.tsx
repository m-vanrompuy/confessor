// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import OverzichtSrc from './Overzicht'
// import type { OverzichtInterface } from './Overzicht.interface'
import { OverzichtMock } from './Overzicht.mock'

/// TODO: Adapt Stories for Overzicht
const OverzichtMeta: Meta<typeof OverzichtSrc> = {
    title: "Components/pages/Overzicht",
    component: OverzichtSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof OverzichtSrc>
export const Overzicht: Story = {
    args: { ...OverzichtMock }
}

export default OverzichtMeta
