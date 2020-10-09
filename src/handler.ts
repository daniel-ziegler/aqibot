import { getAqi } from './purpleAirSource'
import { getState, patchState } from './dataStorage'

declare const SLACK_POST_URL: string

// TODO use environment variables for all these
const SITE = 'burrow'
const THRESHOLD_LO = 40
const THRESHOLD_HI = 50

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname == "/trigger") {
    try {
      await handleScheduled(null)
    } catch (ex) {
      return new Response(ex.stack, { status: 500 })
    }
    return new Response(`Success`)
  }
  const data = await getState(SITE)
  const lastAqi = data && data.last_aqi
  return new Response(`Last AQI: ${lastAqi}`)
}

export async function handleScheduled(event: any /* ScheduledEvent */): Promise<void> {
  const aqi = await getAqi()
  const data = await getState(SITE)
  const lastCategory = data && data.last_category
  let newCategory = undefined  // won't update if undefined
  if ((lastCategory === null || lastCategory === "bad") && aqi <= THRESHOLD_LO) {
    newCategory = "good"
    await postToSlack(`🟩️ Open your windows! AQI ${aqi}`)
  } else if ((lastCategory === null || lastCategory === "good") && aqi >= THRESHOLD_HI) {
    newCategory = "bad"
    await postToSlack(`🟧 Close your windows! AQI ${aqi}`)
  }
  await patchState(SITE, { last_aqi: aqi, last_category: newCategory })
}

async function postToSlack(text: string): Promise<void> {
  await fetch(SLACK_POST_URL, {
    body: JSON.stringify({ text }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}