
export type Region = 'NA' | 'EUW' | 'EUNE' | 'KR' | 'BR' | 'LAN' | 'LAS';


export type RegionPolicy = 'AMERICAS' | 'ASIA' | 'EUROPE';


export interface RegionInfo {
  value: Region;
  label: string;
  apiName: string;
  policy: RegionPolicy;
}


export const REGIONS: RegionInfo[] = [
  {value: 'EUW', label: 'Europa Oeste (EUW)', apiName: 'euw1', policy: 'EUROPE'},
  {value: 'EUNE', label: 'Europa Norte & Este (EUNE)', apiName: 'eun1', policy: 'EUROPE'},
  {value: 'NA', label: 'Norte América (NA)', apiName: 'na1', policy: 'AMERICAS'},
  {value: 'KR', label: 'Korea (KR)', apiName: 'kr', policy: 'ASIA'},
  {value: 'BR', label: 'Brasil (BR)', apiName: 'br1', policy: 'AMERICAS'},
  {value: 'LAS', label: 'Latinoamérica Sur (LAS)', apiName: 'la2', policy: 'AMERICAS'},
  {value: 'LAN', label: 'Latinoamérica Norte (LAN)', apiName: 'la1', policy: 'AMERICAS'},
];


export function getRegionInfo(regionValue: string): RegionInfo | undefined {
  return REGIONS.find(region => region.value === regionValue);
}


export function getRegionLabel(regionValue: string): string {
  const region = getRegionInfo(regionValue);
  return region ? region.label : regionValue.toUpperCase();
}


export function getRegionApiName(regionValue: string): string | undefined {
  const region = getRegionInfo(regionValue);
  return region?.apiName;
}


export function getRegionPolicy(regionValue: string): RegionPolicy | undefined {
  const region = getRegionInfo(regionValue);
  return region?.policy;
}


export const REGIONS_BY_POLICY = REGIONS.reduce((acc, region) => {
  if (!acc[region.policy]) {
    acc[region.policy] = [];
  }
  acc[region.policy].push(region);
  return acc;
}, {} as Record<RegionPolicy, RegionInfo[]>);
