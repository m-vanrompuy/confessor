// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import StatusBadgeSrc from './StatusBadge'
// import type { StatusBadgeInterface } from './StatusBadge.interface'
import { StatusBadgeMock } from './StatusBadge.mock'

/// TODO: Adapt Stories for StatusBadge
const StatusBadgeMeta: Meta<typeof StatusBadgeSrc> = {
    title: "Components/atoms/StatusBadge",
    component: StatusBadgeSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof StatusBadgeSrc>
export const StatusBadge: Story = {
    args: { ...StatusBadgeMock }
}

export default StatusBadgeMeta
