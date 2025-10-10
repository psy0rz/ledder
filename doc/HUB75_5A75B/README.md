# HUB75 LED Panel Control with Colorlight 5A-75B

Complete integration package for controlling HUB75 LED matrix panels using the Colorlight 5A-75B receiver card with the Ledder framework.

## ⚠️ Development Status

**This implementation is experimental and currently under active development.** While functional for basic use cases, some features may be incomplete or require further testing. Please use with caution in production environments and be prepared for potential issues.

**Author:** Rein Velt (rein@velt.org)

## 📁 Directory Structure

```
HUB75_5A75B/
├── README.md                    # This file - main overview
├── QUICK-REFERENCE.md           # Quick reference card for common tasks
├── Colorlight-5A-75B-numbers.jpg # PCB component identification image
├── docs/
│   ├── HARDWARE-GUIDE.md       # Hardware specifications and setup
│   ├── FIRMWARE-GUIDE.md       # Complete firmware flashing instructions
│   ├── TROUBLESHOOTING.md      # Common issues and solutions
│   └── PROTOCOL-REFERENCE.md   # Technical protocol details
├── scripts/
│   ├── check-firmware.sh       # Detect firmware compatibility
│   ├── find-ip.sh              # Discover card IP address
│   └── test-panels.js          # Test LED panel functionality
└── examples/
    ├── single-panel.js          # 64x32 single panel config
    ├── four-panels.js           # 2x2 grid (128x64) config
    └── advanced-config.js       # Complex multi-card setups
```

## 🚀 Quick Start

### 1. Hardware Check
- ✅ Test button on 5A-75B produces display on LED panels
- ❌ No network lights blinking when Ethernet connected

If network lights don't blink, you need to flash firmware first!

### 2. Firmware Compatibility Check
```bash
cd HUB75_5A75B/scripts
./check-firmware.sh
```

### 3. Flash Firmware (If Required)
Most cards need compatible firmware. See [`docs/FIRMWARE-GUIDE.md`](docs/FIRMWARE-GUIDE.md)

**Quick summary:**
- Get FT2232H programmer (~$20)
- Download firmware: `wget [firmware-url]`
- Flash: `openfpgaloader -c ft2232 firmware.bit`

### 4. Test Your Setup
```bash
# Find card IP
./scripts/find-ip.sh

# Test 4-panel setup (2x2 grid)
node scripts/test-panels.js 192.168.1.45 128 64
```

