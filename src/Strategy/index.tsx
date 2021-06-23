import React, { useCallback, useEffect } from "react"
import {
  Button, Input, Switch, Popconfirm,
} from "antd";
import {
  CloseOutlined,
} from "@ant-design/icons";
import { isValidDomain, voidFunc } from "@Src/utils"
import { SimpleDropdown } from "@Src/SimpleDropdown";
import { autoFocus, CookieStrategy, setAllCookiesByStrategy, setCookieByStrategy, setCookieSameSite } from "./strategyUtils";

import Styles from "./index.module.less"

interface StrategyCompProps extends CookieStrategy {
  onChange?: (strategy: CookieStrategy) => void;
  onRemove?: () => void;
}

const sameSiteList: {
  title: string;
  value: chrome.cookies.SameSiteStatus;
}[] = [
  { value: "no_restriction", title: "不限制" },
  { value: "lax", title: "宽松" },
  { value: "strict", title: "严格" },
  { value: "unspecified", title: "不指定" },
]

export function StrategyComp({
  onChange = voidFunc,
  onRemove = voidFunc,
  ...props
}: StrategyCompProps) {
  const {
    enabled, domain, sameSite, exactly,
  } = props

  useEffect(() => {
    if (props) {
      setAllCookiesByStrategy(props)
    }
  }, [props])

  return <div className={Styles.wrapper}>
  <Switch
    checked={enabled}
    onChange={(checked) => {
      onChange({
        ...props,
        enabled: checked,
      })
    }}
  />
  <Input
    ref={autoFocus}
    style={{
      width: "14em",
      color: isValidDomain(domain) ? "inherit" : "red",
    }}
    placeholder="xxx.com 或 aaa.bbb.com"
    value={domain}
    onChange={(e) => {
      onChange({
        ...props,
        domain: (e.target.value || "").trim().toLowerCase(),
      });
    }}
  />
  <SimpleDropdown
    style={{ width: "6em" }}
    dropdownTitle="同源策略"
    options={sameSiteList}
    value={sameSite}
    onChange={(newValue) => {
      onChange({
        ...props,
        sameSite: newValue as chrome.cookies.SameSiteStatus,
      })
    }}
  />
  <SimpleDropdown
    style={{ width: "10em" }}
    options={[
      { title: "应用于子域名", value: "not-exactly" },
      { title: "精准匹配", value: "exactly" }
    ]}
    value={exactly ? "exactly" : "not-exactly"}
    onChange={(newValue) => {
      onChange({
        ...props,
        exactly: newValue === "exactly",
      });
    }}
  />
  <Popconfirm
    title="确认删除？"
    trigger={["click"]}
    cancelText="取消"
    okText="删除"
    onConfirm={onRemove}
  >
    <Button
      danger
      icon={<CloseOutlined />}
    />
  </Popconfirm>
  </div>
}
