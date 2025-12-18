import Animator from "../../Animator.js"
import Color from "../../Color.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelBox from "../../PixelBox.js"
import DrawText from "../../draw/DrawText.js"
import {fonts, fontSelect} from "../../fonts.js"


export default class GoogleCalendar extends Animator {
    static category = "Calendar"
    static title = "Google Calendar"
    static description = "Display upcoming events from Google Calendar"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        
        // Settings
        const settingsGroup = controls.group("Settings")
        const apiKey = settingsGroup.input("API Key", "", true)
        const calendarId = settingsGroup.input("Calendar ID", "primary", true)
        const refreshInterval = settingsGroup.value("Refresh interval (min)", 5, 1, 60, 1)
        const maxEvents = settingsGroup.value("Max events", 5, 1, 20, 1)
        
        // Visual settings
        const visualGroup = controls.group("Visual")
        const scrollSpeed = visualGroup.value("Scroll speed", 2, 1, 10, 0.5)
        const eventColor = controls.color("Event color", 255, 255, 255)
        const timeColor = controls.color("Time color", 128, 128, 255)
        const separatorColor = controls.color("Separator color", 64, 64, 64)
        
        const width = box.width()
        const height = box.height()
        
        let events: any[] = []
        let lastFetch = 0
        let scrollOffset = 0
        
        // Fetch calendar events from Google Calendar API
        async function fetchCalendarEvents() {
            if (!apiKey.text || !calendarId.text) {
                console.log("Google Calendar: API Key or Calendar ID not configured")
                return []
            }
            
            try {
                const now = new Date()
                const timeMin = now.toISOString()
                const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ahead
                
                const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId.text)}/events?` +
                    `key=${apiKey.text}&` +
                    `timeMin=${timeMin}&` +
                    `timeMax=${timeMax}&` +
                    `singleEvents=true&` +
                    `orderBy=startTime&` +
                    `maxResults=${maxEvents.value}`
                
                const response = await fetch(url)
                
                if (!response.ok) {
                    console.error("Google Calendar API error:", response.status, response.statusText)
                    return []
                }
                
                const data = await response.json()
                
                if (!data.items || data.items.length === 0) {
                    return [{
                        summary: "No upcoming events",
                        start: { dateTime: now.toISOString() }
                    }]
                }
                
                return data.items
            } catch (error) {
                console.error("Error fetching calendar events:", error)
                return [{
                    summary: "Error loading calendar",
                    start: { dateTime: new Date().toISOString() }
                }]
            }
        }
        
        // Format date/time
        function formatEventTime(event: any): string {
            const start = event.start.dateTime || event.start.date
            const date = new Date(start)
            
            if (event.start.date) {
                // All-day event
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            } else {
                // Timed event
                const now = new Date()
                const isToday = date.toDateString() === now.toDateString()
                const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
                
                if (isToday) {
                    return "Today " + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                } else if (isTomorrow) {
                    return "Tomorrow " + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                } else {
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + " " +
                           date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                }
            }
        }
        
        // Build scrolling text
        function buildEventText(): string {
            if (events.length === 0) {
                return "Loading calendar..."
            }
            
            let text = ""
            for (let i = 0; i < events.length; i++) {
                const event = events[i]
                const timeStr = formatEventTime(event)
                text += `${event.summary} • ${timeStr}`
                
                if (i < events.length - 1) {
                    text += "   |   "
                }
            }
            
            return text
        }
        
        // Initial fetch
        events = await fetchCalendarEvents()
        lastFetch = Date.now()
        
        const font = fontSelect(controls)
        await font.load()
        
        scheduler.intervalControlled(scrollSpeed, (frameNr) => {
            
            // Refresh calendar data periodically
            const now = Date.now()
            if (now - lastFetch > refreshInterval.value * 60 * 1000) {
                // Trigger async refresh but don't await in interval callback
                fetchCalendarEvents().then(newEvents => {
                    events = newEvents
                    lastFetch = now
                    scrollOffset = 0
                })
            }
            
            box.clear()
            
            const eventText = buildEventText()
            const textWidth = eventText.length * font.width
            
            // Create scrolling text
            const yPos = Math.floor((height - font.height) / 2)
            const text = new DrawText(width - scrollOffset, yPos, font, eventText, new Color(eventColor.r, eventColor.g, eventColor.b))
            box.add(text)
            
            // Update scroll position
            scrollOffset += 1
            if (scrollOffset > textWidth + width) {
                scrollOffset = 0
            }
            
            return true
        })
    }
}
