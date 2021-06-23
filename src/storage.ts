import {
  useCallback, useEffect, useState,
} from "react"
import "url-polyfill"

// export type Storable = undefined | boolean | number | string | Storable[] | {
//   [key in string]: Storable;
// }

type Storable = any

export const storage = {
  async get<T extends Storable>(areaName: chrome.storage.AreaName, key: string): Promise<T | undefined> {
    return new Promise((resolve) => {
      chrome.storage[areaName].get(key, (item) => {
        resolve(item[key])
      })
    })
  },

  async set<T extends Storable>(areaName: chrome.storage.AreaName, key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage[areaName].set({
        [key]: value,
      }, () => resolve())
    })
  }
}

export function useStorage<T extends Storable>(areaName: chrome.storage.AreaName, key: string)
  : [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] {
  const [val, _setVal] = useState<T>()

  useEffect(() => {
    storage.get<T>(areaName, key).then((stored) => {
      _setVal(stored)
    })

    const listener = (changes: Record<string, chrome.storage.StorageChange>, curAreaName: chrome.storage.AreaName) => {
      if (areaName === curAreaName && changes[key]) {
        _setVal(changes[key].newValue)
      }
    }

    chrome.storage.onChanged.addListener(listener)

    return () => {
      chrome.storage.onChanged.removeListener(listener)
    }
  }, [areaName, key])

  const setVal = useCallback((dispatch: React.SetStateAction<T | undefined>) => {
    if (dispatch instanceof Function) {
      storage.get<T>(areaName, key).then((newVal) => {
        storage.set(areaName, key, dispatch(newVal))
      })
    } else {
      storage.set(areaName, key, dispatch)
    }
  }, [areaName, key])

  return [val, setVal]
}

export function useStorageList<T extends Storable>(areaName: chrome.storage.AreaName, key: string) {
  const [list = [], setList] = useStorage<T[]>(areaName, key)

  const splice = useCallback((start: number, deleteCount: number, ...items: T[]) => {
    setList((prev = []) => {
      const newList = [...prev]
      newList.splice(start, deleteCount, ...items)
      return newList
    })
  }, [])

  return {
    list,
    setList,
    splice,
  }
}
