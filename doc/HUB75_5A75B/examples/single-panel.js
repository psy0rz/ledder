// Single 64x32 HUB75 Panel Configuration
// Basic setup for testing or small displays

import Display5A75B from "../ledder/server/drivers/Display5A75B.js"

export let displayList = [
    new Display5A75B(
        64,                    // width in pixels
        32,                    // height in pixels
        "192.168.1.45",       // IP address of 5A-75B card
        5568,                 // UDP port
        false,                // flipX - set to true to mirror horizontally
        false                 // flipY - set to true to mirror vertically
    )
]

// Physical setup:
// ┌─────────┐
// │ Panel 1 │ ← Connected to HUB75 output 1
// │ (64×32) │
// └─────────┘

// Power requirements:
// - 5A-75B card: ~2A @ 5V
// - Single 64×32 panel: ~2-4A @ 5V (typical usage)
// - Total: ~6A @ 5V (30W) power supply recommended

// Usage notes:
// - Perfect for testing and development
// - Good for text displays and simple graphics
// - High refresh rate possible (120+ FPS)
// - Low power consumption
// - Minimal cable management

//default animation and preset
export let animation = "Tests/TestMatrix/default"
