"use client"

import { useEffect, useState, useCallback, useRef } from "react"

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const isFetched = useRef(false)

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setValue(JSON.parse(stored))
      } catch (e) {
        console.error("Error parsing localStorage key", key, e)
      }
    }
    isFetched.current = true
  }, [key])

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof newValue === "function" ? (newValue as (prev: T) => T)(prev) : newValue
      if (isFetched.current) {
        localStorage.setItem(key, JSON.stringify(resolved))
      }
      return resolved
    })
  }, [key])

  return [value, setStoredValue] as const
}
