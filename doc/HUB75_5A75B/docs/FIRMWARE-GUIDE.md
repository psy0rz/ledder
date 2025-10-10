# 5A-75B Firmware Flashing Guide

## Why You Need This

**Factory 5A-75B cards come with proprietary firmware** that only works with Colorlight's commercial LED control software. To use it with Ledder, open-source projects, or any DIY LED control, you **must** flash compatible open-source firmware.

## Diagnosis: Do You Need to Flash Firmware?

### **Symptoms of Factory/Incompatible Firmware:**
- ✅ Test button on card produces display output on LED panels (hardware works)
- ❌ **No network activity lights when Ethernet cable connected**  
- ❌ Card doesn't respond to ping `192.168.1.45`
- ❌ Network discovery finds no devices
- ❌ Ethernet port LEDs remain dark/don't blink

### **Quick Check:**
```bash
# Run the firmware compatibility checker
./check-firmware.sh

# If output shows "Factory firmware detected", continue with this guide
```

## What You Need

### **Hardware Requirements (Choose One Option):**

#### **Option A: FTDI JTAG Programmer (Recommended)**
- **FT2232H Mini Module** (~$15-25)
- Female-to-female jumper wires (6 wires needed)
- Available: Amazon, AliExpress, Adafruit, Digikey

#### **Option B: Raspberry Pi (If You Have One)**
- Any Raspberry Pi with GPIO pins
- Female-to-female jumper wires
- Free if you already own a Pi

#### **Option C: Other JTAG Programmers**
- Any OpenOCD-compatible JTAG adapter
- Bus Pirate, J-Link, etc.

### **Software Requirements:**
```bash
# Install required tools
sudo apt update
sudo apt install openfpgaloader openocd git wget

# Verify installation
openfpgaloader --help
```

## Step 1: Get Compatible Firmware

### **Option A: Download Pre-built (Easiest)**
```bash
# Download latest chubby75 firmware for 5A-75B v8.0
wget https://github.com/q3k/chubby75/releases/latest/download/5a-75b_v8.0.bit

# Or for v7.0 hardware (check your board version)
wget https://github.com/q3k/chubby75/releases/latest/download/5a-75b_v7.0.bit

# Verify download
ls -la *.bit
```

### **Option B: Build from Source**
```bash
# Clone the chubby75 project
git clone https://github.com/q3k/chubby75.git
cd chubby75/5a-75b

# Check available hardware versions
ls hardware_*

# Build for your hardware version (most common is v8.0)
cd hardware_v8.0
make

# Built firmware will be in: build/top.bit
```

## Step 2: Physical Connections

### ** Default JTAG pin Location on 5A-75B: **
First read: https://github.com/kholia/Colorlight-5A-75B/blob/master/README.md. The rest of this hardware pins section canbe/maybe obsolete
```
|-------|------|
| J30   | TDO  |
| J29   | TDI  |
| J28   | TMS  |
| J27   | TCK  |
|-------|------|
```

### **Alternative JTAG Pin Location on 5A-75B:**
```
5A-75B PCB JTAG Header (usually near FPGA chip):
┌─────────────────┐
│ ○ ○ ○ ○ ○ ○ ○ ○ │  ← 8-pin header
└─────────────────┘
  1 2 3 4 5 6 7 8

Pin 1: TDO    Pin 5: (unused)
Pin 2: TDI    Pin 6: (unused)  
Pin 3: TMS    Pin 7: TCK
Pin 4: GND    Pin 8: (unused)
```

### **Method A: FT2232H Connections**
```
FT2232H Module  →  5A-75B JTAG
AD0 (TCK)       →  Pin 7 (TCK)
AD1 (TDI)       →  Pin 2 (TDI)  
AD2 (TDO)       →  Pin 1 (TDO)
AD3 (TMS)       →  Pin 3 (TMS)
GND             →  Pin 4 (GND)
```

### **Method B: Raspberry Pi Connections**
```
Raspberry Pi    →  5A-75B JTAG
GPIO 8 (CE0)    →  Pin 2 (TDI)
GPIO 9 (MISO)   →  Pin 1 (TDO)
GPIO 10 (MOSI)  →  Pin 7 (TCK)
GPIO 11 (SCLK)  →  Pin 3 (TMS)
GND             →  Pin 4 (GND)
```

## Step 3: Flash the Firmware

### **Method A: Using FT2232H**

**Power Setup:**
1. **Disconnect power** from 5A-75B completely
2. Connect JTAG wires as shown above
3. **Power on** the 5A-75B (programmer gets power from USB)

**Flash Command:**
```bash
# Detect the FPGA (verify connections)
openfpgaloader -c ft2232 --detect

# Should show: "LFE5U-25F" or similar

# Flash the firmware
openfpgaloader -c ft2232 --fpga-part LFE5U-25F 5a-75b_v8.0.bit

# Verify programming
openfpgaloader -c ft2232 --verify 5a-75b_v8.0.bit
```

### **Method B: Using Raspberry Pi**

