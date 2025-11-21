# Chromecast Display Driver for Ledder

Stream Ledger animations to your Chromecast device!

## Features

- Auto-discovery of Chromecast devices on your network
- Real-time streaming of LED animations
- Configurable frame rate (1-60 FPS)
- Adjustable scale factor for better visibility on TVs
- Pixel-perfect rendering with no anti-aliasing

## Requirements

- Node.js 20+
- A Chromecast device on the same network
- Network connectivity between server and Chromecast

## Installation

Dependencies are already installed if you ran `npm install` in the ledger directory.

Required packages:
- `canvas` - For frame rendering
- `castv2-client` - Chromecast communication
- `bonjour-hap` - mDNS device discovery
- `express` - HTTP server for streaming

## Quick Start

1. **Use the example configuration:**
   ```bash
   cp displayconf-chromecast.js displayconf.js
   ```

2. **Build and run:**
   ```bash
   npm run build && npm run start
   ```

3. **The animation will automatically:**
   - Discover your Chromecast device
   - Start an HTTP server for streaming frames
   - Connect to Chromecast and start playing

## Configuration Options

### Basic Usage

```javascript
import { DisplayChromecast } from "./ledder/server/drivers/DisplayChromecast.js"

const display = new DisplayChromecast(
    64,              // Width (pixels)
    64,              // Height (pixels)
    "Living Room",   // Device name (or "" for auto-discovery)
    8765,            // HTTP server port
    "192.168.1.100", // Local IP (or "" for auto-detect)
    true             // Auto-connect
)
```

### Parameters

- **width** (default: 64): Display width in Ledger pixels
- **height** (default: 64): Display height in Ledger pixels
- **deviceName** (default: ""): Chromecast device name to connect to
  - Leave empty to connect to first discovered device
  - Use partial name matching (e.g., "Living" matches "Living Room TV")
- **serverPort** (default: 8765): Port for the HTTP streaming server
- **localIp** (default: auto-detected): Your computer's IP address
- **autoConnect** (default: true): Automatically connect on startup

### Runtime Controls

The driver provides several controls accessible through the Ledger web interface:

- **Device Name**: Change which Chromecast to connect to
- **Target FPS**: Adjust frame rate (1-60, default: 10)
  - Lower FPS = less bandwidth, smoother on slow networks
  - Higher FPS = smoother animation, more bandwidth
- **Scale Factor**: Pixel size multiplier (1-20, default: 4)
  - 1 = 64x64 pixels (very small on TV)
  - 4 = 256x256 pixels (good default)
  - 8 = 512x512 pixels (larger display)
- **Auto Connect**: Toggle automatic connection

## How It Works

1. **HTTP Server**: The driver starts an Express server that serves:
   - `/frame.jpg` - Current frame as JPEG
   - `/stream.html` - Auto-refreshing HTML page

2. **Discovery**: Uses Bonjour/mDNS to find Chromecast devices on the network

3. **Casting**: Connects to Chromecast and loads the `/stream.html` page

4. **Streaming**: The HTML page auto-refreshes images from `/frame.jpg` at the configured FPS

5. **Rendering**: Each Ledger frame is:
   - Rendered to a Canvas with pixel-perfect scaling
   - Converted to JPEG (85% quality)
   - Served to the Chromecast's browser

## Troubleshooting

### Chromecast Not Discovered

- Ensure Chromecast and computer are on the same network
- Check firewall settings (allow mDNS/UDP port 5353)
- Try specifying the device name instead of auto-discovery
- Increase discovery timeout in the code if needed

### Connection Failed

- Verify HTTP server port is not in use (`netstat -an | grep 8765`)
- Check that your local IP is accessible from the Chromecast
- Try manually specifying your local IP in the constructor

### Poor Performance

- Lower the FPS (try 5-10 FPS for better stability)
- Reduce the scale factor
- Check network bandwidth
- Ensure no other heavy network activity

### Black Screen on TV

- Wait a few seconds for the stream to start
- Check the Ledger console for errors
- Verify the HTTP server is running (`http://YOUR_IP:8765/stream.html` in browser)
- Try reconnecting the Chromecast

## Example Animations

```javascript
// Simple test pattern
render.animationManager.setAnimation("Tests/TestGrid/default")

// Colorful cross
render.animationManager.setAnimation("ReinsCollection/Rainbowcross/default")

// 3D rotating cube
render.animationManager.setAnimation("ReinsCollection/Cube/default")

// Clock display
render.animationManager.setAnimation("ReinsCollection/Clock/default")

// Matrix-style digital rain
render.animationManager.setAnimation("ReinsCollection/Digger/default")
```

## Advanced Usage

### Manual Connection

```javascript
const display = new DisplayChromecast(64, 64, "", 8765, "", false)

// Later, manually connect
await display.connect()
```

### Multiple Chromecasts

```javascript
// You can run multiple instances on different ports
const livingRoom = new DisplayChromecast(64, 64, "Living Room", 8765)
const bedroom = new DisplayChromecast(64, 64, "Bedroom", 8766)
```

### Custom Scaling

```javascript
const display = new DisplayChromecast(64, 64)

// Access scale control
display.settingsControl.controls.get('Scale Factor').text = "8"
```

## Performance Notes

- **Frame Rate**: 10 FPS is a good default for smooth animation with reasonable bandwidth
- **JPEG Quality**: 85% quality balances size and visual quality
- **Network**: Requires ~100-500 KB/s depending on FPS and content complexity
- **Latency**: Expect 200-500ms delay between Ledger render and TV display

## Technical Details

- Uses Google Cast v2 protocol via `castv2-client`
- HTTP/1.1 streaming with Express
- Canvas-based rendering with `node-canvas`
- mDNS service discovery via `bonjour-hap`
- Auto-refreshing HTML with JavaScript image preloading

## Credits

Built on top of the Ledger LED animation framework by ReinVelt.

Uses the following libraries:
- [castv2-client](https://github.com/thibauts/node-castv2-client) by thibauts
- [node-canvas](https://github.com/Automattic/node-canvas) by Automattic
- [bonjour-hap](https://github.com/homebridge/bonjour) by homebridge
- [express](https://expressjs.com/) by the Express team
