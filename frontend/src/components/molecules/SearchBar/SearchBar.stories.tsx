// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import SearchBarSrc from './SearchBar'
// import type { SearchBarInterface } from './SearchBar.interface'
import { SearchBarMock } from './SearchBar.mock'

/// TODO: Adapt Stories for SearchBar
const SearchBarMeta: Meta<typeof SearchBarSrc> = {
    title: "Components/molecules/SearchBar",
    component: SearchBarSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof SearchBarSrc>
export const SearchBar: Story = {
    args: { ...SearchBarMock }
}

export default SearchBarMeta
