
import { getGCPClient } from './firestore'

const SITES_COLLECTION = 'sites'

type SiteState = {
  last_aqi: number
  last_category: string
}

function is_valid(maybe_state: any): maybe_state is SiteState {
  const state = maybe_state as SiteState
  return state.last_aqi !== undefined && state.last_category !== undefined
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