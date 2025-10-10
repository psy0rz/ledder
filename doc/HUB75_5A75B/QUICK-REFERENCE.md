# 5A-75B Quick Reference Card

## 🚀 Quick Start Checklist

### 1. Hardware Check
- [ ] Test button works (panels show display)
- [ ] Network LEDs blink when Ethernet connected
- [ ] Using Port 1 (INPUT) not Port 2 (OUTPUT)

### 2. Firmware Check
```bash
cd HUB75_5A75B/scripts
./check-firmware.sh
```
If shows "Factory firmware" → Need to flash compatible firmware

### 3. Network Discovery
```bash
./find-ip.sh
# Default IP: 192.168.1.45
```

### 4. Test Display
```bash
node test-panels.js 192.168.1.45 128 64
# For your 4-panel 2×2 setup
```

## 📋 Your 4-Panel Setup

**Configuration:**
```javascript
new Display5A75B(128, 64, "192.168.1.45", 5568)
```

**Physical Layout:**
```
[Panel 1][Panel 2]  ← 128×32 pixels (64×32 each)  
[Panel 3][Panel 4]  ← 128×32 pixels (64×32 each)
Total: 128×64 pixels
```

**Power:** ~18A @ 5V (90W power supply recommended)

## 🔧 Essential Commands

| Task | Command |
|------|---------|
| Check firmware | `./scripts/check-firmware.sh` |
| Find IP address | `./scripts/find-ip.sh` |
| Test panels | `node scripts/test-panels.js [IP] [W] [H]` |
| Flash firmware | `openfpgaloader -c ft2232 firmware.bit` |

## 📁 File Locations

| File | Purpose |
|------|---------|
| `examples/four-panels.js` | Your 4-panel config |
| `docs/FIRMWARE-GUIDE.md` | Firmware flashing |
| `docs/TROUBLESHOOTING.md` | Problem solving |
| `scripts/test-panels.js` | LED testing |

## ⚡ Common Issues

| Problem | Solution |
|---------|----------|
| No network lights | Flash firmware first |
| Can't find IP | Run `./scripts/find-ip.sh` |
| Flickering | Check power supply (18A @ 5V) |
| Wrong colors | Check HUB75 cables |

## 🎯 Default Settings

- **IP:** 192.168.1.45
- **Port:** 5568
- **Firmware:** chubby75 (open-source)
- **Protocol:** UDP over Ethernet

## 📞 Get Help

1. Check `docs/TROUBLESHOOTING.md`
2. Run diagnostic scripts
3. EEVblog Forum (Colorlight 5A-75B)
4. Reddit r/FPGA

---
**💡 Remember:** Most 5A-75B cards need firmware flashing before they work with network control!
