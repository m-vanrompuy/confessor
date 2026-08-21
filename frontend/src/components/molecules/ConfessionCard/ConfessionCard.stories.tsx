// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import ConfessionCardSrc from './ConfessionCard'
// import type { ConfessionCardInterface } from './ConfessionCard.interface'
import { ConfessionCardMock } from './ConfessionCard.mock'

/// TODO: Adapt Stories for ConfessionCard
const ConfessionCardMeta: Meta<typeof ConfessionCardSrc> = {
    title: "Components/molecules/ConfessionCard",
    component: ConfessionCardSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof ConfessionCardSrc>
export const ConfessionCard: Story = {
    args: { ...ConfessionCardMock }
}

export default ConfessionCardMeta
