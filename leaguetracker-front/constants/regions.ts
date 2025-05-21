/**
 * Constantes relacionadas con las regiones de League of Legends
 */

// Tipo para las regiones (debe coincidir con la enumeración del backend)
export type Region = 'NA' | 'EUW' | 'EUNE' | 'KR' | 'BR' | 'LAN' | 'LAS';

// Tipo para las políticas de región
export type RegionPolicy = 'AMERICAS' | 'ASIA' | 'EUROPE';

// Interfaz para la información de una región
export interface RegionInfo {
  value: Region;
  label: string;
  apiName: string;
  policy: RegionPolicy;
}

// Lista de regiones disponibles (coincide con la enumeración del backend)
export const REGIONS: RegionInfo[] = [
  { value: 'EUW', label: 'Europa Oeste (EUW)', apiName: 'euw1', policy: 'EUROPE' },
  { value: 'EUNE', label: 'Europa Norte & Este (EUNE)', apiName: 'eun1', policy: 'EUROPE' },
  { value: 'NA', label: 'Norte América (NA)', apiName: 'na1', policy: 'AMERICAS' },
  { value: 'KR', label: 'Korea (KR)', apiName: 'kr', policy: 'ASIA' },
  { value: 'BR', label: 'Brasil (BR)', apiName: 'br1', policy: 'AMERICAS' },
  { value: 'LAS', label: 'Latinoamérica Sur (LAS)', apiName: 'la2', policy: 'AMERICAS' },
  { value: 'LAN', label: 'Latinoamérica Norte (LAN)', apiName: 'la1', policy: 'AMERICAS' },
];

// Obtener información de una región por su valor
export function getRegionInfo(regionValue: string): RegionInfo | undefined {
  return REGIONS.find(region => region.value === regionValue);
}

// Obtener el nombre de una región por su valor
export function getRegionLabel(regionValue: string): string {
  const region = getRegionInfo(regionValue);
  return region ? region.label : regionValue.toUpperCase();
}

// Obtener el nombre de API de una región por su valor
export function getRegionApiName(regionValue: string): string | undefined {
  const region = getRegionInfo(regionValue);
  return region?.apiName;
}

// Obtener la política de una región por su valor
export function getRegionPolicy(regionValue: string): RegionPolicy | undefined {
  const region = getRegionInfo(regionValue);
  return region?.policy;
}

// Agrupar regiones por política
export const REGIONS_BY_POLICY = REGIONS.reduce((acc, region) => {
  if (!acc[region.policy]) {
    acc[region.policy] = [];
  }
  acc[region.policy].push(region);
  return acc;
}, {} as Record<RegionPolicy, RegionInfo[]>);
