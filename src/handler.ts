declare const SLACK_POST_URL: string

export async function handleRequest(request: Request): Promise<Response> {
  const apiUrl = "https://www.purpleair.com/json?key=14036BZ1E97OKE1B&show=23905"
  const resp = await fetch(new Request(apiUrl))
  const data = await resp.json()
  const pm25 = +data.results[0]["pm2_5_atm"]
  const text = `μg/m^3: ${pm25}`
  await postToSlack(text)
  return new Response(`Posted '${text}' to ${SLACK_POST_URL}`)
}

async function postToSlack(text: string): Promise<void> {
  await fetch(SLACK_POST_URL, {
    body: JSON.stringify({ text }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}