**Create OpenOCD Config:**
```bash
# Create Pi JTAG configuration
cat > 5a75b-pi.cfg << 'EOF'
# Raspberry Pi GPIO JTAG configuration for 5A-75B
interface bcm2835gpio
bcm2835gpio_peripheral_base 0x3F000000
bcm2835gpio_speed_coeffs 113714 28

# GPIO assignments
bcm2835gpio_jtag_nums 11 10 9 8

# Target configuration  
set CHIPNAME 5a75b
set ENDIAN little

# FPGA TAP
jtag newtap $CHIPNAME tap -irlen 8 -expected-id 0x21111043

target create $CHIPNAME.tap testee -chain-position $CHIPNAME.tap
EOF

# Flash with OpenOCD
sudo openocd -f 5a75b-pi.cfg -c "init; svf 5a-75b_v8.0.svf; shutdown"
```

**Alternative Pi Method with openfpgaloader:**
```bash
# Configure Pi for JTAG
echo "bcm2835-gpiomem" | sudo tee -a /etc/modules

# Flash (may require GPIO permissions)
sudo openfpgaloader -c raspberrypi 5a-75b_v8.0.bit
```

## Step 4: Verify Success

### **Physical Indicators:**
After successful flashing, you should see:
- ✅ **Network LEDs start blinking** when Ethernet connected
- ✅ **Power LED remains on**
- ✅ **Card responds to network activity**

### **Network Test:**
```bash
# Power cycle the 5A-75B card completely
# Connect Ethernet cable to Port 1

# Test network connectivity
ping 192.168.1.45

# Should respond! If yes, firmware flash was successful
```

### **LED Panel Test:**
```bash
# Test with your 4-panel setup
node test-panels.js 192.168.1.45 128 64

# You should see test patterns on your LED panels!
```

## Troubleshooting

### **Connection Issues:**
```bash
# JTAG detection fails
openfpgaloader -c ft2232 --detect

# Common fixes:
# - Check wire connections (especially GND)
# - Verify 5A-75B is powered during programming
# - Try different JTAG speed: --freq 1000000
```

### **Programming Errors:**
```bash
# If programming fails:
# 1. Check FPGA part number matches
openfpgaloader -c ft2232 --fpga-part LFE5U-25F --verbose 5a-75b_v8.0.bit

# 2. Try erasing first
openfpgaloader -c ft2232 --erase-flash

# 3. Then reprogram
openfpgaloader -c ft2232 5a-75b_v8.0.bit
```

### **Still No Network After Flashing:**
```bash
# Verify firmware version matches hardware
# Check if you have v7.0 or v8.0 hardware:
# - Look for markings on PCB
# - v8.0 is more common (newer)

# Try the other firmware version:
wget https://github.com/q3k/chubby75/releases/latest/download/5a-75b_v7.0.bit
openfpgaloader -c ft2232 5a-75b_v7.0.bit
```

## Hardware Version Identification

### **5A-75B Version Differences:**
- **v7.0**: Older revision, some component differences
- **v8.0**: Current revision, most common
- **Check PCB markings** for version number

### **Wrong Version Symptoms:**
- Firmware flashes successfully but no network activity
- Try the other version's firmware if first doesn't work

## Alternative Firmware Options

### **Other Compatible Firmware:**
```bash
# LiteX-based firmware
git clone https://github.com/enjoy-digital/colorlight_5a_75b.git

# Custom UDP receiver firmware
git clone https://github.com/wuxx/Colorlight-FPGA-Projects.git
```

## Recovery from Bad Flash

### **If Card Becomes Unresponsive:**
```bash
# Try JTAG recovery mode
openfpgaloader -c ft2232 --reset --fpga-part LFE5U-25F

# Force erase and reprogram
openfpgaloader -c ft2232 --erase-flash --fpga-part LFE5U-25F
openfpgaloader -c ft2232 --fpga-part LFE5U-25F 5a-75b_v8.0.bit
```

### **Complete Recovery:**
If completely bricked:
1. Double-check all JTAG connections
2. Verify programmer works with `--detect`
3. Try lower JTAG frequency: `--freq 100000`
4. Consider professional recovery service

## Success Checklist

After successful firmware flashing:
- [ ] Network LEDs blink when Ethernet connected
- [ ] `ping 192.168.1.45` responds
- [ ] `./check-firmware.sh` shows "compatible"
- [ ] `node test-panels.js 192.168.1.45 128 64` displays test patterns
- [ ] Ready to use with Ledder framework!

## Firmware Resources

### **Download Links:**
- **chubby75 releases**: https://github.com/q3k/chubby75/releases
- **Hardware documentation**: https://github.com/q3k/chubby75/tree/master/5a-75b
- **Colorlight FPGA projects**: https://github.com/wuxx/Colorlight-FPGA-Projects

### **Community Support:**
- **EEVblog Forum**: Colorlight 5A-75B threads
- **Reddit r/FPGA**: Community discussions
- **GitHub Issues**: Project-specific support

---

**⚠️ Important Safety Notes:**
- Always power off card before connecting JTAG
- Double-check connections before applying power
- Use anti-static precautions when handling PCBs
- Keep backup of original firmware if possible

**💡 Pro Tip:** Once you have compatible firmware, the card will retain it permanently. You only need to flash once, then you can use it with any UDP-based LED control software!
