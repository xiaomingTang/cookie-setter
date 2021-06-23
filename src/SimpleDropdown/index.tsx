import React from "react"
import {
  Dropdown, Menu, Button, ButtonProps,
} from "antd"
import { DownOutlined } from "@ant-design/icons"
import { voidFunc } from "@Src/utils"

export interface Option {
  title: string;
  value: string;
}

export interface SimpleDropdownProps extends Omit<ButtonProps, "onChange"> {
  options: Option[];
  value?: string;
  dropdownTitle?: string;
  onChange?: (newValue: string) => void;
}

export function SimpleDropdown({
  options,
  value,
  dropdownTitle,
  onChange = voidFunc,
  ...props
}: SimpleDropdownProps) {
  const menu = (<Menu
    selectedKeys={[value || ""]}
    onClick={({ key }) => {
      onChange(key)
    }}
  >
    {options.map(({ title, value }) => {
      if (!value && !title) {
        return <Menu.Divider />
      }
      return <Menu.Item key={value}>
        {title}
      </Menu.Item>
    })}
  </Menu>)

  const curOption = options
    // title 和 value 同时为空时 是分割线
    .filter((item) => (item.title || item.value))
    .find((item) => (item.value === value))

  return <Dropdown overlay={menu} trigger={["click"]}>
    <Button {...props} title={dropdownTitle}>
      {curOption?.title || dropdownTitle || "\u00A0"}
      <DownOutlined />
    </Button>
  </Dropdown>
}
