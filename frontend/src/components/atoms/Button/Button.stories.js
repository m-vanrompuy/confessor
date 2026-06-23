import React from 'react'
import Button from './Button'
import ButtonMock from './Button.mock'

/// TODO: fix story entries
const ButtonMeta = {
    title: "atoms/Button",
    component: Button,
    argTypes: {
        testID: { table: { disable: true } },
        size: { name: "Size" },
        type: { name: "Type"}
    }
}

const testID = "Button-" + Math.floor(Math.random() * 90000) + 10000
const Template = (args) => <Button {...args} />

export const DefaultButton = Template.bind({})
DefaultButton.args = {
    testID: testID,
    ...ButtonMock
}

export default ButtonMeta