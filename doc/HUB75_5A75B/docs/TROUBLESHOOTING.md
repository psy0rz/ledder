# HUB75 5A-75B Troubleshooting Guide

## Quick Diagnosis

Use this flowchart to identify your issue:

```
Issue: No LED display output
├── Test button works?
│   ├── YES → Firmware/network issue
│   │   ├── Network lights blink?
│   │   │   ├── YES → Configuration problem
│   │   │   └── NO → Need firmware flash
│   │   └── Card responds to ping?
│   │       ├── YES → Driver/software issue
│   │       └── NO → IP/network configuration
│   └── NO → Hardware problem
│       ├── Power LED on?
│       │   ├── YES → Card hardware fault
│       │   └── NO → Power supply issue
│       └── Panel power connected?
│           ├── YES → Panel or cable fault
│           └── NO → Connect panel power
```

## Common Issues & Solutions

### 1. No Network Activity (Most Common)

**Symptoms:**
- ✅ Test button produces display on panels (hardware OK)
- ❌ Network LEDs don't blink when Ethernet connected
- ❌ Card doesn't respond to ping
- ❌ `find-ip.sh` script finds no devices

**Diagnosis:**
```bash
./scripts/check-firmware.sh
# If shows "Factory firmware detected" → Need firmware flash
```

**Solution:**
Flash compatible firmware (see [FIRMWARE-GUIDE.md](FIRMWARE-GUIDE.md)):
1. Get FT2232H programmer (~$20)
2. Download firmware: `wget [firmware-url]`
3. Flash: `openfpgaloader -c ft2232 firmware.bit`
4. Verify: Network LEDs should start blinking

---

### 2. Can't Find Card IP Address

**Symptoms:**
- Network lights blink but can't connect
- Card not responding to default IP 192.168.1.45
- Network discovery finds no devices

**Solutions:**

**Method 1: Automatic Discovery**
```bash
./scripts/find-ip.sh
# Scans multiple network ranges and MAC addresses
```

**Method 2: Manual Network Scan**
```bash
# Scan common subnets
nmap -sn 192.168.1.0/24
nmap -sn 192.168.0.0/24
nmap -sn 10.0.0.0/24

# Look for Colorlight MAC addresses (starts with 00:23:C3)
sudo arp-scan --local | grep -i "00:23:c3"
```

**Method 3: Router DHCP List**
- Check your router's admin interface
- Look for devices with MAC starting with 00:23:C3
- Or device names containing "Colorlight"

**Method 4: Network Configuration**
```bash
# Set your computer to same subnet as default card IP
sudo ip addr add 192.168.1.100/24 dev eth0
ping 192.168.1.45
```

---

### 3. Flickering or Unstable Display

**Symptoms:**
- Display flickers or has artifacts
- Colors appear wrong or washed out
- Intermittent display problems

**Power-Related Solutions:**
```bash
# Check power supply capacity
# Required: Card (2A) + Panels (2-6A each @ 5V)
# For 4× 64×32 panels: minimum 80W @ 5V power supply
```

**Cable-Related Solutions:**
- Use short HUB75 cables (<30cm)
- Check all HUB75 connections are secure
- Verify cable quality (some cheap cables cause issues)
- Ensure proper cable routing (away from power cables)

**Configuration Solutions:**
```bash
# Test with single panel first
node scripts/test-panels.js 192.168.1.45 64 32

# If single panel works, gradually add more panels
```

---

### 4. Wrong Colors or Missing Colors

**Symptoms:**
- Red appears green, blue appears red, etc.
- One or more colors completely missing
- Color intensity problems

**Hardware Checks:**
- Verify HUB75 cable wiring (R1/G1/B1/R2/G2/B2 pins)
- Check for loose connections
- Test with known-good HUB75 cable
- Verify panel type matches configuration

**Software Checks:**
```bash
# Test color patterns individually
node scripts/test-panels.js 192.168.1.45 128 64
# Script includes red, green, blue solid color tests
```

**Panel Configuration:**
- Verify panel scan rate (1/8, 1/16, 1/32)
- Check if panel requires different firmware settings
- Some panels have reversed RGB order

---

### 5. Partial Display or Missing Panels

**Symptoms:**
- Only some panels in array work
- Display appears truncated
- Some panels show wrong content

**Configuration Checks:**
```javascript
// Verify panel arrangement matches physical layout
// For 2×2 grid of 64×32 panels:
new Display5A75B(128, 64, "192.168.1.45", 5568)

// Panel mapping:
// [Panel 1] [Panel 2]  ← Top row (64×32 each)
// [Panel 3] [Panel 4]  ← Bottom row (64×32 each)
// Total: 128×64 logical display
```

**Hardware Checks:**
- Verify each panel individually with test button
- Check HUB75 cable connections to each panel
- Ensure all panels have power
- Test panels in different HUB75 output positions

**Panel Numbering:**
```
5A-75B HUB75 Outputs → Panel Positions:
Output 1 → Panel 1 (top-left)
Output 2 → Panel 2 (top-right)  
Output 3 → Panel 3 (bottom-left)
Output 4 → Panel 4 (bottom-right)
```

