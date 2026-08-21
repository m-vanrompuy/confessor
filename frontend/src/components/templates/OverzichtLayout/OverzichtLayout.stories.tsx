// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import OverzichtLayoutSrc from './OverzichtLayout'
// import type { OverzichtLayoutInterface } from './OverzichtLayout.interface'
import { OverzichtLayoutMock } from './OverzichtLayout.mock'

/// TODO: Adapt Stories for OverzichtLayout
const OverzichtLayoutMeta: Meta<typeof OverzichtLayoutSrc> = {
    title: "Components/templates/OverzichtLayout",
    component: OverzichtLayoutSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof OverzichtLayoutSrc>
export const OverzichtLayout: Story = {
    args: { ...OverzichtLayoutMock }
}

export default OverzichtLayoutMeta
