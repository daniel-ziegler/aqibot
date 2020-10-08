import _ from 'lodash'
import { getAqi } from './purpleAirSource'
import { buildGCPClient } from './storage'

declare const SLACK_POST_URL: string

const THRESHOLD_LO = 40
const THRESHOLD_HI = 60

const getGCPClient = _.once(buildGCPClient)

export async function handleRequest(request: Request): Promise<Response> {
  const client = await getGCPClient()
  const aqi = await getAqi()
  const lastAqi = (await client.getDocument('sensors', 'goldenbear')).last_aqi
  return new Response(`AQI ${aqi}; last AQI: ${lastAqi}`)
}

export async function handleScheduled(event: any /* ScheduledEvent */): Promise<void> {
  const client = await getGCPClient()
  const aqi = await getAqi()
  const lastAqi = (await client.getDocument('sensors', 'goldenbear')).last_aqi
  await client.patchDocument('sensors', 'goldenbear', { last_aqi: aqi })
  if (lastAqi > THRESHOLD_LO && aqi <= THRESHOLD_LO) {
    await postToSlack(`Open your windows! AQI ${aqi}`)
  } else if (lastAqi < THRESHOLD_HI && aqi >= THRESHOLD_HI) {
    await postToSlack(`Close your windows! AQI ${aqi}`)
  }
}

async function postToSlack(text: string): Promise<void> {
  await fetch(SLACK_POST_URL, {
    body: JSON.stringify({ text }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}