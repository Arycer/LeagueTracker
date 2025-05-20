import { useCallback, useState, useEffect } from "react";

export interface RecentProfile {
  region: string;
  name: string;
  tagline: string;
}

const STORAGE_KEY = "recent_profiles";

export function getRecentProfiles(): RecentProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveRecentProfile(profile: RecentProfile) {
  if (typeof window === "undefined") return;
  const normalized: RecentProfile = {
    region: profile.region,
    name: decodeURIComponent(profile.name),
    tagline: decodeURIComponent(profile.tagline),
  };
  let list = getRecentProfiles();
  list = list.filter(
    (p) =>
      !(
        p.region === normalized.region &&
        p.name.toLowerCase() === normalized.name.toLowerCase() &&
        p.tagline.toLowerCase() === normalized.tagline.toLowerCase()
      )
  );
  list.unshift(normalized);
  if (list.length > 10) list = list.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}


export function useRecentProfilesList(): RecentProfile[] {
  const [recent, setRecent] = (typeof window === 'undefined')
    ? [[], () => {}]
    : useState<RecentProfile[]>(getRecentProfiles());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setRecent(getRecentProfiles());
    window.addEventListener('storage', update);
    window.addEventListener('recent-profiles-update', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('recent-profiles-update', update);
    };
  }, []);

  return recent;
}

// Para actualizar manualmente desde otras partes
export function triggerRecentProfilesUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('recent-profiles-update'));
  }
}

export function clearRecentProfiles() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    triggerRecentProfilesUpdate();
  }
}
