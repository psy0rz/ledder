import Display from "../../Display.js"
import type ColorInterface from "../../ColorInterface.js"
import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas'
import express, { type Express, type Request, type Response } from 'express'
import http from 'http'
import { Client, DefaultMediaReceiver } from 'castv2-client'
import mdns from 'mdns-js'
import { networkInterfaces } from 'os'
import ControlSwitch from "../../ControlSwitch.js"
import ControlInput from "../../ControlInput.js"

/**
 * Display driver for Google Chromecast
 * Streams animations to Chromecast devices by serving frames as images via HTTP
 * and casting them using the castv2-client library
 */
export class DisplayChromecast extends Display {

    private canvas: Canvas
    private ctx: CanvasRenderingContext2D
    private expressApp: Express
    private httpServer: http.Server | null = null
    private castClient: Client | null = null
    private castPlayer: typeof DefaultMediaReceiver | null = null
    private deviceName: string
    private deviceHost: string | null = null
    private serverPort: number
    private localIp: string
    private connected: boolean = false
    private frameCount: number = 0
    private currentFrameBuffer: Buffer | null = null
    private streamInterval: NodeJS.Timeout | null = null
    
    // Controls
    private autoConnectControl: ControlSwitch
    private deviceNameControl: ControlInput
    private frameRateControl: ControlInput
    private scaleControl: ControlInput

    // Settings
    private targetFps: number = 60
    private scale: number = 4  // Scale factor for display (64x64 -> 256x256 default)

    /**
     * Driver for Chromecast devices
     * @param width Display width (in Ledger pixels, typically 64)
     * @param height Display height (in Ledger pixels, typically 64)
     * @param deviceName Chromecast device name (or partial name for discovery, or IP address)
     * @param serverPort HTTP server port for streaming frames
     * @param localIp Local IP address for HTTP server (auto-detected if not provided)
     * @param autoConnect Auto-connect on startup
     */
    constructor(
        width: number = 64,
        height: number = 64,
        deviceName: string = "",
        serverPort: number = 8765,
        localIp: string = "",
        autoConnect: boolean = true
    ) {
        super(width, height)

        this.deviceName = deviceName
        this.serverPort = serverPort
        this.localIp = localIp || this.getLocalIp()
        this.scale = 4  // Default scale to make 64x64 visible on TV

        // Check if deviceName is an IP address
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
        if (deviceName && ipPattern.test(deviceName)) {
            this.deviceHost = deviceName
            console.log(`Chromecast: Using IP address directly: ${deviceName}`)
        }

        this.id = deviceName || "Chromecast"
        this.descriptionControl.text = `Chromecast ${this.id}`

        // Initialize canvas for frame rendering
        this.canvas = createCanvas(this.width * this.scale, this.height * this.scale)
        this.ctx = this.canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false  // Pixel-perfect scaling

        // Setup controls
        this.deviceNameControl = this.settingsControl.input('Device Name', this.deviceName)
        this.frameRateControl = this.settingsControl.input('Target FPS', this.targetFps.toString())
        this.scaleControl = this.settingsControl.input('Scale Factor', this.scale.toString())
        this.autoConnectControl = this.settingsControl.switch('Auto Connect', autoConnect)

        // Monitor control changes
        this.deviceNameControl.onChange(() => {
            this.deviceName = this.deviceNameControl.text
            if (this.connected) {
                console.log("Chromecast: Device name changed, reconnecting...")
                this.disconnect().then(() => this.connect())
            }
        })

        this.frameRateControl.onChange(() => {
            const fps = parseInt(this.frameRateControl.text)
            if (fps > 0 && fps <= 60) {
                this.targetFps = fps
                this.minFrameTimeMicros = Math.floor(1000000 / fps)
                this.defaultFrameTimeMicros = Math.floor(1000000 / fps)
            }
        })

        this.scaleControl.onChange(() => {
            const newScale = parseInt(this.scaleControl.text)
            if (newScale > 0 && newScale <= 20) {
                this.scale = newScale
                this.canvas = createCanvas(this.width * this.scale, this.height * this.scale)
                this.ctx = this.canvas.getContext('2d')
                this.ctx.imageSmoothingEnabled = false
            }
        })

        // Setup HTTP server for frame streaming
        this.setupHttpServer()

        console.log("Chromecast Display driver initialized")
        
        // Auto-connect if enabled (do it after a short delay to let constructor finish)
        if (autoConnect) {
            setTimeout(() => {
                this.connect().catch(err => {
                    console.error("Chromecast: Auto-connect failed:", err.message)
                    console.error("Chromecast: You can try connecting manually or check if device is on the network")
                })
            }, 1000)
        }
    }

