import { getAqi } from './purpleAirSource'

declare const SLACK_POST_URL: string

export async function handleRequest(request: Request): Promise<Response> {
  const aqi = await getAqi()
  return new Response(`AQI ${aqi}`)
}

export async function handleScheduled(event: ScheduledEvent): Promise<void> {
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