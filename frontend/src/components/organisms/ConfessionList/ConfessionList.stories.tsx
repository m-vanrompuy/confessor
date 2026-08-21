// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import ConfessionListSrc from './ConfessionList'
// import type { ConfessionListInterface } from './ConfessionList.interface'
import { ConfessionListMock } from './ConfessionList.mock'

/// TODO: Adapt Stories for ConfessionList
const ConfessionListMeta: Meta<typeof ConfessionListSrc> = {
    title: "Components/organisms/ConfessionList",
    component: ConfessionListSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof ConfessionListSrc>
export const ConfessionList: Story = {
    args: { ...ConfessionListMock }
}

export default ConfessionListMeta
