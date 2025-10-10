# 5A-75B Protocol Reference

## UDP Communication Protocol

The Colorlight 5A-75B uses a custom UDP protocol for receiving LED panel data over Ethernet.

## Protocol Overview

### Connection Parameters:
- **Protocol**: UDP over IPv4
- **Default IP**: 192.168.1.45
- **Default Port**: 5568
- **Byte Order**: Little Endian
- **Color Format**: RGB888 (24-bit)

### Data Flow:
```
Computer → Ethernet → 5A-75B Card → HUB75 Outputs → LED Panels
```

## Packet Structure

### Header Format (8 bytes):
```
Offset | Size | Field        | Description
-------|------|--------------|---------------------------
0      | 3    | Magic        | 0x5A, 0x75, 0x42 ("5A75B")
3      | 1    | Command      | 0x00 = Pixel data
4      | 2    | Width        | Panel width (little endian)
6      | 2    | Height       | Panel height (little endian)
```

### Complete Packet:
```
┌─────────────────┬─────────────────────────────┐
│ Header (8 bytes)│ Pixel Data (W×H×3 bytes)   │
└─────────────────┴─────────────────────────────┘
```

### Example Packet (64×32 panel):
```
Bytes:  5A 75 42 00 40 00 20 00 [RGB data...]
        │  │  │  │  │     │
        │  │  │  │  │     └─ Height: 32 (0x0020)
        │  │  │  │  └─────── Width: 64 (0x0040)  
        │  │  │  └────────── Command: 0x00
        └──┴──┴─────────────── Magic: "5A75B"

Data Length: 8 + (64 × 32 × 3) = 6152 bytes total
```

## Pixel Data Format

### RGB888 Layout:
Each pixel requires 3 bytes in RGB order:
```
Pixel N: [Red] [Green] [Blue]
         0-255  0-255   0-255
```

### Pixel Ordering:
Pixels are transmitted in raster scan order:
```
Panel Layout (64×32):
┌─ 0,0 ── 1,0 ── 2,0 ── ... ── 63,0 ─┐
│                                     │
├─ 0,1 ── 1,1 ── 2,1 ── ... ── 63,1 ─┤
│                                     │
├─ 0,2 ── 1,2 ── 2,2 ── ... ── 63,2 ─┤
│               ...                   │
└─ 0,31─ 1,31─ 2,31─ ... ── 63,31──┘

Transmission order: (0,0), (1,0), (2,0), ..., (63,0), (0,1), (1,1), ...
```

### Multiple Panel Mapping:
For multiple panels, the firmware maps logical coordinates to physical outputs:

```
2×2 Panel Array (128×64 logical):
┌─────────┬─────────┐
│Panel 1  │Panel 2  │ ← HUB75 outputs 1,2
│(64×32)  │(64×32)  │
├─────────┼─────────┤  
│Panel 3  │Panel 4  │ ← HUB75 outputs 3,4
│(64×32)  │(64×32)  │
└─────────┴─────────┘

Logical pixel (65,10) → Panel 2, local (1,10) → HUB75 output 2
```

## Protocol Implementation

### Basic Send Function (JavaScript):
```javascript
function sendFrame(socket, width, height, pixelData) {
    // Create packet buffer
    const packetSize = 8 + (width * height * 3);
    const packet = new Uint8Array(packetSize);
    
    // Header
    packet[0] = 0x5A;  // Magic byte 1
    packet[1] = 0x75;  // Magic byte 2  
    packet[2] = 0x42;  // Magic byte 3
    packet[3] = 0x00;  // Command: pixel data
    
    // Dimensions (little endian)
    packet[4] = width & 0xFF;         // Width low byte
    packet[5] = (width >> 8) & 0xFF;  // Width high byte
    packet[6] = height & 0xFF;        // Height low byte
    packet[7] = (height >> 8) & 0xFF; // Height high byte
    
    // Pixel data (RGB888)
    packet.set(pixelData, 8);
    
    // Send UDP packet
    socket.send(packet);
}
```

### TypeScript Implementation:
```typescript
class Display5A75B extends Display {
    private static readonly MAGIC_BYTES = [0x5A, 0x75, 0x42];
    private static readonly CMD_PIXEL_DATA = 0x00;
    private static readonly HEADER_SIZE = 8;
    
    frame(displayTimeMicros: number): number {
        const packetSize = Display5A75B.HEADER_SIZE + this.buffer.length;
        const packet = new Uint8Array(packetSize);
        
        // Build header
        let offset = 0;
        packet[offset++] = Display5A75B.MAGIC_BYTES[0];
        packet[offset++] = Display5A75B.MAGIC_BYTES[1]; 
        packet[offset++] = Display5A75B.MAGIC_BYTES[2];
        packet[offset++] = Display5A75B.CMD_PIXEL_DATA;
        
        // Little endian width/height
        packet[offset++] = this.width & 0xFF;
        packet[offset++] = (this.width >> 8) & 0xFF;
        packet[offset++] = this.height & 0xFF;
        packet[offset++] = (this.height >> 8) & 0xFF;
        
        // Copy pixel data
        packet.set(this.buffer, offset);
        
        // Send packet
        this.socket.send(packet);
        return packetSize;
    }
}
```

