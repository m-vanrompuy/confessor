// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import PrivateMessageBlockSrc from './PrivateMessageBlock'
// import type { PrivateMessageBlockInterface } from './PrivateMessageBlock.interface'
import { PrivateMessageBlockMock } from './PrivateMessageBlock.mock'

/// TODO: Adapt Stories for PrivateMessageBlock
const PrivateMessageBlockMeta: Meta<typeof PrivateMessageBlockSrc> = {
    title: "Components/molecules/PrivateMessageBlock",
    component: PrivateMessageBlockSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof PrivateMessageBlockSrc>
export const PrivateMessageBlock: Story = {
    args: { ...PrivateMessageBlockMock }
}

export default PrivateMessageBlockMeta
