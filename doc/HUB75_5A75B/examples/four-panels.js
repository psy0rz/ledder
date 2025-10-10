// Four 64x32 HUB75 Panels in 2x2 Grid Configuration
// Perfect for your current setup - 128x64 total resolution

import Display5A75B from "../ledder/server/drivers/Display5A75B.js"

export let displayList = [
    new Display5A75B(
        128,                   // total width (2 × 64)
        64,                    // total height (2 × 32)
        "192.168.1.45",       // IP address of 5A-75B card
        5568,                 // UDP port
        false,                // flipX
        false                 // flipY
    )
]

// Physical setup:
// ┌─────────┬─────────┐
// │Panel 1  │Panel 2  │ ← Connected to HUB75 outputs 1,2
// │(64×32)  │(64×32)  │
// ├─────────┼─────────┤
// │Panel 3  │Panel 4  │ ← Connected to HUB75 outputs 3,4
// │(64×32)  │(64×32)  │
// └─────────┴─────────┘

// Logical coordinate mapping:
// - Top-left corner: (0,0)
// - Top-right corner: (127,0)
// - Bottom-left corner: (0,63)
// - Bottom-right corner: (127,63)
// 
// Panel boundaries:
// - Panel 1: (0,0) to (63,31)
// - Panel 2: (64,0) to (127,31)
// - Panel 3: (0,32) to (63,63)
// - Panel 4: (64,32) to (127,63)

// Power requirements:
// - 5A-75B card: ~2A @ 5V
// - Four 64×32 panels: ~12-16A @ 5V (typical usage)
// - Total: ~18A @ 5V (90W) power supply recommended
// - Consider separate power supplies for panels

// Performance characteristics:
// - Refresh rate: 60-90 FPS typical
// - Network bandwidth: ~1.5 MB/s @ 60 FPS
// - Response time: <1ms latency
// - Excellent for animations and video content

// Display settings available:
// - Brightness: 0-255 (controlled via gamma mapping)
// - Gamma correction: Automatic for better color reproduction
// - Color depth: 24-bit RGB (8 bits per channel)
// - Network timeout: Configurable for UDP packets
// - Coordinate transformation: flipX/flipY options available

// Alternative configurations for same panels:

// Horizontal line (256×32):
/*
export let displayList = [
    new Display5A75B(256, 32, "192.168.1.45", 5568)
]
// Layout: [Panel1][Panel2][Panel3][Panel4]
*/

// Vertical stack (64×128):
/*
export let displayList = [
    new Display5A75B(64, 128, "192.168.1.45", 5568)
]
// Layout:
// [Panel1]
// [Panel2]
// [Panel3]
// [Panel4]
*/

//default animation and preset
export let animation = "Tests/TestMatrix/default"
