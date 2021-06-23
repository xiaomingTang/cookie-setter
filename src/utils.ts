export function voidFunc() {
  // pass
}

/**
 * @param subDomain 例如 child.domain.com
 * @param domain 例如 domain.com
 * @returns subDomain 是否是 domain 的子域名
 */
export function isSubDomainOf(subDomain: string, domain: string) {
  const subList = subDomain.toLowerCase().split(".").filter(Boolean).reverse()
  const list = domain.toLowerCase().split(".").filter(Boolean).reverse()
  
  return subList.length > list.length
    && list.length >= 2
    && list.every((item, i) => item === subList[i])
}

export function isValidDomain(inputDomain = "") {
  const domain = inputDomain.toLowerCase()
  // 超过 50 位直接返回 false
  if (domain.length > 50) {
    return false
  }
  // 以 http:// https:// www. 开头的直接返回 false
  if (
    domain.startsWith("http://")
    || domain.startsWith("https://")
    || domain.startsWith("www.")
  ) {
    return false
  }
  return domain === "localhost"
    || domain === "0.0.0.0"
    || /^192\.168\.\d{1,3}\.\d{1,3}$/g.test(domain)
    // 最多允许三级域名
    || [2, 3].includes(domain.split(".").filter(Boolean).length)
}
