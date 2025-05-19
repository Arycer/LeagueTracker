"use client"
import React, { useEffect, useState } from 'react'
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch'

export default function LolVersion() {
  const [version, setVersion] = useState(null)
  const [error, setError] = useState(null)
  const fetcher = useAuthenticatedFetch()

  useEffect(() => {
    fetcher('http://localhost:8080/api/lol/version/latest')
      .then(res => setVersion(res.version))
      .catch(err => setError(err.message))
  }, [fetcher])

  if (error) return <div>Error: {error}</div>
  if (!version) return <div>Cargando...</div>
  return <div>Última versión LOL: {version}</div>
}
