### 经验之谈

1. `updateDynamicRules` 中 `requestHeaders` 里面的 `operation` 别用 `append`, 用 `set`
    > [https://stackoverflow.com/a/67342701](https://stackoverflow.com/a/67342701)

2. manifest.json 里面 `declarative_net_request.rule_resources` 必须要有数组值, 数组内容格式类似于:
    ```
    {
      "id": "ruleset-1",
      "enabled": true,
      "path": "ruleset-1.json"
    }
    ```
    - `ruleset-1.json` 文件内必须要有内容, 可以是一个空数组; 内容格式见 [doc of declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/)
    - condition.domains 别用;
    - 违反上 2 条将导致 `updateDynamicRules` 静默失效(没有任何地方提到这一点).
