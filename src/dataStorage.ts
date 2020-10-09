
import { getGCPClient } from './firestore'

const SENSORS_COLLECTION = 'sensors'

type SavedSensorData = {
  last_aqi: number
}

function is_valid(data: any): data is SavedSensorData {
  return (data as SavedSensorData).last_aqi !== undefined
}

export async function getData(sensor: string): Promise<SavedSensorData | null> {
  const client = await getGCPClient()
  const doc = await client.getDocument(SENSORS_COLLECTION, sensor)
  if (doc === null || is_valid(doc)) {
    return doc
  } else {
    throw new Error(`Invalid saved data: ${Object.entries(doc)}`)
  }
}

export async function updateData(sensor: string, data: Partial<SavedSensorData>): Promise<void> {
  const client = await getGCPClient()
  return client.patchDocument(SENSORS_COLLECTION, sensor, data)
}