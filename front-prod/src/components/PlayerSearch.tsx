"use client";
import React, {useState} from "react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

import type { Region } from "@/types";

export const REGIONS: Record<string, Region> = {
    NA: {name: 'NA', descriptor: 'North America', policy: 'AMERICAS', apiName: 'na1'},
    EUW: {name: 'EUW', descriptor: 'Europe West', policy: 'EUROPE', apiName: 'euw1'},
    EUNE: {name: 'EUNE', descriptor: 'Europe Nordic & East', policy: 'EUROPE', apiName: 'eun1'},
    KR: {name: 'KR', descriptor: 'Korea', policy: 'ASIA', apiName: 'kr'},
    BR: {name: 'BR', descriptor: 'Brazil', policy: 'AMERICAS', apiName: 'br1'},
    LAN: {name: 'LAN', descriptor: 'Latin America North', policy: 'AMERICAS', apiName: 'la1'},
    LAS: {name: 'LAS', descriptor: 'Latin America South', policy: 'AMERICAS', apiName: 'la2'},
};

export const PlayerSearch: React.FC = () => {
    const [region, setRegion] = useState<keyof typeof REGIONS>('EUW');
    const [username, setUsername] = useState('');
    const [tagline, setTagline] = useState('');
    const router = useRouter();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!region || !username || !tagline) return;
        router.push(`/profiles/${region}/${encodeURIComponent(username)}/${encodeURIComponent(tagline)}`);
    }

    return (
        <form onSubmit={handleSubmit} className="backdrop-blur-sm bg-white/40 rounded-2xl shadow-xl p-6 flex flex-col gap-4 w-full max-w-xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        value={region}
                        onChange={e => setRegion(e.target.value as keyof typeof REGIONS)}
                    >
                        {Object.entries(REGIONS).map(([key, reg]) => (
                            <option key={key} value={key}>{reg.descriptor}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                    <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Invocador"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>
                <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="#EUW"
                        value={tagline}
                        onChange={e => setTagline(e.target.value)}
                    />
                </div>
            </div>
            <Button type="submit" variant="primary" className="mt-2 w-full">
                Buscar jugador
            </Button>
        </form>
    );
}
