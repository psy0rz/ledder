# Colorlight 5A-75B Factory Reset Guide

This guide explains how to reset your 5A-75B card to factory defaults when it's not responding or has been configured with unknown settings.

## When to Reset

Reset your card if:
- ❌ Card doesn't respond to network discovery
- ❌ Unknown IP address or network configuration
- ❌ Custom firmware causing issues
- ❌ Card was previously configured by someone else
- ❌ Network settings were changed and forgotten
- ❌ Panels not displaying correctly after firmware changes

## Reset Methods

### Method 1: Hardware Reset (Recommended)

This is the most reliable method and works regardless of firmware state.

**Steps:**
1. **Power off** the 5A-75B card completely
   - Unplug power connector or turn off power supply
   - Wait 10 seconds for capacitors to discharge

2. **Locate the reset button**
   - Small tactile button on the PCB
   - Usually labeled "RST", "RESET", or unmarked
   - Often near the FPGA chip or power connector
   - May require a paperclip or small tool to press

3. **Perform reset sequence**
   - Press and **hold the reset button**
   - While holding, **power on** the card
   - **Continue holding** for 10-15 seconds after power-on
   - **Release the button**

4. **Verify reset**
   - Card should now be at default IP: `192.168.1.45`
   - Test: `ping 192.168.1.45`

**Visual Indicators:**
- LEDs may flash during reset sequence
- Some cards show different LED patterns after successful reset
- Network activity LEDs should become active

### Method 2: Firmware Reflash Reset

If you have programming hardware (JTAG/SPI programmer):

**Requirements:**
- FT232H, FT2232H, or similar FPGA programmer
- OpenFPGALoader or similar tool
- Factory firmware file

**Steps:**
```bash
# Install OpenFPGALoader
sudo apt install openfpgaloader

# Flash factory firmware (erases all settings)
openfpgaloader -c ft232 --reset factory_5a75b.bit

# Verify programming
openfpgaloader -c ft232 --detect
```

**Factory Firmware Sources:**
- Original Colorlight firmware (if available)
- Clean josh132 firmware build
- Community firmware repositories

### Method 3: Network Reset (Firmware Dependent)

Some custom firmware supports network-based reset commands:

```bash
# Magic reset packet (may work with some firmware)
echo -e '\x5A\x75\x42\xFF\xFF\xFF\xFF\xFF' | nc -u [CURRENT_IP] 5568

# Alternative reset commands (firmware-specific)
curl -X POST http://[CURRENT_IP]:8080/reset
# or
telnet [CURRENT_IP] 23
# then send: reset_to_defaults
```

**Note:** Network reset only works if you know the current IP and the firmware supports it.

## After Reset

### Default Settings After Reset:
- **IP Address**: `192.168.1.45`
- **Subnet Mask**: `255.255.255.0` (`/24`)
- **UDP Port**: `5568`
- **Firmware**: Factory default or clean firmware

### Verification Steps:
```bash
# 1. Test network connectivity
ping 192.168.1.45

# 2. Check UDP port
nmap -p 5568 192.168.1.45

# 3. Run discovery script
./find-5a75b-ip.sh

# 4. Test with LED panels
node test-5a75b.js 192.168.1.45 128 64
```

## Troubleshooting Reset Issues

### Reset Button Not Working:
- **Check button location** - may be hidden under components
- **Use proper tool** - paperclip, toothpick, or small screwdriver
- **Hold longer** - some cards need 20+ seconds
- **Try multiple times** - reset sequence may need repetition

### Still No Network Response:
- **Check power supply** - ensure stable 5V, adequate current
- **Try different Ethernet port** - use Port 1 (INPUT)
- **Check Ethernet cable** - try known good cable
- **Computer network settings** - ensure same subnet
- **LED indicators** - look for signs of life on the card

### Firmware Issues:
- **Corrupted firmware** - may need programmer to recover
- **Wrong firmware** - ensure 5A-75B specific firmware
- **Hardware failure** - card may need replacement

## Network Configuration After Reset

Set your computer to the same subnet:
```bash
# Temporary network configuration
sudo ip addr add 192.168.1.100/24 dev eth0

# Or permanent via network manager
nmcli con mod [connection_name] ipv4.addresses 192.168.1.100/24
nmcli con up [connection_name]
```

## Recovery from Hard Brick

If the card is completely unresponsive:

1. **JTAG Recovery** (requires hardware programmer)
   - Connect JTAG programmer to card
   - Flash known good firmware
   - May require opening the card case

2. **SPI Flash Recovery**
   - Direct programming of SPI flash chip
   - Requires desoldering or clip-on programmer
   - Last resort method

3. **Professional Recovery**
   - Contact manufacturer or experienced technician
   - May involve specialized equipment

## Prevention

To avoid needing factory reset:
- **Document settings** - keep record of IP changes
- **Backup firmware** - save working firmware files
- **Test carefully** - verify changes before deploying
- **Use version control** - track firmware modifications

## Support Resources

- **Hardware documentation**: https://github.com/q3k/chubby75
- **Firmware projects**: https://github.com/wuxx/Colorlight-FPGA-Projects
- **Community forums**: EEVblog, Reddit r/FPGA
- **OpenFPGALoader docs**: https://trabucayre.github.io/openFPGALoader/

---

**⚠️ Important:** Always ensure proper power supply and stable connections during reset procedures. Interrupting the reset process may cause firmware corruption.
