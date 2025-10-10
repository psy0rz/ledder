#!/usr/bin/env node

/**
 * Test script for Colorlight 5A-75B LED driver
 * 
 * This script tests basic functionality of the Display5A75B driver
 * without requiring the full Ledder framework.
 * 
 * Usage:
 *   node test-panels.js [ip_address] [width] [height]
 * 
 * Examples:
 *   node test-panels.js 192.168.1.45 64 32
 *   node test-panels.js 192.168.1.45 128 64
 */

import Display5A75B from "../../../ledder/server/drivers/Display5A75B.js";

const args = process.argv.slice(2);
const ip = args[0] || "192.168.1.45";
const width = parseInt(args[1]) || 64;
const height = parseInt(args[2]) || 32;

console.log(`\n🧪 Testing 5A-75B LED Display`);
console.log(`📡 IP: ${ip}`);
console.log(`📐 Size: ${width}×${height}`);
console.log(`🔗 Port: 5568\n`);

// Create display instance
const display = new Display5A75B(width, height, ip, 5568);

// Test patterns
const tests = [
    {
        name: "🔴 Red Fill",
        fn: () => {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    display.setPixel(x, y, { r: 255, g: 0, b: 0 });
                }
            }
        }
    },
    {
        name: "🟢 Green Fill", 
        fn: () => {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    display.setPixel(x, y, { r: 0, g: 255, b: 0 });
                }
            }
        }
    },
    {
        name: "🔵 Blue Fill",
        fn: () => {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    display.setPixel(x, y, { r: 0, g: 0, b: 255 });
                }
            }
        }
    },
    {
        name: "⚪ White Fill",
        fn: () => {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    display.setPixel(x, y, { r: 255, g: 255, b: 255 });
                }
            }
        }
    },
    {
        name: "🌈 Rainbow Gradient",
        fn: () => {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const hue = (x / width) * 360;
                    const color = hslToRgb(hue, 100, 50);
                    display.setPixel(x, y, color);
                }
            }
        }
    },
    {
        name: "🏁 Checkerboard",
        fn: () => {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const isWhite = (Math.floor(x / 8) + Math.floor(y / 8)) % 2;
                    const color = isWhite ? 
                        { r: 255, g: 255, b: 255 } : 
                        { r: 0, g: 0, b: 0 };
                    display.setPixel(x, y, color);
                }
            }
        }
    },
    {
        name: "🎯 Border Test",
        fn: () => {
            // Clear screen
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    display.setPixel(x, y, { r: 0, g: 0, b: 0 });
                }
            }
            
            // Draw border
            for (let x = 0; x < width; x++) {
                display.setPixel(x, 0, { r: 255, g: 255, b: 255 });
                display.setPixel(x, height - 1, { r: 255, g: 255, b: 255 });
            }
            for (let y = 0; y < height; y++) {
                display.setPixel(0, y, { r: 255, g: 255, b: 255 });
                display.setPixel(width - 1, y, { r: 255, g: 255, b: 255 });
            }
            
            // Draw corner markers
            const cornerSize = 4;
            const corners = [
                [0, 0, { r: 255, g: 0, b: 0 }],           // Top-left: Red
                [width - cornerSize, 0, { r: 0, g: 255, b: 0 }],     // Top-right: Green
                [0, height - cornerSize, { r: 0, g: 0, b: 255 }],    // Bottom-left: Blue
                [width - cornerSize, height - cornerSize, { r: 255, g: 255, b: 0 }] // Bottom-right: Yellow
            ];
            
            corners.forEach(([startX, startY, color]) => {
                for (let y = 0; y < cornerSize; y++) {
                    for (let x = 0; x < cornerSize; x++) {
                        if (startX + x < width && startY + y < height) {
                            display.setPixel(startX + x, startY + y, color);
                        }
                    }
                }
            });
        }
    }
];

// HSL to RGB conversion helper
function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r, g, b;
    
    if (h < 1/6) {
        [r, g, b] = [c, x, 0];
    } else if (h < 2/6) {
        [r, g, b] = [x, c, 0];
    } else if (h < 3/6) {
        [r, g, b] = [0, c, x];
    } else if (h < 4/6) {
        [r, g, b] = [0, x, c];
    } else if (h < 5/6) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }
    
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

// Run tests
async function runTests() {
    try {
        console.log("🚀 Starting LED panel tests...\n");
        
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            console.log(`${i + 1}/${tests.length} ${test.name}`);
            
            test.fn();
            display.frame();
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Clear display
        console.log("🧹 Clearing display...");
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                display.setPixel(x, y, { r: 0, g: 0, b: 0 });
            }
        }
        display.frame();
        
        console.log("\n✅ All tests completed!");
        console.log("📊 If you saw the test patterns, your 5A-75B is working correctly!");
        console.log("🔌 Check your LED panels and connections if no display appeared.");
        
    } catch (error) {
        console.error("\n❌ Test failed:", error.message);
        console.log("\n🔧 Troubleshooting suggestions:");
        console.log("1. Check if the card is powered and connected");
        console.log(`2. Verify IP address: ping ${ip}`);
        console.log("3. Ensure compatible firmware is flashed");
        console.log("4. Check HUB75 cable connections");
        console.log("5. Verify LED panel power supply");
        
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log("\n🛑 Test interrupted by user");
    
    // Clear display on exit
    try {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                display.setPixel(x, y, { r: 0, g: 0, b: 0 });
            }
        }
        display.frame();
        console.log("🧹 Display cleared");
    } catch (error) {
        // Ignore cleanup errors
    }
    
    process.exit(0);
});

// Start tests
runTests();
