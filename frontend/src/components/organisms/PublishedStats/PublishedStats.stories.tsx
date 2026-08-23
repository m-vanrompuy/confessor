// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import PublishedStatsSrc from './PublishedStats'
// import type { PublishedStatsInterface } from './PublishedStats.interface'
import { PublishedStatsMock } from './PublishedStats.mock'

/// TODO: Adapt Stories for PublishedStats
const PublishedStatsMeta: Meta<typeof PublishedStatsSrc> = {
    title: "Components/organisms/PublishedStats",
    component: PublishedStatsSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof PublishedStatsSrc>
export const PublishedStats: Story = {
    args: { ...PublishedStatsMock }
}

export default PublishedStatsMeta
