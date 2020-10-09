
import { getGCPClient } from './firestore'

const SITES_COLLECTION = 'sites'

type SiteState = {
  last_aqi: number
  last_category: string
}

function is_valid(state: any): state is SiteState {
  return (state as SiteState).last_aqi !== undefined
}

export async function getState(site: string): Promise<SiteState | null> {
  const client = await getGCPClient()
  const doc = await client.getDocument(SITES_COLLECTION, site)
  if (doc === null || is_valid(doc)) {
    return doc
  } else {
    throw new Error(`Invalid saved state: ${Object.entries(doc)}`)
  }
}

export async function patchState(site: string, state: Partial<SiteState>): Promise<void> {
  const client = await getGCPClient()
  return client.patchDocument(SITES_COLLECTION, site, state)
}