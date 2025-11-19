# IDM 64x64 Display Driver for Ledder

This is a display driver for the **IDM 64x64 LED Matrix Display** that integrates with Ledder.

## Hardware

- IDM 64x64 pixel LED matrix display ([Aliexpress link](https://de.aliexpress.com/item/1005006105517779.html))
- Bluetooth connectivity

## Requirements

### Python Dependencies

The driver uses the [idotmatrix-api-client](https://github.com/markusressel/idotmatrix-api-client) Python library to communicate with the display.

Install it using:

```bash
pip install idotmatrix-api-client
```

Or using poetry:

```bash
poetry add idotmatrix-api-client
```

### System Requirements

- Python 3.8 or higher
- Bluetooth support (bluez on Linux)
- Node.js/TypeScript for Ledder

## Installation

1. Ensure the Python dependencies are installed:
   ```bash
   pip install idotmatrix-api-client
   ```

2. The driver files are located in:
   - `ledder/server/drivers/DisplayIDM64x64.ts` - TypeScript driver
   - `ledder/server/drivers/idm_bridge.py` - Python bridge

## Usage

### Basic Usage

In your Ledder server configuration, import and use the driver:

```typescript
import { DisplayIDM64x64 } from "./ledder/server/drivers/DisplayIDM64x64.js"

// Create display instance
const display = new DisplayIDM64x64(
    "AA:BB:CC:DD:EE:FF",  // MAC address (optional - auto-discover if omitted)
    false,                 // flipX
    false,                 // flipY
    true                   // autoConnect
);
```

### Auto-Discovery

If you don't know the MAC address of your display, you can omit it and the driver will auto-discover the first available IDM display:

```typescript
const display = new DisplayIDM64x64();
```

### Configuration Options

- **macAddress** (string, optional): Bluetooth MAC address of your display
- **flipX** (boolean): Flip the display horizontally
- **flipY** (boolean): Flip the display vertically
- **autoConnect** (boolean): Automatically connect on startup

## How It Works

The driver uses a bridge architecture:

1. **DisplayIDM64x64.ts** (TypeScript)
   - Implements Ledder's Display interface
   - Manages frame buffer and pixel rendering
   - Spawns a Python bridge process

2. **idm_bridge.py** (Python)
   - Communicates with the IDM display via Bluetooth
   - Uses the idotmatrix-api-client library
   - Receives frame data via stdin (JSON)
   - Sends pixel data to the display

### Data Flow

```
Ledder → DisplayIDM64x64.ts → JSON over stdin → idm_bridge.py → Bluetooth → IDM Display
```

## Troubleshooting

### Connection Issues

If the display doesn't connect:

1. Check Bluetooth is enabled:
   ```bash
   bluetoothctl power on
   ```

2. Find your display's MAC address:
   ```bash
   bluetoothctl scan on
   # Look for "iDotMatrix" or similar
   ```

3. Test the Python bridge manually:
   ```bash
   python3 ledder/server/drivers/idm_bridge.py --mac AA:BB:CC:DD:EE:FF
   ```

### Performance

- The display supports up to ~60 FPS
- Frame data is sent via Bluetooth which may introduce latency
- For best performance, use simpler animations

### Logging

The Python bridge outputs logs to stderr. You can adjust the log level in `idm_bridge.py`:

```python
logging.basicConfig(level=logging.DEBUG)  # More verbose
logging.basicConfig(level=logging.WARNING)  # Less verbose
```

## Example Configuration

Here's a complete example of using the IDM display with Ledder:

```typescript
import { DisplayIDM64x64 } from "./ledder/server/drivers/DisplayIDM64x64.js"
import RenderRealtime from "./ledder/server/RenderRealtime.js"

// Create display
const display = new DisplayIDM64x64("AA:BB:CC:DD:EE:FF");

// Set brightness (5-100%)
await display.gammaMapper.setBrightness(50);

// Create renderer
const renderer = new RenderRealtime(display);

// Your Ledder animations will now render to the IDM display!
```

## Credits

- Based on [ledder](https://github.com/ReinVelt/ledder) by ReinVelt
- Uses [idotmatrix-api-client](https://github.com/markusressel/idotmatrix-api-client) by markusressel
- IDM display reverse engineering by the idotmatrix-api-client contributors

## License

Same as Ledder project.