    /**
     * Get local IP address for the HTTP server
     */
    private getLocalIp(): string {
        const nets = networkInterfaces()
        
        for (const name of Object.keys(nets)) {
            const netInfo = nets[name]
            if (!netInfo) continue
            
            for (const net of netInfo) {
                // Skip internal and non-IPv4 addresses
                if (net.family === 'IPv4' && !net.internal) {
                    return net.address
                }
            }
        }
        
        return '127.0.0.1'  // Fallback
    }

    /**
     * Setup HTTP server to serve frame images
     */
    private setupHttpServer(): void {
        this.expressApp = express()

        // Serve current frame as JPEG
        this.expressApp.get('/frame.jpg', (req: Request, res: Response) => {
            if (this.currentFrameBuffer) {
                res.set('Content-Type', 'image/jpeg')
                res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
                res.send(this.currentFrameBuffer)
            } else {
                res.status(503).send('No frame available')
            }
        })

        // Serve auto-refreshing HTML page for Chromecast
        this.expressApp.get('/stream.html', (req: Request, res: Response) => {
            const refreshRate = Math.floor(1000 / this.targetFps)
            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ledder Stream</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: black;
        }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #frame {
            width: 100vw;
            height: 100vh;
            object-fit: fill;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }
    </style>
</head>
<body>
    <img id="frame" src="/frame.jpg?t=${Date.now()}" />
    <script>
        const img = document.getElementById('frame');
        const refreshRate = ${refreshRate};
        
        // Request fullscreen on load
        document.documentElement.requestFullscreen?.() || 
        document.documentElement.webkitRequestFullscreen?.();
        
        setInterval(() => {
            img.src = '/frame.jpg?t=' + Date.now();
        }, refreshRate);
        
        // Preload next frame
        img.onload = function() {
            const preload = new Image();
            preload.src = '/frame.jpg?t=' + (Date.now() + refreshRate);
        };
        
        // Prevent screensaver/sleep
        const wakeLock = navigator.wakeLock?.request?.('screen').catch(() => {});
    </script>
</body>
</html>`
            res.send(html)
        })

        this.httpServer = this.expressApp.listen(this.serverPort, () => {
            console.log(`Chromecast: HTTP server running on http://${this.localIp}:${this.serverPort}`)
        })
    }

    /**
     * Discover Chromecast devices on the network
     */
    private async discoverDevice(): Promise<string> {
        return new Promise((resolve, reject) => {
            // @ts-ignore - mdns-js types are incomplete
            const browser = mdns.createBrowser(mdns.tcp('googlecast'))
            let foundDevices: Array<{name: string, host: string}> = []
            let resolved = false
            
            const cleanup = () => {
                if (!resolved) {
                    resolved = true
                    try {
                        browser.stop()
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                }
            }
            
            const timeout = setTimeout(() => {
                cleanup()
                if (foundDevices.length > 0) {
                    // If we found devices but none matched, show what we found
                    const deviceList = foundDevices.map(d => `${d.name} (${d.host})`).join(', ')
                    reject(new Error(`Chromecast "${this.deviceName}" not found. Available: ${deviceList}`))
                } else {
                    reject(new Error(`No Chromecast devices discovered. Check network/firewall settings.`))
                }
            }, 20000)  // 20 second timeout

            browser.on('ready', () => {
                console.log('Chromecast: mDNS browser ready, scanning...')
                browser.discover()
            })

            browser.on('update', (data: any) => {
                if (resolved) return
                
                const name = data.fullname || data.host || data.txt?.fn || ""
                const host = data.addresses?.[0] || data.host
                
                if (!host) {
                    console.log(`Chromecast: Discovered device without valid host: ${name}`)
                    return
                }
                
                foundDevices.push({ name, host })
                console.log(`Chromecast: Found device: "${name}" at ${host}`)
                
                // Match device name (partial case-insensitive match or first device if no name specified)
                const nameMatch = !this.deviceName || 
                    name.toLowerCase().includes(this.deviceName.toLowerCase())
                
                if (nameMatch) {
                    clearTimeout(timeout)
                    cleanup()
                    this.deviceHost = host
                    this.id = name || "Chromecast"
                    this.descriptionControl.text = `Chromecast ${name || host}`
                    console.log(`Chromecast: Selected device: "${name}" at ${host}`)
                    resolve(host)
                }
            })

            console.log(`Chromecast: Discovering Chromecasts${this.deviceName ? ` matching "${this.deviceName}"` : ' (any)'}...`)
            console.log(`Chromecast: If device is not found, you can set IP directly in displayconf.js`)
        })
    }

    /**
     * Connect to Chromecast device
     */
    async connect(): Promise<void> {
        if (this.connected) {
            console.log("Chromecast: Already connected")
            return
        }

        try {
            // Discover device if host not known
            if (!this.deviceHost) {
                console.log("Chromecast: Starting device discovery...")
                await this.discoverDevice()
            }

            if (!this.deviceHost) {
                throw new Error("No Chromecast host available")
            }

            console.log(`Chromecast: Connecting to ${this.deviceHost}...`)

            // Connect to Chromecast
            this.castClient = new Client()
            
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error(`Connection timeout to ${this.deviceHost}`))
                }, 10000)
                
                this.castClient!.connect(this.deviceHost!, (err: Error | null) => {
                    clearTimeout(timeout)
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })

            console.log(`Chromecast: Connected to ${this.deviceHost}`)
            console.log(`Chromecast: HTTP streaming server ready`)
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
            console.log(`  TO DISPLAY ON CHROMECAST:`)
            console.log(`  1. Open Chrome browser on any device`)
            console.log(`  2. Visit: http://${this.localIp}:${this.serverPort}/stream.html`)
            console.log(`  3. Click the Cast button 🔰 in the browser`)
            console.log(`  4. Select your Chromecast: ${this.deviceName || this.deviceHost}`)
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

            this.connected = true
            this.ready = true

        } catch (err: any) {
            console.error("Chromecast: Connection failed:", err.message)
            this.connected = false
            this.ready = false
            
            // Cleanup on failure
            if (this.castClient) {
                try {
                    this.castClient.close()
                } catch (e) {
                    // Ignore
                }
                this.castClient = null
            }
            this.castPlayer = null
            
            throw err
        }
    }

    /**
     * Disconnect from Chromecast device
     */
    async disconnect(): Promise<void> {
        if (this.castPlayer) {
            try {
                await new Promise<void>((resolve) => {
                    this.castPlayer!.stop(() => {
                        resolve()
                    })
                })
            } catch (err) {
                console.error("Chromecast: Error stopping player:", err)
            }
            this.castPlayer = null
        }

        if (this.castClient) {
            this.castClient.close()
            this.castClient = null
        }

        this.connected = false
        this.ready = false
        console.log("Chromecast: Disconnected")
    }

    /**
     * Set a pixel in the frame buffer
     */
    setPixel(x: number, y: number, color: ColorInterface): void {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return
        }

        // Apply gamma correction
        const r = this.gammaMapper[Math.floor(color.r * color.a)]
        const g = this.gammaMapper[Math.floor(color.g * color.a)]
        const b = this.gammaMapper[Math.floor(color.b * color.a)]

        // Draw scaled pixel on canvas
        this.ctx.fillStyle = `rgb(${r},${g},${b})`
        this.ctx.fillRect(
            Math.floor(x) * this.scale,
            Math.floor(y) * this.scale,
            this.scale,
            this.scale
        )
    }

    /**
     * Send the current frame
     */
    frame(displayTimeMicros: number): number {
        if (!this.ready) {
            return 0
        }

        try {
            // Convert canvas to JPEG buffer
            this.currentFrameBuffer = this.canvas.toBuffer('image/jpeg', { quality: 0.85 })
            this.frameCount++

            // Clear canvas for next frame
            this.ctx.fillStyle = 'black'
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            return this.currentFrameBuffer.length

        } catch (err) {
            console.error("Chromecast: Error rendering frame:", err)
            return 0
        }
    }

    /**
     * Cleanup resources
     */
    async close(): Promise<void> {
        await this.disconnect()

        if (this.httpServer) {
            await new Promise<void>((resolve) => {
                this.httpServer!.close(() => {
                    console.log("Chromecast: HTTP server stopped")
                    resolve()
                })
            })
            this.httpServer = null
        }
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            connected: this.connected,
            frameCount: this.frameCount,
            deviceHost: this.deviceHost,
            serverUrl: `http://${this.localIp}:${this.serverPort}/stream.html`
        }
    }
}
