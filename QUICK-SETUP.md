# Quick Setup for Your 5A-75B Card

## Your Current Situation
- ✅ Test button works → Hardware is functional
- ❌ No network lights blinking → Factory firmware (incompatible)
- 🎯 Goal: Control 4x 64x32 LED panels

## What You Need to Do

### Step 1: Verify Diagnosis
```bash
./check-firmware.sh
```
This will confirm you have factory firmware that needs to be replaced.

### Step 2: Get Hardware for Flashing
**You need a JTAG programmer. Recommended option:**
- **FT2232H Mini Module** (~$15-25)
- 6x female-to-female jumper wires
- Available on Amazon/AliExpress: search "FT2232H mini module"

### Step 3: Download Firmware
```bash
# Download compatible firmware
wget https://github.com/q3k/chubby75/releases/latest/download/5a-75b_v8.0.bit

# Install flashing tools
sudo apt install openfpgaloader
```

### Step 4: Physical Connections
Connect FT2232H to 5A-75B JTAG pins:
```
FT2232H    →    5A-75B JTAG (8-pin header near FPGA)
AD0 (TCK)  →    Pin 7 (TCK)
AD1 (TDI)  →    Pin 2 (TDI)
AD2 (TDO)  →    Pin 1 (TDO)  
AD3 (TMS)  →    Pin 3 (TMS)
GND        →    Pin 4 (GND)
```

### Step 5: Flash Firmware
```bash
# Test connection
openfpgaloader -c ft2232 --detect

# Flash firmware
openfpgaloader -c ft2232 5a-75b_v8.0.bit
```

### Step 6: Verify Success
After flashing:
```bash
# Network lights should now blink when Ethernet connected
# Test connectivity
ping 192.168.1.45

# Test LED panels
node test-5a75b.js 192.168.1.45 128 64
```

## Expected Results
- ✅ Network LEDs start blinking
- ✅ Card responds to ping at 192.168.1.45  
- ✅ Test patterns appear on your 4 LED panels
- ✅ Ready to use with Ledder!

## Alternative: If You Have a Raspberry Pi
You can use a Raspberry Pi instead of FT2232H:
- Connect Pi GPIO pins to 5A-75B JTAG
- Use same firmware file
- See `5A75B-FIRMWARE-GUIDE.md` for Pi-specific instructions

## Time Estimate
- Ordering programmer: 3-7 days shipping
- Actual flashing process: 30 minutes
- **One-time process** - firmware stays permanently after flashing

## Why This is Necessary
Factory 5A-75B cards come with Colorlight's proprietary firmware that only works with their commercial software. The open-source chubby75 firmware enables:
- UDP network control
- Integration with Ledder and other DIY projects  
- Full control over LED panel timing and colors
- Support for various panel configurations

## Cost Breakdown
- FT2232H programmer: ~$20 (one-time purchase, reusable)
- Jumper wires: ~$5 (if you don't have them)
- **Total**: ~$25 for the capability to flash any 5A-75B card

This is a standard requirement for using 5A-75B cards in DIY projects - you're not doing anything wrong, this is just how these cards work!
