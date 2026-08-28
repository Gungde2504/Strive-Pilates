import { useState, useEffect, useCallback } from "react"

const CACHE = {}

export default function useApi(url) {
  const getCache = () => {
    try {
      if (CACHE[url]) return CACHE[url]
      const cached = sessionStorage.getItem("api:" + url)
      return cached ? JSON.parse(cached) : null
    } catch { return null }
  }

  const [data, setData] = useState(getCache)
  const [loading, setLoading] = useState(!getCache())

  const fetchData = useCallback(() => {
    const token = localStorage.getItem("auth_token")
    fetch(url, {
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      }
    })
      .then(r => r.json())
      .then(d => {
        const result = d.data || d
        setData(result)
        setLoading(false)
        CACHE[url] = result
        try { sessionStorage.setItem("api:" + url, JSON.stringify(result)) } catch {}
      })
      .catch(() => setLoading(false))
  }, [url])

  useEffect(() => { fetchData() }, [fetchData])

  const invalidate = useCallback(() => {
    delete CACHE[url]
    try { sessionStorage.removeItem("api:" + url) } catch {}
    setLoading(true)
    fetchData()
  }, [url, fetchData])

  return { data, loading, refetch: invalidate }
}
