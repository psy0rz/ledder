//open-meteo: free, no API key needed. https://open-meteo.com
//geocoding turns a place name into coordinates, forecast turns coordinates into current weather.

import {NodeFetchCache, MemoryCache, cacheStrategies} from "node-fetch-cache"

//every animation restart (which happens on every control change) re-requests, and several displays
//can show the same location at once, so cache it briefly instead of hammering open-meteo.
//coordinates for a place name never change, so those can be cached much longer than the weather itself.
const fetchGeocode = NodeFetchCache.create({
    cache: new MemoryCache({ttl: 60 * 60 * 1000}),
    shouldCacheResponse: cacheStrategies.cacheOkayOnly
})

const fetchForecast = NodeFetchCache.create({
    cache: new MemoryCache({ttl: 5 * 60 * 1000}),
    shouldCacheResponse: cacheStrategies.cacheOkayOnly
})

export type WeatherLocation = {
    name: string
    country: string
    latitude: number
    longitude: number
}

/**
 * Resolve a place name to coordinates via open-meteo's geocoding API.
 * Many place names exist in multiple countries (e.g. "Amsterdam" is also a village in New York), and
 * open-meteo's search has no way to filter by country itself, so it's done here: an optional
 * ", country" suffix - either a country name or its ISO code, e.g. "Amsterdam, NL" or "Amsterdam, United States" -
 * picks the best-ranked match within that country instead of always taking the single most prominent
 * match overall. Throws when nothing matches.
 */
export async function geocodeLocation(placeName: string): Promise<WeatherLocation> {

    const commaIndex = placeName.indexOf(",")
    const name = (commaIndex === -1 ? placeName : placeName.slice(0, commaIndex)).trim()
    const country = commaIndex === -1 ? undefined : placeName.slice(commaIndex + 1).trim().toLowerCase()

    //without a country filter, only the single most prominent match is needed; with one, fetch a
    //broader set of candidates to filter through
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=${country ? 20 : 1}`
    const response = await fetchGeocode(url)

    if (!response.ok)
        throw new Error(`Could not geocode "${placeName}": ${response.status} ${response.statusText}`)

    const geocode = await response.json() as {
        results?: Array<{ name: string, country: string, country_code: string, latitude: number, longitude: number }>
    }

    if (!geocode.results || geocode.results.length === 0)
        throw new Error(`Location "${placeName}" not found`)

    //results are ranked by relevance/population, so the first match within the requested country is
    //the best one; if the country doesn't match any result, fall back to the overall top match
    const result = country
        ? geocode.results.find(r => r.country_code.toLowerCase() === country || r.country.toLowerCase() === country) ?? geocode.results[0]
        : geocode.results[0]

    return {name: result.name, country: result.country, latitude: result.latitude, longitude: result.longitude}
}

export type TemperatureUnit = "celsius" | "fahrenheit"
export type WindSpeedUnit = "kmh" | "mph"

export type CurrentWeather = {
    temperature: number
    apparentTemperature: number
    relativeHumidity: number
    windSpeed: number
    weatherCode: number
}

/** The current weather at a coordinate, via open-meteo's forecast API. Throws when it cannot be fetched. */
export async function currentWeather(location: WeatherLocation, temperatureUnit: TemperatureUnit, windSpeedUnit: WindSpeedUnit): Promise<CurrentWeather> {

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}&timezone=auto`

    const response = await fetchForecast(url)

    if (!response.ok)
        throw new Error(`Could not fetch weather for ${location.name}: ${response.status} ${response.statusText}`)

    const forecast = await response.json() as {
        current: {
            temperature_2m: number
            relative_humidity_2m: number
            apparent_temperature: number
            weather_code: number
            wind_speed_10m: number
        }
    }

    return {
        temperature: forecast.current.temperature_2m,
        apparentTemperature: forecast.current.apparent_temperature,
        relativeHumidity: forecast.current.relative_humidity_2m,
        windSpeed: forecast.current.wind_speed_10m,
        weatherCode: forecast.current.weather_code
    }
}

//WMO weather codes used by open-meteo: https://open-meteo.com/en/docs#weathervariables
export type WeatherCondition = "clear" | "partlyCloudy" | "cloudy" | "fog" | "rain" | "snow" | "thunderstorm"

const weatherCodeConditions: Record<number, { text: string, condition: WeatherCondition }> = {
    0: {text: "Clear sky", condition: "clear"},
    1: {text: "Mainly clear", condition: "partlyCloudy"},
    2: {text: "Partly cloudy", condition: "partlyCloudy"},
    3: {text: "Overcast", condition: "cloudy"},
    45: {text: "Fog", condition: "fog"},
    48: {text: "Fog", condition: "fog"},
    51: {text: "Light drizzle", condition: "rain"},
    53: {text: "Drizzle", condition: "rain"},
    55: {text: "Dense drizzle", condition: "rain"},
    56: {text: "Freezing drizzle", condition: "rain"},
    57: {text: "Freezing drizzle", condition: "rain"},
    61: {text: "Slight rain", condition: "rain"},
    63: {text: "Rain", condition: "rain"},
    65: {text: "Heavy rain", condition: "rain"},
    66: {text: "Freezing rain", condition: "rain"},
    67: {text: "Freezing rain", condition: "rain"},
    71: {text: "Slight snow", condition: "snow"},
    73: {text: "Snow", condition: "snow"},
    75: {text: "Heavy snow", condition: "snow"},
    77: {text: "Snow grains", condition: "snow"},
    80: {text: "Rain showers", condition: "rain"},
    81: {text: "Rain showers", condition: "rain"},
    82: {text: "Violent rain showers", condition: "rain"},
    85: {text: "Snow showers", condition: "snow"},
    86: {text: "Snow showers", condition: "snow"},
    95: {text: "Thunderstorm", condition: "thunderstorm"},
    96: {text: "Thunderstorm with hail", condition: "thunderstorm"},
    99: {text: "Thunderstorm with hail", condition: "thunderstorm"}
}

/** Human-readable text and a broad condition (for icon selection) for a WMO weather code. */
export function describeWeatherCode(weatherCode: number): { text: string, condition: WeatherCondition } {
    return weatherCodeConditions[weatherCode] ?? {text: "Unknown", condition: "cloudy"}
}
