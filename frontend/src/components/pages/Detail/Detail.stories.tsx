// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import DetailSrc from './Detail'
// import type { DetailInterface } from './Detail.interface'
import { DetailMock } from './Detail.mock'

/// TODO: Adapt Stories for Detail
const DetailMeta: Meta<typeof DetailSrc> = {
    title: "Components/pages/Detail",
    component: DetailSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof DetailSrc>
export const Detail: Story = {
    args: { ...DetailMock }
}

export default DetailMeta
