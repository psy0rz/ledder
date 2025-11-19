import { DisplayChromecast } from "./ledder/server/drivers/DisplayChromecast.js"
import { RenderRealtime } from "./ledder/server/RenderRealtime.js"

/**
 * Example configuration for streaming Ledger animations to a Chromecast device
 * 
 * Usage:
 * 1. Make sure you have a Chromecast device on your local network
 * 2. Update the deviceName below to match your Chromecast, or use IP address directly
 * 3. Copy this file to displayconf.js
 * 4. Run: npm run build && npm run start
 * 5. The animation will stream to your Chromecast TV
 * 
 * Tips:
 * - Leave deviceName empty ("") to auto-select first found Chromecast
 * - Use partial name like "Living" to match "Living Room TV"
 * - Use IP address like "192.168.1.217" for direct connection without discovery
 */

// Create Chromecast display
// Parameters: width, height, deviceName, serverPort, localIp, autoConnect
const display = new DisplayChromecast(
    64,              // Width in Ledger pixels
    64,              // Height in Ledger pixels
    "",              // Device name or IP (examples: "", "Living Room", "192.168.1.217")
    8765,            // HTTP server port for streaming
    "",              // Local IP (auto-detected if empty)
    true             // Auto-connect on startup
)

// Create renderer with the Chromecast display
const render = new RenderRealtime()
await render.addDisplay(display)

// Set animation to render
// You can use any animation from the ReinsCollection or Tests folders
render.animationManager.setAnimation("Tests/TestGrid/default")
// render.animationManager.setAnimation("ReinsCollection/Rainbowcross/default")
// render.animationManager.setAnimation("ReinsCollection/Cube/default")

export default {
    render: render,
    animation: "Tests/TestGrid/default",
    port: 3000
}