### 5. Integration with Ledder
```javascript
// Add to your displayconf.js
import Display5A75B from "./ledder/server/drivers/Display5A75B.js"

export let displayList = [
    new Display5A75B(128, 64, "192.168.1.45", 5568)  // 4-panel 2x2 grid
]
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **[HARDWARE-GUIDE.md](docs/HARDWARE-GUIDE.md)** | Card specs, pinouts, power requirements |
| **[FIRMWARE-GUIDE.md](docs/FIRMWARE-GUIDE.md)** | Complete firmware flashing instructions |
| **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Common problems and solutions |
| **[PROTOCOL-REFERENCE.md](docs/PROTOCOL-REFERENCE.md)** | Technical protocol implementation |

## 🛠️ Scripts & Tools

| Script | Purpose |
|--------|---------|
| **`check-firmware.sh`** | Detect if firmware is compatible |
| **`find-ip.sh`** | Discover card IP address on network |
| **`test-panels.js`** | Test LED panel functionality |

## 📋 Configuration Examples

| Example | Description |
|---------|-------------|
| **`single-panel.js`** | Basic 64x32 panel setup |
| **`four-panels.js`** | 2x2 grid configuration (your setup) |
| **`advanced-config.js`** | Multiple cards, custom layouts |

## 🎯 Supported Configurations

| Setup | Resolution | Panels | Description |
|-------|------------|--------|-------------|
| Single | 64×32 | 1 | Basic indoor panel |
| Single | 64×64 | 1 | High-res panel |
| 2×1 Chain | 128×32 | 2 | Horizontal chain |
| 1×2 Stack | 64×64 | 2 | Vertical stack |
| **2×2 Grid** | **128×64** | **4** | **Your setup** |
| 4×1 Line | 256×32 | 4 | Wide display |
| Maximum | 512×64 | 8 | Full card capacity |

## ⚡ Hardware Requirements

### For the Card:
- **Colorlight 5A-75B** receiver card
- **5V power supply** (2A for card + 2-6A per panel)
- **Ethernet connection** to computer
- **Compatible firmware** (see firmware guide)

### For Firmware Flashing:
- **FT2232H Mini Module** (~$20) or Raspberry Pi
- **Jumper wires** (female-to-female)
- **One-time setup** - firmware stays permanent

### For LED Panels:
- **HUB75 LED matrices** (64×32, 64×64, etc.)
- **HUB75 cables** (short cables <30cm recommended)
- **Adequate power supply** (calculate based on panel count)

## 🔧 Installation Steps

### 1. Install Driver
The driver is already included in the main Ledder codebase:
```
ledder/server/drivers/Display5A75B.ts
```

### 2. Install Tools
```bash
sudo apt update
sudo apt install openfpgaloader arp-scan nmap
```

### 3. Make Scripts Executable
```bash
chmod +x scripts/*.sh
```

## 🎨 Usage Examples

### Basic 4-Panel Setup:
```javascript
import Display5A75B from "./ledder/server/drivers/Display5A75B.js"

const display = new Display5A75B(128, 64, "192.168.1.45", 5568)
// Automatically handles 2x2 panel arrangement
```

### Multiple Cards:
```javascript
const leftDisplay = new Display5A75B(128, 64, "192.168.1.45", 5568)
const rightDisplay = new Display5A75B(128, 64, "192.168.1.46", 5568)
```

### Custom Panel Layout:
```javascript
import OffsetMapper from "./ledder/server/drivers/OffsetMapper.js"

const customLayout = new OffsetMapper(256, 128, false)
// Add individual panels at specific positions
```

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| No network lights | Flash compatible firmware |
| Can't find IP | Use `find-ip.sh` script |
| Flickering panels | Check power supply capacity |
| Wrong colors | Verify panel wiring |
| No display | Check HUB75 connections |

See [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) for detailed solutions.

## 🌐 Resources

### Firmware Projects:
- **[chubby75](https://github.com/q3k/chubby75)** - Main open-source firmware (recommended)
- **[Colorlight FPGA Projects](https://github.com/wuxx/Colorlight-FPGA-Projects)** - Alternative firmware options
- **[OpenFPGALoader](https://trabucayre.github.io/openFPGALoader/)** - FPGA programming tool

### Hardware Documentation:
- **[Colorlight Hardware Info](https://github.com/q3k/chubby75/tree/master/5a-75b)** - PCB details and schematics
- **[HUB75 Protocol](https://learn.adafruit.com/32x16-32x32-rgb-led-matrix)** - LED matrix interface
- **[ECP5 FPGA Docs](https://www.latticesemi.com/Products/FPGAandCPLD/ECP5)** - FPGA specifications

### Programming Tools:
```bash
# Install FPGA programming tools
sudo apt install openfpgaloader openocd

# Flash firmware example
openfpgaloader -c ft2232 firmware.bit
```

### Community Support:
- **EEVblog Forum** - Colorlight 5A-75B discussions
- **Reddit r/FPGA** - Technical community support
- **GitHub Issues** - Project-specific problems

## 📝 Version History

- **v1.0** - Initial release with basic driver
- **v1.1** - Added firmware flashing guide
- **v1.2** - Comprehensive documentation package
- **v1.3** - Organized into dedicated directory structure

## 🤝 Contributing

When contributing improvements:
1. Test with multiple panel configurations
2. Verify compatibility across hardware versions
3. Update documentation for new features
4. Follow existing code patterns
5. Add test cases for new functionality

## 📄 License

This integration follows the same license as the main Ledder project.

---

**💡 Pro Tip:** Once you flash compatible firmware, your 5A-75B card becomes a powerful, low-cost LED controller that works with any UDP-based LED software, not just Ledder!
