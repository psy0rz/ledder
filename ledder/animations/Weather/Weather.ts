import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import DrawText, {type HorizontalAlign, type VerticalAlign} from "../../draw/DrawText.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import {fontSelect} from "../../fonts.js"
import {
    geocodeLocation,
    currentWeather,
    describeWeatherCode,
    type WeatherLocation,
    type WeatherCondition,
    type TemperatureUnit,
    type WindSpeedUnit
} from "../../weather.js"

//7x7 icons, drawn with DrawAsciiArtColor's default color map (y=yellow, 5=gray, a=aqua, w=white, b=blue)
const weatherIcons: Record<WeatherCondition, string> = {
    clear: `
        ...y...
        .y.y.y.
        ..yyy..
        y.yyy.y
        ..yyy..
        .y.y.y.
        ...y...
    `,
    partlyCloudy: `
        ..y....
        .y.y...
        ..555..
        5555555
        .......
        .......
        .......
    `,
    cloudy: `
        .......
        ..555..
        .555555
        5555555
        .......
        .......
        .......
    `,
    fog: `
        .......
        .55555.
        .......
        55555..
        .......
        .5555..
        .......
    `,
    rain: `
        ..555..
        5555555
        .......
        .a.a.a.
        ..a.a..
        .a.a.a.
        .......
    `,
    snow: `
        ..555..
        5555555
        .......
        .w.w.w.
        ..w.w..
        .w.w.w.
        .......
    `,
    thunderstorm: `
        ..555..
        5555555
        ..y....
        .yy....
        y.y....
        ..y....
        .......
    `
}
const iconSize = 7

function formatWeatherText(format: string, values: Record<string, string>): string {
    return format.replace(/\{(\w+)}/g, (token, name) => name in values ? values[name] : token)
}

export default class Weather extends Animator {

    static description = "Current weather for a place name via the open-meteo API (free, no key required), meant to be used as a small icon+text layer. " +
        "For a place name that exists in multiple countries, disambiguate with \", country\", e.g. \"Amsterdam, NL\" or \"Amsterdam, United States\"."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const locationGroup = controls.group("Location")
        const locationInput = locationGroup.input("Place name", "Amsterdam", true)
        const unitsControl = locationGroup.select("Units", "metric", [
            {id: "metric", name: "Celsius, km/h"},
            {id: "imperial", name: "Fahrenheit, mph"},
        ], true)
        const updateIntervalControl = locationGroup.value("Update interval (minutes)", 15, 1, 180, 1, true)

        const displayGroup = controls.group("Display")
        const textColor = displayGroup.color("Text color", 255, 255, 255)
        const font = fontSelect(displayGroup, "Font")
        const formatControl = displayGroup.input("Format", "{temp} {condition}", true)
        const showIconControl = displayGroup.switch("Show icon", true, true)

        const positionControl = displayGroup.position("Position", box, true, "center", 0, "middle", 0)

        const hAlignControl = displayGroup.select("Horizontal align", "left", [
            {id: "left", name: "Left"},
            {id: "centered", name: "Centered"},
            {id: "right", name: "Right"},
        ], true)

        const vAlignControl = displayGroup.select("Vertical align", "middle", [
            {id: "top", name: "Top"},
            {id: "middle", name: "Middle"},
            {id: "bottom", name: "Bottom"},
        ], true)

        const hAlign = hAlignControl.selected as HorizontalAlign
        const vAlign = vAlignControl.selected as VerticalAlign

        positionControl.runAnchorMarker(scheduler, box)

        const temperatureUnit: TemperatureUnit = unitsControl.selected === "metric" ? "celsius" : "fahrenheit"
        const windSpeedUnit: WindSpeedUnit = unitsControl.selected === "metric" ? "kmh" : "mph"
        const temperatureSuffix = temperatureUnit === "celsius" ? "°C" : "°F"
        const windSuffix = windSpeedUnit === "kmh" ? "km/h" : "mph"

        const contentBox = new PixelBox(box)
        box.add(contentBox)

        let statusText = "Loading…"
        let icon: string | undefined

        const draw = () => {
            contentBox.clear()

            let x = positionControl.x
            const y = positionControl.y

            if (icon && showIconControl.enabled) {
                let iconY = y
                if (vAlign === "middle")
                    iconY -= Math.floor(iconSize / 2)
                else if (vAlign === "bottom")
                    iconY -= iconSize - 1

                contentBox.add(new DrawAsciiArtColor(x, iconY, icon))
                x += iconSize + 1
            }

            contentBox.add(new DrawText(x, y, font, statusText, textColor, 1, box.width()-x, hAlign, vAlign))
        }
        draw()

        let stopped = false
        scheduler.onCleanup(() => {
            stopped = true
        })

        let location: WeatherLocation | undefined

        const update = async () => {
            const placeName = locationInput.text.trim()
            if (!placeName) {
                statusText = "No location set"
                icon = undefined
                draw()
                return
            }

            try {
                if (!location || location.name.toLowerCase() !== placeName.toLowerCase())
                    location = await geocodeLocation(placeName)

                const weather = await currentWeather(location, temperatureUnit, windSpeedUnit)
                const {text: conditionText, condition} = describeWeatherCode(weather.weatherCode)

                if (stopped)
                    return

                icon = weatherIcons[condition]
                statusText = formatWeatherText(formatControl.text, {
                    temp: `${Math.round(weather.temperature)}${temperatureSuffix}`,
                    feels: `${Math.round(weather.apparentTemperature)}${temperatureSuffix}`,
                    humidity: `${Math.round(weather.relativeHumidity)}%`,
                    wind: `${Math.round(weather.windSpeed)}${windSuffix}`,
                    condition: conditionText,
                    city: `${location.name}, ${location.country}`
                })
            } catch (e) {
                console.error("Weather animation:", e)
                if (stopped)
                    return
                icon = undefined
                statusText = "Weather unavailable"
            }

            draw()
        }

        void update()

        //not awaited: the interval only kicks off the next update, it never waits for it
        scheduler.interval(scheduler.timeToFrames(updateIntervalControl.value * 60), () => { void update() })
    }
}
