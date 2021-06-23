import { isSubDomainOf } from "./utils"
import { storage } from "./storage"
import {
  CookieStrategy, setCookieByStrategy, setCookieSameSite, STRATEGY_LIST_STORAGE_AREA_NAME, STRATEGY_LIST_STORAGE_KEY,
} from "./Strategy/strategyUtils"

/**
 * cookie 改变的原因
 */
enum OnChangedCause {
  /**
   * 垃圾清理移除掉
   */
  evicted = "evicted",
  /**
   * 超时被自动移除
   */
  expired = "expired",
  /**
   * 明确被引入或被移除
   */
  explicit = "explicit",
  /**
   * 被 "已过期的 cookie" 覆盖
   */
  expired_overwrite = "expired_overwrite",
  /**
   * 被覆盖
   */
  overwrite = "overwrite",
}

async function onCookiesChange(info: chrome.cookies.CookieChangeInfo) {
  const {
    cause, removed, cookie,
  } = info
	if (
    // 新增的时候
    !removed
    && [OnChangedCause.explicit].includes(cause as OnChangedCause)
  ) {
    const allStrategy = await storage.get<CookieStrategy[]>(STRATEGY_LIST_STORAGE_AREA_NAME, STRATEGY_LIST_STORAGE_KEY) || []
    for(let i = 0, len = allStrategy.length; i < len; i += 1) {
      await setCookieByStrategy(cookie, allStrategy[i])
    }
	}
}

chrome.cookies.onChanged.addListener((info) => {
  onCookiesChange(info)
})
