import Display from "../../Display.js"
import dgram from "dgram";
import type ColorInterface from "../../ColorInterface.js";

/**
 * Driver for Colorlight 5A-75B LED receiver card
 * Controls HUB75 LED matrix panels via Ethernet/UDP protocol
 * 
 * Supports:
 * - Up to 8 HUB75 outputs per card
 * - Maximum resolution: 512x64 pixels (8x 64x64 panels)
 * - 24-bit RGB color depth
 * - 60-120 Hz refresh rate
 * 
 * Hardware requirements:
 * - Colorlight 5A-75B card with compatible firmware
 * - HUB75 LED matrix panels
 * - 5V power supply for panels
 * - Ethernet connection
 */
export default class Display5A75B extends Display {

    private buffer: Uint8ClampedArray;
    private socket: dgram.Socket;
    private ip: string;
    private port: number;
    private flipX: boolean;
    private flipY: boolean;
    private connected: boolean = false;
    private lastFrameTime: number = 0;
    
    // Protocol constants
    private static readonly MAGIC_BYTES = [0x5A, 0x75, 0x42]; // "5A75B" identifier
    private static readonly CMD_PIXEL_DATA = 0x00;
    private static readonly HEADER_SIZE = 8;

    /**
     * Creates a new Display5A75B instance
     * 
     * @param width Panel width in pixels
     * @param height Panel height in pixels  
     * @param ip IP address of the 5A-75B card (default: 192.168.1.45)
     * @param port UDP port (default: 5568)
     * @param flipX Flip horizontal axis
     * @param flipY Flip vertical axis
     */
    constructor(
        width: number, 
        height: number, 
        ip: string = "192.168.1.45", 
        port: number = 5568,
        flipX: boolean = false,
        flipY: boolean = false
    ) {
        super(width, height);
        
        this.ip = ip;
        this.port = port;
        this.flipX = flipX;
        this.flipY = flipY;
        
        // Set display identification
        this.id = `5A-75B-${ip}:${port}`;
        this.descriptionControl.text = `Colorlight 5A-75B ${this.id}`;
        
        // Initialize frame buffer (RGB888 format)
        this.buffer = new Uint8ClampedArray(this.width * this.height * 3);
        
        // Configure frame timing for optimal performance
        this.minFrameTimeMicros = Math.floor(1000000 / 120); // 120 FPS max
        this.defaultFrameTimeMicros = Math.floor(1000000 / 60); // 60 FPS default
        
        // Initialize UDP socket
        this.initializeSocket();
        
        console.log(`Display5A75B initialized: ${width}x${height} @ ${ip}:${port}`);
    }
    
    /**
     * Initialize UDP socket for communication with 5A-75B card
     */
    private initializeSocket(): void {
        this.socket = dgram.createSocket('udp4');
        
        this.socket.on('connect', () => {
            console.log(`Connected to 5A-75B card at ${this.ip}:${this.port}`);
            this.connected = true;
        });
        
        this.socket.on('error', (err) => {
            console.error(`5A-75B socket error: ${err.message}`);
            this.connected = false;
        });
        
        this.socket.on('close', () => {
            console.log(`Connection to 5A-75B card closed`);
            this.connected = false;
        });
        
        // Connect to the 5A-75B card
        try {
            this.socket.connect(this.port, this.ip);
        } catch (error) {
            console.error(`Failed to connect to 5A-75B card: ${error}`);
        }
    }

    /**
     * Set a pixel in the frame buffer
     * Called by the render system for each pixel
     * 
     * @param x X coordinate
     * @param y Y coordinate  
     * @param color Color with RGBA values
     */
    setPixel(x: number, y: number, color: ColorInterface): void {
        // Bounds checking
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        
        // Apply coordinate flipping if configured
        let physX = this.flipX ? this.width - Math.floor(x) - 1 : Math.floor(x);
        let physY = this.flipY ? this.height - Math.floor(y) - 1 : Math.floor(y);
        
        // Calculate buffer offset (RGB888 format)
        const offset = (physY * this.width + physX) * 3;
        
        // Alpha blending with existing pixel data
        const alpha = color.a;
        const invAlpha = 1 - alpha;
        
        // Apply gamma correction and alpha blending
        this.buffer[offset] = Math.floor(
            this.buffer[offset] * invAlpha + this.gammaMapper[Math.floor(color.r)] * alpha
        );
        this.buffer[offset + 1] = Math.floor(
            this.buffer[offset + 1] * invAlpha + this.gammaMapper[Math.floor(color.g)] * alpha
        );
        this.buffer[offset + 2] = Math.floor(
            this.buffer[offset + 2] * invAlpha + this.gammaMapper[Math.floor(color.b)] * alpha
        );
    }

    /**
     * Send the current frame buffer to the 5A-75B card
     * 
     * @param displayTimeMicros Absolute time when frame should be displayed
     * @returns Number of bytes sent
     */
    frame(displayTimeMicros: number): number {
        if (!this.connected) {
            console.warn("5A-75B card not connected, skipping frame");
            return 0;
        }
        
        // Create packet with header + pixel data
        const packetSize = Display5A75B.HEADER_SIZE + this.buffer.length;
        const packet = new Uint8Array(packetSize);
        
        // Build packet header
        let offset = 0;
        
        // Magic bytes (3 bytes)
        packet[offset++] = Display5A75B.MAGIC_BYTES[0];
        packet[offset++] = Display5A75B.MAGIC_BYTES[1];
        packet[offset++] = Display5A75B.MAGIC_BYTES[2];
        
        // Command byte
        packet[offset++] = Display5A75B.CMD_PIXEL_DATA;
        
        // Width (2 bytes, little endian)
        packet[offset++] = this.width & 0xFF;
        packet[offset++] = (this.width >> 8) & 0xFF;
        
        // Height (2 bytes, little endian)  
        packet[offset++] = this.height & 0xFF;
        packet[offset++] = (this.height >> 8) & 0xFF;
        
        // Copy pixel data to packet
        packet.set(this.buffer, offset);
        
        // Send packet to 5A-75B card
        try {
            this.socket.send(packet);
            this.lastFrameTime = displayTimeMicros;
        } catch (error) {
            console.error(`Failed to send frame to 5A-75B card: ${error}`);
            return 0;
        }
        
        // Clear buffer for next frame
        this.buffer.fill(0);
        
        return packetSize;
    }
    
    /**
     * Get connection status
     */
    isConnected(): boolean {
        return this.connected;
    }
    
    /**
     * Reconnect to the 5A-75B card
     */
    reconnect(): void {
        if (this.socket) {
            this.socket.close();
        }
        this.initializeSocket();
    }
    
    /**
     * Close connection and cleanup resources
     */
    close(): void {
        if (this.socket) {
            this.socket.close();
        }
        this.connected = false;
    }
    
    /**
     * Get display statistics
     */
    getStats() {
        return {
            id: this.id,
            connected: this.connected,
            resolution: `${this.width}x${this.height}`,
            bufferSize: this.buffer.length,
            lastFrameTime: this.lastFrameTime,
            ip: this.ip,
            port: this.port
        };
    }
}
