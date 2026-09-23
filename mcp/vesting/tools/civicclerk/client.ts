// Ported from finance-mcp-server-ts's tools/civicclerk/client.ts. The CivicClerk public API
// (Franklin TN's meeting/agenda vendor) requires no auth at all -- this is a plain fetch wrapper,
// not a per-server client like tools/mssql/connection.ts.
const baseUrl = process.env.CIVICCLERK_BASE_URL || "https://franklintn.v8.civicclerk.com"
const REQUEST_TIMEOUT_MS = 45_000

export const get = async <T>(path: string, params?: Record<string, any>, retries = 1): Promise<T> => {
  const url = buildUrl(path, params)
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if(!response.ok) {
      throw new Error(`CivicClerk API error: ${ response.status } ${ response.statusText }`)
    }
    return response.json() as Promise<T>
  } catch(error) {
    if(retries > 0) {
      return get<T>(path, params, retries - 1)
    }
    throw error
  }
}

export const downloadFile = async (path: string, params?: Record<string, any>): Promise<Buffer> => {
  const url = buildUrl(path, params)
  const response = await fetch(url)
  if(!response.ok) {
    throw new Error(`CivicClerk API error: ${ response.status } ${ response.statusText }`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

const buildUrl = (path: string, params?: Record<string, any>): string => {
  const url = new URL(path, baseUrl)
  if(params) {
    Object.entries(params).forEach(([key, value]) => {
      if(value !== null && value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  return url.toString()
}