---

### 6. Performance Issues (Low Frame Rate)

**Symptoms:**
- Slow animation updates
- Visible frame rate drops
- Laggy response to changes

**Network Optimization:**
```bash
# Test network latency
ping -c 10 192.168.1.45

# Check for packet loss
ping -c 100 192.168.1.45 | grep "packet loss"

# Use wired Ethernet (not WiFi)
# Ensure Gigabit connection
ethtool eth0 | grep Speed
```

**Configuration Optimization:**
```javascript
// For high frame rates, use smaller displays
new Display5A75B(64, 32, "192.168.1.45", 5568)  // Higher FPS

// Large displays = lower max FPS  
new Display5A75B(256, 128, "192.168.1.45", 5568) // Lower FPS
```

**System Resources:**
- Check CPU usage during rendering
- Monitor network bandwidth utilization
- Consider multiple cards for very large displays

---

### 7. Firmware Flash Problems

**Symptoms:**
- JTAG programmer not detected
- Firmware flash fails
- Card becomes unresponsive after flash

**Connection Issues:**
```bash
# Test JTAG connection
openfpgaloader -c ft2232 --detect
# Should show: "LFE5U-25F" or similar

# Common fixes:
# - Check all wire connections (especially GND)
# - Verify 5A-75B is powered during programming
# - Try different JTAG speed: --freq 1000000
```

**Programming Issues:**
```bash
# Erase before programming
openfpgaloader -c ft2232 --erase-flash

# Try verbose mode for errors
openfpgaloader -c ft2232 --verbose firmware.bit

# Force FPGA part specification
openfpgaloader -c ft2232 --fpga-part LFE5U-25F firmware.bit
```

**Recovery from Bad Flash:**
```bash
# JTAG recovery mode
openfpgaloader -c ft2232 --reset --fpga-part LFE5U-25F

# Complete recovery procedure
openfpgaloader -c ft2232 --erase-flash --fpga-part LFE5U-25F
openfpgaloader -c ft2232 --fpga-part LFE5U-25F good_firmware.bit
```

---

### 8. Multiple Card Setup Issues

**Symptoms:**
- Some cards work, others don't
- IP address conflicts
- Uneven performance across cards

**Network Configuration:**
```bash
# Ensure unique IP addresses for each card
# Card 1: 192.168.1.45
# Card 2: 192.168.1.46
# etc.

# Test each card individually
ping 192.168.1.45
ping 192.168.1.46
```

**Daisy-Chain Setup:**
```
Computer → Card1 Port1 → Card1 Port2 → Card2 Port1 → Card2 Port2 → etc.
```
- Each card still needs unique IP
- Use Port1 (INPUT) for first connection
- Use Port2 (OUTPUT) for pass-through

---

## Diagnostic Commands

### Network Diagnostics:
```bash
# Test basic connectivity
ping 192.168.1.45

# Check UDP port accessibility  
nc -u -z -v 192.168.1.45 5568

# Monitor network traffic
sudo tcpdump -i eth0 host 192.168.1.45

# Check Ethernet link status
ethtool eth0
```

### Hardware Diagnostics:
```bash
# Test with minimal configuration
node scripts/test-panels.js 192.168.1.45 32 16

# Progressive testing
# 1. Single small panel
# 2. Single large panel  
# 3. Multiple panels
# 4. Full configuration
```

### Firmware Diagnostics:
```bash
# Check JTAG programmer
openfpgaloader --list-cables

# Detect FPGA
openfpgaloader -c ft2232 --detect

# Verify firmware file
file firmware.bit
```

## Emergency Recovery

### Complete System Reset:
```bash
# 1. Power off everything
# 2. Disconnect all cables
# 3. Power on 5A-75B only
# 4. Test with single panel
# 5. Gradually reconnect components
```

### Factory Reset Sequence:
```bash
# Hardware reset (if firmware allows network access)
# 1. Power off card
# 2. Hold reset button on PCB
# 3. Power on while holding reset
# 4. Hold for 15 seconds, release
# 5. Card should reset to 192.168.1.45
```

### Firmware Recovery:
If card becomes completely unresponsive:
1. Double-check JTAG connections
2. Try lower JTAG frequency: `--freq 100000`
3. Use recovery firmware if available
4. Consider professional recovery service

## Getting Help

### Information to Gather:
- Hardware version (v7.0 or v8.0)
- Firmware file used
- Panel configuration (size, count, arrangement)
- Power supply specifications
- Network setup details
- Error messages (exact text)

### Community Resources:
- **EEVblog Forum**: Colorlight 5A-75B discussions
- **Reddit r/FPGA**: Technical community support
- **GitHub Issues**: Project-specific problems
- **Discord/Slack**: Real-time community help

### Professional Support:
For commercial installations or complex issues:
- FPGA consulting services
- Professional LED display installers
- Electronics repair services with FPGA experience

---

**💡 Pro Tips:**
- Always test with single panel first
- Keep spare HUB75 cables for troubleshooting
- Document working configurations
- Use adequate power supplies
- Plan for cooling in enclosed installations
