import { getAqi } from './purpleAirSource'
import { getData, updateData } from './dataStorage'

declare const SLACK_POST_URL: string

// TODO use environment variables for all these
const SENSOR = 'backyard7'
const THRESHOLD_LO = 50
const THRESHOLD_HI = 70

export async function handleRequest(request: Request): Promise<Response> {
  const data = await getData(SENSOR)
  const lastAqi = data && data.last_aqi
  return new Response(`Last AQI: ${lastAqi}`)
}

export async function handleScheduled(event: any /* ScheduledEvent */): Promise<void> {
  const aqi = await getAqi()
  const data = await getData(SENSOR)
  const lastAqi = data && data.last_aqi
  await updateData(SENSOR, { last_aqi: aqi })
  if ((lastAqi === null || lastAqi > THRESHOLD_LO) && aqi <= THRESHOLD_LO) {
    await postToSlack(`🟩️ Open your windows! AQI ${aqi}`)
  } else if ((lastAqi === null || lastAqi < THRESHOLD_HI) && aqi >= THRESHOLD_HI) {
    await postToSlack(`🟧 Close your windows! AQI ${aqi}`)
  }
}

async function postToSlack(text: string): Promise<void> {
  await fetch(SLACK_POST_URL, {
    body: JSON.stringify({ text }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}