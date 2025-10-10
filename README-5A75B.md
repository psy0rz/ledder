# Colorlight 5A-75B Integration for Ledder

This directory contains a complete driver implementation for the Colorlight 5A-75B LED receiver card, enabling control of HUB75 LED matrix panels through the Ledder framework.

## 🚨 CRITICAL FIRST STEP: Check Your Firmware

### **Signs You Need to Flash Firmware FIRST:**
- ✅ Test button on card produces display output on panels
- ❌ **No network activity lights when connected to computer**
- ❌ Card doesn't respond to ping or network discovery
- ❌ Ethernet port LEDs remain dark/don't blink

**This means you have factory firmware that doesn't support network control!**

Most 5A-75B cards ship with **proprietary firmware** that only works with Colorlight's commercial software. You **MUST** flash open-source firmware before using with Ledder.

### **Quick Firmware Check:**
```bash
# Run the firmware compatibility check
./check-firmware.sh

# If it says "Factory firmware detected", continue with flashing guide below
```

## Quick Start (After Firmware is Compatible)

### 1. Hardware Setup
```
Computer → Ethernet → 5A-75B Card → HUB75 Cables → LED Panels → 5V Power Supply
```

**Important: 5A-75B has 2 Ethernet ports**
- **Port 1 (INPUT)**: Connect your computer/network here - this is the main data port
- **Port 2 (OUTPUT)**: Used for daisy-chaining multiple cards or pass-through (optional)
- **Use Port 1** for single card setups - it's usually labeled or closest to the power connector

### 2. Finding Your 5A-75B Card's IP Address

**Method 1: Default IP (Most Common)**
```bash
# Most 5A-75B cards come with default IP: 192.168.1.45
# Set your computer to the same subnet first:
sudo ip addr add 192.168.1.100/24 dev eth0

# Test if the default IP works:
ping 192.168.1.45
```

**Method 2: Network Scan**
```bash
# Scan your local network for the card
nmap -sn 192.168.1.0/24

# Or use arp-scan (more reliable for finding MAC addresses)
sudo arp-scan --local

# Look for MAC addresses starting with: 00:23:C3 (Colorlight vendor)
```

**Method 3: Router/DHCP Logs**
```bash
# Check your router's DHCP client list
# Look for devices with names like "Colorlight" or MAC starting with 00:23:C3
```

**Method 4: Wireshark/tcpdump**
```bash
# Monitor network traffic when the card boots up
sudo tcpdump -i eth0 arp

# Power cycle the 5A-75B and watch for ARP announcements
```

### 3. Network Configuration
```bash
# Once you find the IP, test connectivity
ping [CARD_IP_ADDRESS]

# Example with default IP:
ping 192.168.1.45
```

### 3. Basic Usage
```javascript
import Display5A75B from "./ledder/server/drivers/Display5A75B.js"

// For 4x 64x32 panels in 2x2 grid (recommended)
const display = new Display5A75B(128, 64, "192.168.1.45", 5568);

// Alternative: Single 64x32 panel
// const display = new Display5A75B(64, 32, "192.168.1.45", 5568);

// Add to your displayconf.js
export let displayList = [display]
```

## Files in this Integration

### Core Driver Files
- **`Display5A75B.ts`** - Main driver implementation
- **`Colorlight-5A-75B-driver.md`** - Comprehensive documentation

### Configuration Examples  
- **`displayconf-5a75b-example.js`** - Complete configuration examples
- **`displayconf-example.js`** - Updated with 5A-75B import

### Testing & Discovery
- **`test-5a75b.js`** - Standalone test script for driver validation
- **`find-5a75b-ip.sh`** - Script to discover your card's IP address
- **`check-firmware.sh`** - Check if firmware is compatible
- **`5A75B-FIRMWARE-GUIDE.md`** - Complete firmware flashing guide
- **`5A75B-RESET-GUIDE.md`** - Complete factory reset instructions

## Supported Configurations

| Configuration | Resolution | Panels | Description |
|---------------|------------|--------|-------------|
| Single Panel | 64×32 | 1 | Most common indoor panel |
| Single Panel | 64×64 | 1 | Higher resolution panel |
| Horizontal Chain | 128×32 | 2 | Two panels side by side |
| Vertical Chain | 64×64 | 2 | Two panels stacked |
| **2×2 Grid** | **128×64** | **4** | **Your setup - recommended!** |
| 4×1 Horizontal | 256×32 | 4 | Four panels in line |
| 1×4 Vertical | 64×128 | 4 | Four panels stacked |
| Maximum | 512×64 | 8 | Full 5A-75B capacity |

## Testing Your Setup

### Flash Compatible Firmware (Required for Most Cards)

**Most 5A-75B cards need firmware flashing before they work with Ledder!**

```bash
# 1. Check if your firmware is compatible
./check-firmware.sh

# 2. If it says "Factory firmware detected", you need to flash:
# - Get FT2232H programmer (~$20)
# - Download firmware: 
wget https://github.com/q3k/chubby75/releases/latest/download/5a-75b_v8.0.bit
# - Flash: 
openfpgaloader -c ft2232 5a-75b_v8.0.bit

# 3. Verify network lights start blinking
ping 192.168.1.45
```

**See `5A75B-FIRMWARE-GUIDE.md` for complete flashing instructions**

### Reset Card to Factory Defaults (If Network Already Works)

