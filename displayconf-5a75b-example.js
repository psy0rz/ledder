import Display5A75B from "./ledder/server/drivers/Display5A75B.js"
import OffsetMapper from "./ledder/server/drivers/OffsetMapper.js"

// Example configuration for Colorlight 5A-75B LED driver
// This file shows various ways to configure HUB75 panels with the 5A-75B card

export let displayList = []

/////////// Single 64x32 HUB75 panel
// Most common configuration - single indoor LED panel
/*
displayList.push(new Display5A75B(
    64,                    // width
    32,                    // height  
    "192.168.1.45",       // IP address of 5A-75B card
    5568,                 // UDP port
    false,                // flipX
    false                 // flipY
))
*/

/////////// Single 64x64 HUB75 panel
// Higher resolution panel, common for outdoor displays
/*
displayList.push(new Display5A75B(
    64,                    // width
    64,                    // height
    "192.168.1.45",       // IP address
    5568,                 // port
    false,                // flipX
    false                 // flipY
))
*/

/////////// 2x1 horizontal chain of 64x32 panels (128x32 total)
// Two panels side by side
/*
displayList.push(new Display5A75B(
    128,                   // total width (2 * 64)
    32,                    // height
    "192.168.1.45",       // IP address
    5568                  // port
))
*/

/////////// 2x2 grid of 64x32 panels (128x64 total) - RECOMMENDED FOR 4 PANELS
// Four panels arranged in a 2x2 grid - perfect for your setup!
displayList.push(new Display5A75B(
    128,                   // total width (2 * 64)
    64,                    // total height (2 * 32)
    "192.168.1.45",       // IP address
    5568                  // port
))

/////////// Alternative: 4x1 horizontal line of 64x32 panels (256x32 total)
// Four panels in a horizontal line
/*
displayList.push(new Display5A75B(
    256,                   // total width (4 * 64)
    32,                    // height
    "192.168.1.45",       // IP address
    5568                  // port
))
*/

/////////// Alternative: 1x4 vertical stack of 64x32 panels (64x128 total)  
// Four panels stacked vertically
/*
displayList.push(new Display5A75B(
    64,                    // width
    128,                   // total height (4 * 32)
    "192.168.1.45",       // IP address
    5568                  // port
))
*/

/////////// Multiple 5A-75B cards configuration
// Use multiple cards for larger displays or redundancy
/*
// Card 1: Left side panels
displayList.push(new Display5A75B(
    128,                   // width
    64,                    // height
    "192.168.1.45",       // Card 1 IP
    5568,                 // port
    false,                // flipX
    false                 // flipY
))

// Card 2: Right side panels  
displayList.push(new Display5A75B(
    128,                   // width
    64,                    // height
    "192.168.1.46",       // Card 2 IP
    5568,                 // port
    false,                // flipX
    false                 // flipY
))
*/

/////////// Complex panel arrangement with OffsetMapper
// Use OffsetMapper for non-standard panel arrangements
/*
// Create base panel configuration
let panel64x32 = new Display5A75B(64, 32, "192.168.1.45", 5568)

// Create offset mapper for custom layout
let customLayout = new OffsetMapper(192, 64, false) // 3x2 arrangement

// Map individual panels to positions
customLayout.addDisplay(panel64x32, 0, 0)    // Top-left
customLayout.addDisplay(panel64x32, 64, 0)   // Top-center  
customLayout.addDisplay(panel64x32, 128, 0)  // Top-right
customLayout.addDisplay(panel64x32, 0, 32)   // Bottom-left
customLayout.addDisplay(panel64x32, 64, 32)  // Bottom-center
customLayout.addDisplay(panel64x32, 128, 32) // Bottom-right

displayList.push(customLayout)
*/

/////////// Zigzag panel configuration
// For panels wired in a zigzag pattern to save cable length
/*
let panel = new Display5A75B(64, 32, "192.168.1.45", 5568)
let zigzagMapper = new OffsetMapper(64, 64, false) // 1x2 vertical arrangement

// Add panels with zigzag pattern
zigzagMapper.addDisplay(panel, 0, 0)    // Top panel (normal)
zigzagMapper.addDisplay(panel, 0, 32)   // Bottom panel
zigzagMapper.zigZagY()                  // Apply zigzag to Y axis

displayList.push(zigzagMapper)
*/

/////////// High refresh rate configuration
// For applications requiring high frame rates
/*
let highRefreshPanel = new Display5A75B(
    32,                    // smaller resolution for higher FPS
    32,
    "192.168.1.45",
    5568
)

// The driver will automatically adjust frame timing
// Actual refresh rate depends on panel size and network latency
displayList.push(highRefreshPanel)
*/

/////////// Testing configuration (small panel for development)
// Recommended for testing and development
displayList.push(new Display5A75B(
    32,                    // small width for testing
    16,                    // small height for testing
    "192.168.1.45",       // default 5A-75B IP
    5568,                 // default port
    false,                // no X flip
    false                 // no Y flip
))

// Notes for configuration:
// 1. Ensure your 5A-75B card has compatible firmware installed
// 2. Set your computer's IP to the same subnet (e.g., 192.168.1.100)
// 3. Test connectivity with: ping 192.168.1.45
// 4. Panel power requirements: 5V, 2-6A per 64x32 panel depending on brightness
// 5. Use adequate power supplies - insufficient power causes flickering
// 6. HUB75 cables should be short (<30cm) for best signal quality
// 7. For large displays, consider multiple 5A-75B cards to distribute load
