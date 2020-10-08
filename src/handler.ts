import { getAqi } from './purpleAirSource'
import { buildGCPClient } from './storage'

declare const SLACK_POST_URL: string

export async function handleRequest(request: Request): Promise<Response> {
  const client = await buildGCPClient()
  const doc = await client.getDocument('sensors', 'goldenbear')
  const aqi = await getAqi()
  return new Response(`AQI ${aqi}; doc: ${Object.entries(doc.fields.purpleair_readkey)}`)
}

export async function handleScheduled(event: any /* ScheduledEvent */): Promise<void> {
  const aqi = await getAqi()
  if (aqi !== null && aqi <= 50) {
    await postToSlack(`AQI ${aqi}`)
  }
}

async function postToSlack(text: string): Promise<void> {
  await fetch(SLACK_POST_URL, {
    body: JSON.stringify({ text }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}