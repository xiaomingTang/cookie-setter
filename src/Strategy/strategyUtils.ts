import { Input } from "antd"
import { isSubDomainOf, isValidDomain } from "@Src/utils"

export const STRATEGY_LIST_STORAGE_AREA_NAME: chrome.storage.AreaName = "local"
export const STRATEGY_LIST_STORAGE_KEY = "STRATEGY_LIST_STORAGE_KEY"

export interface CookieStrategy {
  enabled: boolean;
  domain: string;
  sameSite: chrome.cookies.SameSiteStatus;
  /**
   * - 该策略是否精确应用于该域名
   * - 为 false 时还会应用于其子域名
   */
  exactly: boolean;
}

export async function setCookieSameSite(
  cookie: chrome.cookies.Cookie,
  sameSite: chrome.cookies.SameSiteStatus,
) {
  const isUnlimited = sameSite === "no_restriction"
  const overwrite = {
    sameSite: sameSite,
    // sameSite 无限制时, secure 必须为 true(cookies 仅通过 https 发送)
    secure: isUnlimited,
    httpOnly: isUnlimited ? false : cookie.httpOnly,
  }
  if (
    (overwrite.httpOnly === cookie.httpOnly)
    && (overwrite.sameSite === cookie.sameSite)
    && (overwrite.secure === cookie.secure)
  ) {
    return
  }
  console.log({
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    expirationDate: cookie.expirationDate,
    storeId: cookie.storeId,
    url: "https://*.codemao.cn/",
    ...overwrite,
  })
  // await chrome.cookies.set({
  //   name: cookie.name,
  //   value: cookie.value,
  //   domain: cookie.domain,
  //   expirationDate: cookie.expirationDate,
  //   storeId: cookie.storeId,
  //   url: "https://*.codemao.cn/",
  //   ...overwrite,
  // })
}

export async function setCookieByStrategy(
  cookie: chrome.cookies.Cookie,
  strategy: CookieStrategy,
) {
  if (
    strategy.enabled
    && isValidDomain(strategy.domain)
    && (
      cookie.domain === strategy.domain
      || (
        !strategy.exactly
        && isSubDomainOf(cookie.domain, strategy.domain)
      )
    )
  ) {
    await setCookieSameSite(cookie, strategy.sameSite)
  }
}

export async function setAllCookiesByStrategy(strategy: CookieStrategy) {
  if (strategy.enabled && isValidDomain(strategy.domain)) {
    const effectedCookies = await chrome.cookies.getAll({
      domain: strategy.domain,
    })
    for(let i = 0, len = effectedCookies.length; i < len; i += 1) {
      await setCookieByStrategy(effectedCookies[i], strategy)
    }
  }
}

export function autoFocus(e: Input | null) {
  if (e) {
    e.focus()
  }
}
