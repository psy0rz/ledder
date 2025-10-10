// Advanced Multi-Card and Custom Layout Configurations
// For large installations and complex setups

import Display5A75B from "../ledder/server/drivers/Display5A75B.js"
import OffsetMapper from "../ledder/server/drivers/OffsetMapper.js"

export let displayList = []

/////////// Multiple 5A-75B Cards Setup

// Two cards for redundancy or load distribution
/*
displayList.push(
    // Left display area (128×64)
    new Display5A75B(128, 64, "192.168.1.45", 5568),
    
    // Right display area (128×64) 
    new Display5A75B(128, 64, "192.168.1.46", 5568)
)
// Total resolution: 256×64 across two cards
// Network: Each card on separate IP
// Power: Distribute load across multiple supplies
*/

/////////// Maximum Single Card Configuration

// 8 panels using all HUB75 outputs (512×64)
/*
displayList.push(
    new Display5A75B(
        512,                   // 8 × 64 width
        64,                    // panel height
        "192.168.1.45",       
        5568
    )
)
// Layout: [P1][P2][P3][P4][P5][P6][P7][P8]
// Power: Requires high-capacity power supply (200W+)
// Performance: Lower refresh rate due to size
*/

/////////// Custom Panel Layout with OffsetMapper

// Non-standard arrangements using OffsetMapper
/*
// Create individual display instances
const card1 = new Display5A75B(128, 64, "192.168.1.45", 5568)
const card2 = new Display5A75B(128, 64, "192.168.1.46", 5568)

// Create custom layout mapper
const customLayout = new OffsetMapper(256, 128, false)

// Position displays in custom arrangement
customLayout.addDisplay(card1, 0, 0)     // Top-left quadrant
customLayout.addDisplay(card2, 128, 64)  // Bottom-right quadrant

displayList.push(customLayout)
// Creates an L-shaped display with gap in top-right and bottom-left
*/

/////////// Zigzag Panel Wiring Configuration

// For panels wired in zigzag pattern to save cable length
/*
const panels = new Display5A75B(128, 128, "192.168.1.45", 5568)
const zigzagMapper = new OffsetMapper(128, 128, false)

zigzagMapper.addDisplay(panels, 0, 0)
zigzagMapper.zigZagY()  // Apply zigzag pattern to Y axis

displayList.push(zigzagMapper)
// Useful when panels are physically wired: Panel1→Panel2→Panel4→Panel3
*/

/////////// High-Resolution Video Wall

// Large format display using multiple cards
/*
// 4×2 arrangement of cards (each driving 2×2 panels)
const cards = [
    new Display5A75B(128, 64, "192.168.1.45", 5568), // Top-left
    new Display5A75B(128, 64, "192.168.1.46", 5568), // Top-right  
    new Display5A75B(128, 64, "192.168.1.47", 5568), // Bottom-left
    new Display5A75B(128, 64, "192.168.1.48", 5568)  // Bottom-right
]

const videoWall = new OffsetMapper(256, 128, false)
videoWall.addDisplay(cards[0], 0, 0)      // Top-left: 128×64
videoWall.addDisplay(cards[1], 128, 0)    // Top-right: 128×64
videoWall.addDisplay(cards[2], 0, 64)     // Bottom-left: 128×64  
videoWall.addDisplay(cards[3], 128, 64)   // Bottom-right: 128×64

displayList.push(videoWall)
// Total resolution: 256×128 (16× 64×32 panels)
// Network: Gigabit switch recommended
// Power: Professional power distribution required
*/

/////////// Mixed Panel Sizes

// Combining different panel types (advanced)
/*
const smallPanels = new Display5A75B(128, 32, "192.168.1.45", 5568)  // 2× 64×32
const largePanels = new Display5A75B(128, 64, "192.168.1.46", 5568)  // 2× 64×64

const mixedLayout = new OffsetMapper(128, 96, false)
mixedLayout.addDisplay(smallPanels, 0, 0)   // Top: 128×32
mixedLayout.addDisplay(largePanels, 0, 32)  // Bottom: 128×64

displayList.push(mixedLayout)
// Creates 128×96 composite display with mixed panel sizes
*/

/////////// Performance Optimized Configuration

// Multiple smaller displays for high frame rates
/*
displayList.push(
    new Display5A75B(64, 32, "192.168.1.45", 5568),  // Display 1
    new Display5A75B(64, 32, "192.168.1.46", 5568),  // Display 2
    new Display5A75B(64, 32, "192.168.1.47", 5568),  // Display 3
    new Display5A75B(64, 32, "192.168.1.48", 5568)   // Display 4
)
// Each display can run at higher frame rates independently
// Good for multi-zone displays or distributed installations
*/

/////////// Daisy-Chain Network Configuration

// Multiple cards connected in series
/*
displayList.push(
    new Display5A75B(128, 64, "192.168.1.45", 5568), // Card 1
    new Display5A75B(128, 64, "192.168.1.46", 5568), // Card 2  
    new Display5A75B(128, 64, "192.168.1.47", 5568)  // Card 3
)

// Network topology:
// Computer → Card1 Port1 → Card1 Port2 → Card2 Port1 → Card2 Port2 → Card3 Port1
// Reduces network switch requirements
// Each card still needs unique IP address
*/

/////////// Testing Configuration (Default)

// Safe configuration for testing
displayList.push(
    new Display5A75B(
        64,                    // Small size for testing
        32,
        "192.168.1.45",       // Default IP
        5568,
        false,                // No transformations
        false
    )
)

// Network Configuration Notes:
// - Ensure all IP addresses are unique and accessible
// - Use Gigabit network infrastructure for multiple cards
// - Consider VLAN isolation for LED network traffic
// - Plan for adequate power distribution
// - Use quality network cables (Cat6 recommended)

// Power Planning:
// - 5A-75B card: ~2A @ 5V each
// - 64×32 panel: ~2-6A @ 5V each (depends on content/brightness)
// - Total system power = (Cards × 2A) + (Panels × 4A average)
// - Add 25% safety margin to power supply capacity

// Performance Considerations:
// - Frame rate inversely proportional to total pixel count
// - Network bandwidth: ~25 bytes/pixel/second @ 60 FPS
// - CPU usage scales with display complexity
// - Consider frame rate limiting for large displays

//default animation and preset
export let animation = "Tests/TestMatrix/default"
