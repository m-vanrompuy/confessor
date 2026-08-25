// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import ConfessionActionsSrc from './ConfessionActions'
// import type { ConfessionActionsInterface } from './ConfessionActions.interface'
import { ConfessionActionsMock } from './ConfessionActions.mock'

/// TODO: Adapt Stories for ConfessionActions
const ConfessionActionsMeta: Meta<typeof ConfessionActionsSrc> = {
    title: "Components/organisms/ConfessionActions",
    component: ConfessionActionsSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof ConfessionActionsSrc>
export const ConfessionActions: Story = {
    args: { ...ConfessionActionsMock }
}

export default ConfessionActionsMeta
