#!/bin/bash

# Colorlight 5A-75B IP Discovery Script
# This script helps you find your 5A-75B card on the network

echo "=== Colorlight 5A-75B IP Discovery ==="
echo

# Check if running as root for some commands
if [ "$EUID" -ne 0 ]; then
    echo "Note: Run with sudo for more comprehensive scanning"
    echo
fi

# Method 1: Try default IP
echo "1. Testing default IP address (192.168.1.45)..."
if ping -c 1 -W 2 192.168.1.45 >/dev/null 2>&1; then
    echo "✅ Found 5A-75B at default IP: 192.168.1.45"
    echo "   Testing UDP port 5568..."
    if command -v nmap >/dev/null 2>&1; then
        nmap -p 5568 192.168.1.45 2>/dev/null | grep -q "open" && echo "   ✅ Port 5568 is open" || echo "   ⚠️  Port 5568 status unknown"
    fi
    echo
else
    echo "❌ Default IP 192.168.1.45 not responding"
    echo
fi

# Method 2: Look for Colorlight MAC addresses
echo "2. Scanning for Colorlight devices by MAC address..."
if command -v arp-scan >/dev/null 2>&1 && [ "$EUID" -eq 0 ]; then
    echo "   Scanning local network..."
    COLORLIGHT_DEVICES=$(arp-scan --local 2>/dev/null | grep -i "00:23:c3")
    if [ ! -z "$COLORLIGHT_DEVICES" ]; then
        echo "✅ Found Colorlight device(s):"
        echo "$COLORLIGHT_DEVICES"
    else
        echo "❌ No Colorlight devices found by MAC address"
    fi
else
    if [ "$EUID" -ne 0 ]; then
        echo "   ⚠️  Skipping (requires sudo and arp-scan)"
    else
        echo "   ⚠️  arp-scan not installed. Install with: sudo apt install arp-scan"
    fi
fi
echo

# Method 3: Network scan common subnets
echo "3. Scanning common network ranges..."
if command -v nmap >/dev/null 2>&1; then
    SUBNETS=("192.168.1.0/24" "192.168.0.0/24" "10.0.0.0/24" "172.16.0.0/24")
    
    for subnet in "${SUBNETS[@]}"; do
        echo "   Scanning $subnet..."
        ACTIVE_IPS=$(nmap -sn "$subnet" 2>/dev/null | grep -E "Nmap scan report" | awk '{print $5}' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$')
        
        if [ ! -z "$ACTIVE_IPS" ]; then
            echo "   Active IPs in $subnet:"
            for ip in $ACTIVE_IPS; do
                echo "     - $ip"
                # Test port 5568 on each IP
                if nmap -p 5568 "$ip" 2>/dev/null | grep -q "5568.*open"; then
                    echo "       ✅ Port 5568 open - possible 5A-75B!"
                fi
            done
        fi
    done
else
    echo "   ⚠️  nmap not installed. Install with: sudo apt install nmap"
fi
echo

# Method 4: Check ARP table
echo "4. Checking ARP table for recent devices..."
if command -v arp >/dev/null 2>&1; then
    ARP_ENTRIES=$(arp -a 2>/dev/null)
    if [ ! -z "$ARP_ENTRIES" ]; then
        echo "$ARP_ENTRIES" | while read line; do
            if echo "$line" | grep -qi "00:23:c3"; then
                echo "✅ Possible Colorlight device: $line"
            fi
        done
    fi
else
    echo "   ⚠️  arp command not available"
fi
echo

# Method 5: Instructions for manual discovery
echo "5. Manual discovery methods:"
echo "   a) Check your router's DHCP client list"
echo "   b) Look for devices with MAC addresses starting with 00:23:C3"
echo "   c) Power cycle the 5A-75B and monitor network traffic:"
echo "      sudo tcpdump -i eth0 arp"
echo

# Summary and next steps
echo "=== Next Steps ==="
echo "1. If you found an IP address above, test it:"
echo "   ping [IP_ADDRESS]"
echo "   node test-5a75b.js [IP_ADDRESS] 128 64"
echo
echo "2. If no IP found, try factory reset:"
echo "   - Power off the 5A-75B card"
echo "   - Hold the small reset button (RST/RESET on PCB)"
echo "   - Power on while holding reset button"
echo "   - Keep holding for 10-15 seconds, then release"
echo "   - Card should reset to default IP: 192.168.1.45"
echo
echo "3. Other checks:"
echo "   - 5A-75B is powered on (LED indicators)"
echo "   - Ethernet cable is connected to PORT 1 (INPUT port)"
echo "   - Try the other Ethernet port if first doesn't work"
echo "   - Your computer is on the same network segment"
echo "   - Compatible firmware is installed on the card"
echo
echo "3. Default network settings for 5A-75B:"
echo "   IP: 192.168.1.45"
echo "   Subnet: 255.255.255.0"
echo "   Port: 5568"
