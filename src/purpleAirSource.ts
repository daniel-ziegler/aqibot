import calculateAQI from './calculateAQI'

type RawOneSensorData = {
  pm2_5_atm: number, pm2_5_cf_1: number, humidity: number, ParentID?: number
}

type RawSensorData = {
  results: RawOneSensorData[] | undefined
}

type SensorData = {
  pm25_cf_1: number
  pm25_cf_atm: number
  humidity: number
}

function processData(data: RawSensorData): SensorData | null {
  if (!data.results) {
    return null
  }
  const mainSensorResults = data.results.filter(r => !r.ParentID)
  if (mainSensorResults.length != 1) {
    return null
  }
  const mainSensorData = mainSensorResults[0]
  return {
    pm25_cf_1: mainSensorData["pm2_5_cf_1"], pm25_cf_atm: mainSensorData["pm2_5_atm"],
    humidity: mainSensorData["humidity"]
  }
}

function epaAqi(data: SensorData): number {
  return 5.604 + 0.534 * data.pm25_cf_1 - 0.0844 * data.humidity
}

export async function getAqi(): Promise<number | null> {
  const apiUrl = "https://www.purpleair.com/json?key=14036BZ1E97OKE1B&show=23905"
  const resp = await fetch(new Request(apiUrl))
  const rawData = await resp.json() as RawSensorData
  const data = processData(rawData)
  if (!data) {
    return null
  }
  const pm25 = epaAqi(data)
  const aqiData = calculateAQI(pm25)
  return aqiData.AQI
}