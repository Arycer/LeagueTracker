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
        <form
            onSubmit={handleSubmit}
            className="flex items-center justify-center gap-2 w-full max-w-2xl mx-auto py-[5px] px-0 bg-transparent"
        >
            <select
                className="h-9 rounded-md border px-2 text-sm bg-white text-[var(--color-primary)] border-[var(--color-primary)] placeholder-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)]"
                value={region}
                onChange={e => setRegion(e.target.value as keyof typeof REGIONS)}
                aria-label="Región"
            >
                {Object.entries(REGIONS).map(([key, reg]) => (
                    <option key={key} value={key}>{reg.descriptor}</option>
                ))}
            </select>
            <input
                type="text"
                className="h-9 rounded-md border px-2 text-sm bg-white text-[var(--color-primary)] border-[var(--color-primary)] placeholder-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] min-w-[120px]"
                placeholder="Usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                aria-label="Usuario"
            />
            <input
                type="text"
                className="h-9 rounded-md border px-2 text-sm bg-white text-[var(--color-primary)] border-[var(--color-primary)] placeholder-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] w-20"
                placeholder="#TAG"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                aria-label="Tagline"
            />
            <Button
                type="submit"
                variant="primary"
                className="h-9 px-3 py-0 text-xs font-semibold ml-2 bg-[var(--color-primary-dark)] text-white hover:bg-[var(--color-primary)] transition-colors"
                style={{ minWidth: 0 }}
            >
                Buscar
            </Button>
        </form>
    );
}
