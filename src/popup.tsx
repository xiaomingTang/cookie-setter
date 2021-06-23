/**
 * "选项"页
 */
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import {
  Button, Input, message, Modal, Affix,
} from "antd";
import {
  ArrowDownOutlined, ArrowUpOutlined,
} from "@ant-design/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { storage, useStorageList } from "./storage";
import {
  autoFocus, CookieStrategy, STRATEGY_LIST_STORAGE_AREA_NAME, STRATEGY_LIST_STORAGE_KEY,
} from "./Strategy/strategyUtils";
import { StrategyComp } from "./Strategy";

import "./popup.less";

function App() {
  const { list: strategyList, splice: spliceStrategyList, setList: setStrategyList } =
    useStorageList<CookieStrategy>(STRATEGY_LIST_STORAGE_AREA_NAME, STRATEGY_LIST_STORAGE_KEY);

  const [inputState, setInputState] = useState(false)
  const [inputStr, setInputStr] = useState("")

  const onClickExport = useCallback(() => {
    const closeMessage = message.loading("正在准备...", 0);
    storage
      .get<CookieStrategy[]>(STRATEGY_LIST_STORAGE_AREA_NAME, STRATEGY_LIST_STORAGE_KEY)
      .then((rawList = []) => {
        const list = rawList.filter((item) => !!item.domain)
        const closeInfo = message.info(
          <>
            准备完毕,{" "}
            <CopyToClipboard text={JSON.stringify(list)} onCopy={() => {
              closeInfo()
              message.success("复制成功")
            }}>
              <Button type="primary" size="small">立即复制到剪贴板</Button>
            </CopyToClipboard>
          </>,
          0
        );
      })
      .finally(() => {
        closeMessage();
      });
  }, [])

  return (
    <div>
      <Affix>
        <div style={{
          padding: ".5em 0",
          backgroundColor: "#eeeeee",
        }}>
          <Button
            type="primary"
            style={{ margin: "0 .5em" }}
            icon={<ArrowDownOutlined />}
            onClick={() => {
              setInputState(true)
            }}
          >
            导入
          </Button>
          <Button
            style={{ margin: "0 .5em" }}
            icon={<ArrowUpOutlined />}
            onClick={onClickExport}
          >
            导出
          </Button>
          <Button
            type="primary"
            style={{ margin: "0 .5em" }}
            onClick={() => {
              spliceStrategyList(strategyList.length, 0, {
                enabled: true,
                exactly: false,
                sameSite: "no_restriction",
                domain: "",
              });
            }}
          >
            新增
          </Button>
        </div>
      </Affix>
      {strategyList.map((item, i) => (<StrategyComp
        {...item}
        onChange={(newValue) => {
          spliceStrategyList(i, 1, newValue)
        }}
        onRemove={() => {
          spliceStrategyList(i, 1)
        }}
      />))}
      <p className="paragraph">
        域名不区分大小写, 不带 www, 可附带三级域名, 格式形如:
      </p>
      <p className="paragraph">- localhost</p>
      <p className="paragraph">- 0.0.0.0</p>
      <p className="paragraph">- 192.168.x.x</p>
      <p className="paragraph">- xxx.com</p>
      <p className="paragraph">- xxx.xxx.com (.cn .org 都行)</p>
      <Modal
        visible={inputState}
        // 关闭时候销毁内部子组件, 这样里面的 input 才能 autoFocus
        destroyOnClose
        title={<>导入: <strong>将会覆盖你自己的设置</strong></>}
        okText="确定导入"
        cancelText="取消"
        onOk={() => {
          let validData = false
          try {
            const newList: CookieStrategy[] = JSON.parse(inputStr) as CookieStrategy[]
            if (newList.every((item) => (
              typeof item.enabled === "boolean"
              && typeof item.domain === "string"
              && typeof item.exactly === "boolean"
              && typeof item.sameSite === "string"
            ))) {
              setStrategyList(newList)
              validData = true
            }
          } catch (error) {
            // pass
          }
          if (validData) {
            message.success("导入成功")
            setInputState(false)
            setInputStr("")
          } else {
            message.error("导入失败, 数据格式不正确, 是不是缺头少尾？")
            setInputStr("")
          }
        }}
        onCancel={() => {
          setInputState(false)
          setInputStr("")
        }}
      >
        <Input
          placeholder="在此输入想导入的数据"
          autoFocus
          value={inputStr}
          ref={autoFocus}
          onChange={(e) => {
            setInputStr(e.target.value || "")
          }}
        />
      </Modal>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector("#app") as HTMLDivElement);
