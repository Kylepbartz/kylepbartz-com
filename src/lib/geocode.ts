export type GeocodeResult = {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  admin1?: string;
  country?: string;
};

/** Looks up a city by name via Open-Meteo's free geocoding API (no key
 * needed, case-insensitive server-side). Returns null when nothing matches. */
export async function geocodeCity(query: string): Promise<GeocodeResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json();
  return data.results?.[0] ?? null;
}

export function geocodeDisplayName(result: GeocodeResult): string {
  return [result.name, result.admin1 ?? result.country]
    .filter(Boolean)
    .join(", ");
}
