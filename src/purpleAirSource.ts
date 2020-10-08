import calculateAQI from './calculateAQI'

type RawOneSensorData = {
  pm2_5_atm: string, pm2_5_cf_1: string, humidity: string
}

type RawSensorData = {
  results: RawOneSensorData[] | undefined
}

type SensorData = {
  pm25_cf_1: number
  pm25_cf_atm: number
  humidity: number
}

function average(xs: number[]): number {
  return xs.reduce((a, b) => a + b) / xs.length
}

function averageDatas(datas: SensorData[]): SensorData {
  return {
    pm25_cf_1: average(datas.map(d => d.pm25_cf_1).filter(x => x)),
    pm25_cf_atm: average(datas.map(d => d.pm25_cf_atm).filter(x => x)),
    humidity: average(datas.map(d => d.humidity).filter(x => x))
  }
}

function processData(data: RawSensorData): SensorData | null {
  if (!data.results) {
    return null
  }
  const datas = data.results.map(d => ({
    pm25_cf_1: +d["pm2_5_cf_1"],
    pm25_cf_atm: +d["pm2_5_atm"],
    humidity: +d["humidity"]
  }))
  return averageDatas(datas)
}

function epaAqi(data: SensorData): number {
  return 5.604 + 0.534 * data.pm25_cf_1 - 0.0844 * data.humidity
}

export async function getAqi(): Promise<number> {
  const apiUrl = "https://www.purpleair.com/json?key=14036BZ1E97OKE1B&show=23905"
  const resp = await fetch(new Request(apiUrl))
  const rawData = await resp.json() as RawSensorData
  const data = processData(rawData)
  if (!data) {
    throw new Error("no data")
  }
  const pm25 = epaAqi(data)
  const aqiData = calculateAQI(pm25)
  return aqiData.AQI
}