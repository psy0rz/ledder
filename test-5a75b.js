#!/usr/bin/env node

/**
 * Test script for Colorlight 5A-75B LED driver
 * 
 * This script tests basic functionality of the Display5A75B driver
 * without requiring the full Ledder framework.
 * 
 * Usage:
 *   node test-5a75b.js [ip_address] [width] [height]
 * 
 * Example:
 *   node test-5a75b.js 192.168.1.45 64 32
 */

import Display5A75B from "./ledder/server/drivers/Display5A75B.js";

// Parse command line arguments
const args = process.argv.slice(2);
const ip = args[0] || "192.168.1.45";
const width = parseInt(args[1]) || 128;  // Default to 2x2 grid for 4 panels
const height = parseInt(args[2]) || 64;

console.log(`Testing 5A-75B driver with ${width}x${height} panel at ${ip}`);

// Create display instance
const display = new Display5A75B(width, height, ip, 5568);

// Simple color object for testing
class TestColor {
    constructor(r, g, b, a = 1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

// Test patterns
const patterns = {
    // Solid red
    red: () => {
        console.log("Testing solid red...");
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                display.setPixel(x, y, new TestColor(255, 0, 0));
            }
        }
    },
    
    // Solid green
    green: () => {
        console.log("Testing solid green...");
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                display.setPixel(x, y, new TestColor(0, 255, 0));
            }
        }
    },
    
    // Solid blue
    blue: () => {
        console.log("Testing solid blue...");
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                display.setPixel(x, y, new TestColor(0, 0, 255));
            }
        }
    },
    
    // RGB gradient
    gradient: () => {
        console.log("Testing RGB gradient...");
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const r = Math.floor((x / width) * 255);
                const g = Math.floor((y / height) * 255);
                const b = Math.floor(((x + y) / (width + height)) * 255);
                display.setPixel(x, y, new TestColor(r, g, b));
            }
        }
    },
    
    // Checkerboard pattern
    checkerboard: () => {
        console.log("Testing checkerboard pattern...");
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const isWhite = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0;
                const color = isWhite ? new TestColor(255, 255, 255) : new TestColor(0, 0, 0);
                display.setPixel(x, y, color);
            }
        }
    },
    
    // Border test
    border: () => {
        console.log("Testing border...");
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    display.setPixel(x, y, new TestColor(255, 255, 255)); // White border
                } else {
                    display.setPixel(x, y, new TestColor(0, 0, 0)); // Black inside
                }
            }
        }
    }
};

// Test sequence
async function runTests() {
    console.log("Starting 5A-75B driver tests...");
    console.log("Display stats:", display.getStats());
    
    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!display.isConnected()) {
        console.error("Failed to connect to 5A-75B card!");
        console.error("Please check:");
        console.error("1. Card is powered and connected to network");
        console.error("2. IP address is correct");
        console.error("3. Compatible firmware is installed");
        process.exit(1);
    }
    
    // Run each test pattern for 2 seconds
    for (const [name, pattern] of Object.entries(patterns)) {
        pattern();
        const bytesSent = display.frame(Date.now() * 1000);
        console.log(`Sent ${bytesSent} bytes for ${name} pattern`);
        
        // Wait 2 seconds before next pattern
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Animation test: rotating colors
    console.log("Testing animation (5 seconds)...");
    const startTime = Date.now();
    let frame = 0;
    
    while (Date.now() - startTime < 5000) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const hue = (frame + x + y) % 360;
                const rgb = hslToRgb(hue / 360, 1, 0.5);
                display.setPixel(x, y, new TestColor(rgb.r, rgb.g, rgb.b));
            }
        }
        
        display.frame(Date.now() * 1000);
        frame++;
        
        // 30 FPS
        await new Promise(resolve => setTimeout(resolve, 33));
    }
    
    // Clear display
    console.log("Clearing display...");
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            display.setPixel(x, y, new TestColor(0, 0, 0));
        }
    }
    display.frame(Date.now() * 1000);
    
    console.log("Tests completed!");
    display.close();
}

// HSL to RGB conversion for animation
function hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    display.close();
    process.exit(0);
});

// Run the tests
runTests().catch(error => {
    console.error("Test failed:", error);
    display.close();
    process.exit(1);
});
