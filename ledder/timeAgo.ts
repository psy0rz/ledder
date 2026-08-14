/**
 * Human readable "how long ago", e.g. "5s ago" / "3m ago" / "2h ago" / "4d ago".
 * Shared by the server (stats line) and the web GUI (display list), so keep it free of imports.
 * @param millisAgo milliseconds since the moment, or undefined if it never happened
 */
export function formatTimeAgo(millisAgo: number): string {
    if (millisAgo === undefined)
        return "never"

    const secondsAgo = Math.max(0, Math.floor(millisAgo / 1000))
    if (secondsAgo < 60)
        return `${secondsAgo}s ago`

    const minutesAgo = Math.floor(secondsAgo / 60)
    if (minutesAgo < 60)
        return `${minutesAgo}m ago`

    const hoursAgo = Math.floor(minutesAgo / 60)
    if (hoursAgo < 24)
        return `${hoursAgo}h ago`

    return `${Math.floor(hoursAgo / 24)}d ago`
}
