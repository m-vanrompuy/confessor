// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import ConfessionDetailsSrc from './ConfessionDetails'
// import type { ConfessionDetailsInterface } from './ConfessionDetails.interface'
import { ConfessionDetailsMock } from './ConfessionDetails.mock'

/// TODO: Adapt Stories for ConfessionDetails
const ConfessionDetailsMeta: Meta<typeof ConfessionDetailsSrc> = {
    title: "Components/organisms/ConfessionDetails",
    component: ConfessionDetailsSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof ConfessionDetailsSrc>
export const ConfessionDetails: Story = {
    args: { ...ConfessionDetailsMock }
}

export default ConfessionDetailsMeta