**Hardware Reset Method:**
```bash
# 1. Power off the 5A-75B card
# 2. Locate small reset button on PCB (labeled RST/RESET)
# 3. Hold reset button while powering on
# 4. Keep holding for 10-15 seconds after power-on
# 5. Release - card resets to IP 192.168.1.45
```

### Find Your Card's IP Address
```bash
# Run the IP discovery script
./find-5a75b-ip.sh

# Or with root privileges for more thorough scanning
sudo ./find-5a75b-ip.sh
```

### Quick Test
```bash
# Test your 4-panel setup (2x2 grid)
node test-5a75b.js [YOUR_CARD_IP] 128 64

# Test with default IP
node test-5a75b.js 192.168.1.45 128 64

# Test single panel
node test-5a75b.js [YOUR_CARD_IP] 64 32
```

### Integration Test
```bash
# Start Ledder with 5A-75B configuration
npm start
```

## Troubleshooting

### Common Issues

**Can't Find Card IP Address:**
```bash
# First try: Reset card to factory defaults (IP: 192.168.1.45)
# See "Reset Card to Factory Defaults" section above

# Method 1: Scan for Colorlight devices by MAC address
sudo arp-scan --local | grep -i "00:23:c3"

# Method 2: Full network scan
nmap -sn 192.168.1.0/24
nmap -sn 192.168.0.0/24  # Try different subnets
nmap -sn 10.0.0.0/24

# Method 3: Check specific ports (5A-75B usually responds on port 5568)
nmap -p 5568 192.168.1.1-254

# Method 4: Monitor ARP traffic during boot
sudo tcpdump -i eth0 arp &
# Now power cycle your 5A-75B card
```

**No Display Output:**
```bash
# Check network connectivity
ping [YOUR_CARD_IP]

# Verify UDP port is open
nmap -p 5568 [YOUR_CARD_IP]
```

**Wrong Ethernet Port:**
- Use **Port 1** (INPUT port) - usually closest to power connector
- Port 2 is for daisy-chaining multiple cards
- Check card labeling or try both ports if unsure

**Flickering/Artifacts:**
- Check 5V power supply capacity (2-6A per 64×32 panel)
- Verify HUB75 cable connections
- Use shorter cables (<30cm) for better signal quality

**Wrong Colors:**
- Check panel RGB channel wiring
- Verify scan rate configuration in firmware
- Test with different gamma correction settings

**Performance Issues:**
- Reduce frame rate for large displays
- Use wired Ethernet connection
- Monitor network latency

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=5a75b node your-app.js
```

## Firmware Requirements

The 5A-75B card requires compatible firmware to accept pixel data over Ethernet:

### Recommended Firmware
- **josh132 firmware**: https://github.com/q3k/chubby75
- **Colorlight tools**: https://github.com/wuxx/Colorlight-FPGA-Projects

### Installation
```bash
# Install OpenFPGALoader
sudo apt install openfpgaloader

# Flash firmware (example)
openfpgaloader -c ft232 firmware.bit
```

## Advanced Configuration

### Multiple Cards

**Option 1: Separate Network Connections**
```javascript
// Each card on separate IP addresses
displayList.push(new Display5A75B(128, 64, "192.168.1.45", 5568)) // Card 1
displayList.push(new Display5A75B(128, 64, "192.168.1.46", 5568)) // Card 2
```

**Option 2: Daisy-Chain Connection**
```
Computer → Card 1 Port 1 → Card 1 Port 2 → Card 2 Port 1 → Card 2 Port 2 → etc.
```
- Connect computer to first card's Port 1
- Use Port 2 of each card to connect to Port 1 of next card
- Each card still needs unique IP address
- Reduces network switch requirements

### Custom Panel Layouts
```javascript
import OffsetMapper from "./ledder/server/drivers/OffsetMapper.js"

// Non-standard panel arrangement
let customLayout = new OffsetMapper(192, 64, false)
customLayout.addDisplay(new Display5A75B(64, 32, "192.168.1.45"), 0, 0)
customLayout.addDisplay(new Display5A75B(64, 32, "192.168.1.45"), 64, 0)
customLayout.addDisplay(new Display5A75B(64, 32, "192.168.1.45"), 128, 0)
```

### Performance Tuning
```javascript
// High refresh rate for small panels
const highFPS = new Display5A75B(32, 32, "192.168.1.45", 5568)

// Large display with moderate refresh rate  
const largeLED = new Display5A75B(256, 128, "192.168.1.45", 5568)
```

## Technical Specifications

- **Maximum Resolution**: 512×64 pixels (8 panels)
- **Color Depth**: 24-bit RGB (8 bits per channel) 
- **Refresh Rate**: 60-120 Hz (depending on panel size)
- **Communication**: UDP over Ethernet
- **Latency**: <1ms over Ethernet
- **Power**: 2A @ 5V (card only, panels require additional power)

## Contributing

When contributing improvements:

1. Test with multiple panel configurations
2. Verify performance under different network conditions  
3. Document any new panel compatibility
4. Follow existing code patterns in the Ledder framework
5. Update this README with new features

## Support

For issues specific to the 5A-75B driver:
1. Check the troubleshooting section above
2. Run the test script to isolate problems
3. Verify hardware connections and firmware compatibility
4. Check Ledder framework logs for detailed error messages

For general Ledder framework support, refer to the main project documentation.