## Advanced Protocol Features

### Command Types:
While only pixel data (0x00) is commonly used, the protocol may support:
```
0x00 - Pixel data (standard)
0x01 - Configuration command (firmware-specific)
0x02 - Status request (firmware-specific)  
0xFF - Reset command (firmware-specific)
```

### Firmware-Specific Extensions:
Some firmware implementations may support:
- **Brightness control**: Global brightness adjustment
- **Gamma correction**: Hardware gamma curves
- **Panel configuration**: Scan rate, timing parameters
- **Status reporting**: Temperature, frame rate statistics

### Error Handling:
The protocol is typically fire-and-forget UDP:
- **No acknowledgment**: Card doesn't send responses
- **No error reporting**: Network layer handles packet loss
- **Frame synchronization**: Timing managed by sender

## Performance Characteristics

### Bandwidth Requirements:
```
Formula: (Width × Height × 3 bytes × FPS) + Header overhead

Examples:
- 64×32 @ 60 FPS: (64×32×3×60) + overhead = ~368 KB/s
- 128×64 @ 60 FPS: (128×64×3×60) + overhead = ~1.47 MB/s  
- 256×128 @ 30 FPS: (256×128×3×30) + overhead = ~2.95 MB/s
```

### Network Considerations:
- **MTU limits**: Large frames may fragment (Ethernet MTU = 1500 bytes)
- **Packet loss**: UDP doesn't guarantee delivery
- **Latency**: Typical <1ms on Gigabit Ethernet
- **Jitter**: Can cause visible frame rate variations

### Optimization Strategies:
```javascript
// Frame rate limiting
const minFrameInterval = 16; // ~60 FPS
let lastFrameTime = 0;

function sendFrameThrottled(frameData) {
    const now = Date.now();
    if (now - lastFrameTime >= minFrameInterval) {
        sendFrame(frameData);
        lastFrameTime = now;
    }
}

// Buffer management
const frameBuffer = new Uint8Array(width * height * 3);
// Reuse buffer to avoid memory allocation overhead
```

## Debugging Protocol Issues

### Wireshark Analysis:
```bash
# Capture 5A-75B traffic
sudo tcpdump -i eth0 -w capture.pcap host 192.168.1.45

# Or use Wireshark with filter:
udp.port == 5568
```

### Packet Validation:
```javascript
function validatePacket(packet) {
    if (packet.length < 8) return false;
    
    // Check magic bytes
    if (packet[0] !== 0x5A || packet[1] !== 0x75 || packet[2] !== 0x42) {
        return false;
    }
    
    // Extract dimensions
    const width = packet[4] | (packet[5] << 8);
    const height = packet[6] | (packet[7] << 8);
    const expectedSize = 8 + (width * height * 3);
    
    return packet.length === expectedSize;
}
```

### Common Protocol Errors:
- **Wrong endianness**: Width/height bytes swapped
- **Buffer size mismatch**: Pixel data doesn't match dimensions
- **Magic byte errors**: Header corruption
- **Network fragmentation**: Packets too large for MTU

## Firmware Compatibility

### chubby75 Implementation:
The most common open-source firmware implements:
- Standard UDP protocol on port 5568
- RGB888 pixel format
- Multiple panel output mapping
- Basic error tolerance

### Alternative Firmware:
Other firmware may have variations:
- Different default ports
- Additional command types  
- Modified pixel formats
- Extended protocol features

### Protocol Version Detection:
```bash
# Test protocol compatibility
echo -e '\x5A\x75\x42\x00\x08\x00\x08\x00' | nc -u 192.168.1.45 5568
# Minimal 8×8 black frame - should not cause errors
```

## Security Considerations

### Network Security:
- **No authentication**: Anyone on network can send frames
- **No encryption**: Pixel data transmitted in clear
- **DoS potential**: Can flood card with packets
- **Access control**: Use network segmentation/firewall

### Recommended Security:
```bash
# Isolate LED network
# Use dedicated VLAN or subnet for LED controllers
# Block internet access for LED devices
# Monitor network traffic for anomalies
```

---

**Note:** This protocol documentation is based on reverse engineering and community knowledge. Specific firmware implementations may have variations or extensions not covered here.
