"use client"

import { useEffect, useState } from "react"

export default function TestAuth() {
  const [authData, setAuthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setAuthData(data)
        } else {
          setAuthData({ error: "Not authenticated" })
        }
      } catch (error) {
        setAuthData({ error: "Network error" })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(authData, null, 2)}</pre>
      <div className="mt-4">
        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Go to Login
        </button>
        <button onClick={() => (window.location.href = "/admin")} className="bg-green-500 text-white px-4 py-2 rounded">
          Go to Admin
        </button>
      </div>
    </div>
  )
}
