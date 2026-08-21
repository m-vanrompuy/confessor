// import React from 'react'
import { type Meta, type StoryObj } from '@storybook/react'
import FilterBarSrc from './FilterBar'
// import type { FilterBarInterface } from './FilterBar.interface'
import { FilterBarMock } from './FilterBar.mock'

/// TODO: Adapt Stories for FilterBar
const FilterBarMeta: Meta<typeof FilterBarSrc> = {
    title: "Components/molecules/FilterBar",
    component: FilterBarSrc,
    argTypes: {
        testID: { table: { disable: true } }
    }
}

type Story = StoryObj<typeof FilterBarSrc>
export const FilterBar: Story = {
    args: { ...FilterBarMock }
}

export default FilterBarMeta
