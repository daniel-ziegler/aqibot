import './calculateAQI'
import calculateAQI from './calculateAQI'

declare const SLACK_POST_URL: string

export async function handleRequest(request: Request): Promise<Response> {
  const aqi = await getAqi()
  return new Response(`AQI ${aqi}`)
}

export async function handleScheduled(event: ScheduledEvent): Promise<void> {
  const aqi = await getAqi()
  if (aqi <= 50) {
    await postToSlack(`AQI ${aqi}`)
  }
}

async function getAqi(): Promise<number> {
  const apiUrl = "https://www.purpleair.com/json?key=14036BZ1E97OKE1B&show=23905"
  const resp = await fetch(new Request(apiUrl))
  const data = await resp.json()
  const pm25 = +data.results[0]["pm2_5_atm"]
  const aqiData = calculateAQI(pm25)
  return aqiData.AQI
}

async function postToSlack(text: string): Promise<void> {
  await fetch(SLACK_POST_URL, {
    body: JSON.stringify({ text }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}