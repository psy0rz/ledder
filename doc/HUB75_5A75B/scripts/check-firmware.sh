#!/bin/bash

# 5A-75B Firmware Compatibility Check
# Determines if your card has compatible firmware for LED control

echo "=== 5A-75B Firmware Compatibility Check ==="
echo

# Check if card has basic network presence
echo "1. Testing network connectivity..."
echo "   Checking default IP 192.168.1.45..."

if ping -c 1 -W 2 192.168.1.45 >/dev/null 2>&1; then
    echo "✅ Card responds to ping at 192.168.1.45"
    
    # Check UDP port 5568
    echo
    echo "2. Testing UDP port 5568 (LED control protocol)..."
    if timeout 2 bash -c "</dev/tcp/192.168.1.45/5568" 2>/dev/null; then
        echo "✅ TCP port 5568 is accessible"
    fi
    
    # Try UDP test
    if command -v nc >/dev/null 2>&1; then
        if echo "test" | timeout 2 nc -u -w1 192.168.1.45 5568 2>/dev/null; then
            echo "✅ UDP port 5568 responds - firmware likely compatible!"
            echo
            echo "🎉 SUCCESS: Your firmware appears to be compatible!"
            echo "   You can proceed with LED panel testing:"
            echo "   node test-panels.js 192.168.1.45 128 64"
            exit 0
        else
            echo "⚠️  UDP port 5568 may not be responding properly"
        fi
    fi
    
    echo "✅ Network connectivity OK, but LED protocol uncertain"
    echo "   Try the LED test to verify: node test-panels.js 192.168.1.45 128 64"
    
else
    echo "❌ No network response from default IP 192.168.1.45"
    
    echo
    echo "3. Scanning network for any Colorlight devices..."
    
    if command -v arp-scan >/dev/null 2>&1 && [ "$EUID" -eq 0 ]; then
        COLORLIGHT_FOUND=$(sudo arp-scan --local 2>/dev/null | grep -i "00:23:c3")
        if [ ! -z "$COLORLIGHT_FOUND" ]; then
            echo "✅ Found Colorlight device(s):"
            echo "$COLORLIGHT_FOUND"
            echo "   Try testing with the found IP address"
        else
            echo "❌ No Colorlight devices found on network"
        fi
    else
        echo "   (Run with sudo for MAC address scanning)"
    fi
    
    echo
    echo "🚨 DIAGNOSIS: Likely Factory/Incompatible Firmware"
    echo
    echo "SYMPTOMS:"
    echo "- Test button works (hardware is OK)"  
    echo "- No network response (firmware doesn't support network control)"
    echo "- Ethernet LEDs don't blink when connected"
    echo
    echo "SOLUTION: Flash compatible firmware"
    echo "1. See: 5A75B-FIRMWARE-GUIDE.md for complete instructions"
    echo "2. You'll need a JTAG programmer (FT2232H recommended ~$20)"
    echo "3. Flash chubby75 or similar open-source firmware"
fi

echo
echo "=== Hardware Verification Checklist ==="
echo "Check these physical indicators:"
echo "□ Test button produces display on LED panels (should be YES)"
echo "□ Network LEDs blink when Ethernet connected (currently NO - this is the issue)"
echo "□ Power LED is on (should be YES)"
echo "□ Using Port 1 (INPUT) not Port 2 (OUTPUT)"
echo
echo "=== Next Steps ==="
if ping -c 1 -W 2 192.168.1.45 >/dev/null 2>&1; then
    echo "Your card has network connectivity - try:"
    echo "1. node test-panels.js 192.168.1.45 128 64"
    echo "2. If no LED output, may need compatible firmware"
else
    echo "Your card needs compatible firmware:"
    echo "1. Get JTAG programmer (FT2232H Mini Module ~$20)"
    echo "2. Download firmware: wget https://github.com/q3k/chubby75/releases/latest/download/5a-75b_v8.0.bit"
    echo "3. Flash: openfpgaloader -c ft2232 5a-75b_v8.0.bit"
    echo "4. Verify network lights start blinking"
    echo "5. Test: node test-panels.js 192.168.1.45 128 64"
fi
echo
echo "For detailed firmware flashing guide: cat 5A75B-FIRMWARE-GUIDE.md"
