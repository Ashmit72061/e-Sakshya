export const GENESIS = '0'.repeat(64)
const stable = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  const object = value as Record<string, unknown>
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stable(object[key])}`).join(',')}}`
}
export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
export function shortHash(hex: string, n = 6): string { return hex.length <= n * 2 ? hex : `${hex.slice(0, n)}…${hex.slice(-4)}` }
export async function chainEventPayload(prevHash: string, payload: unknown): Promise<string> { return sha256Hex(prevHash + stable(payload)) }
