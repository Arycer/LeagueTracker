"use client"
import React from 'react'
import {useLolVersion} from '../context/LolVersionContext'

export default function LolVersion() {
    const {version: gameVersion, loading: loadingVersion} = useLolVersion();

    if (loadingVersion) return <div>Cargando...</div>
    return <div>Última versión LOL: {gameVersion}</div>
}
