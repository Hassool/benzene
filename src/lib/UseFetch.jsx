'use client'
import { useEffect, useState } from "react"

export function useFetchData(apiUrl, setLoading) {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!apiUrl) return
    setLoading(true)

    fetch(apiUrl)
      .then(res => res.json())
      .then(json => {
        setData(json.data ?? json)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [apiUrl, setLoading])

  return { data, error }
}
