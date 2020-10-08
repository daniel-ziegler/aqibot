import { handleRequest, handleScheduled } from './handler'

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

addEventListener("scheduled", (event: any /* ScheduledEvent */) => {
  event.waitUntil(handleScheduled(event))
})