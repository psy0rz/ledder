import Display from "../../Display.js"
import type ColorInterface from "../../ColorInterface.js"
import { spawn, ChildProcess } from 'child_process'
import ControlSwitch from "../../ControlSwitch.js";

/**
 * Display driver for IDM 64x64 LED Matrix Display
 * Uses the idotmatrix-api-client Python library to communicate with the display
 * https://github.com/markusressel/idotmatrix-api-client
 */
export class DisplayIDM64x64 extends Display {

    buffer: Uint8ClampedArray;
    pythonProcess: ChildProcess | null = null;
    macAddress: string;
    autoConnect: boolean;
    flipXControl: ControlSwitch;
    flipYControl: ControlSwitch;
    flipX: boolean = false;
    flipY: boolean = false;
    streamMode: boolean = true;  // Stream mode (always true for IDM)

    /**
     * Driver for IDM 64x64 LED Matrix via Bluetooth
     * @param macAddress Bluetooth MAC address of the device (optional - will auto-discover if not provided)
     * @param flipX Flip X axis
     * @param flipY Flip Y axis
     * @param autoConnect Auto-connect on startup
     */
    constructor(macAddress: string = "", flipX: boolean = false, flipY: boolean = false, autoConnect: boolean = true) {
        super(64, 64);

        this.macAddress = macAddress;
        this.autoConnect = autoConnect;
        this.flipX = flipX;
        this.flipY = flipY;

        this.id = macAddress || "IDM64x64"
        this.descriptionControl.text = `IDM 64x64 Matrix ${this.id}`

        // Add flip controls to settings
        this.flipXControl = this.settingsControl.switch('Flip X', flipX)
        this.flipYControl = this.settingsControl.switch('Flip Y', flipY)

        // Monitor flip changes
        this.flipXControl.onChange(() => {
            this.flipX = this.flipXControl.enabled
        })
        this.flipYControl.onChange(() => {
            this.flipY = this.flipYControl.enabled
        })

        this.buffer = new Uint8ClampedArray(this.width * this.height * 3);

        console.log("IDM64x64 Display driver initialized")
    }

    /**
     * Sets a pixel in the render buffer
     */
    setPixel(x: number, y: number, color: ColorInterface) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            let physX: number;
            let physY: number;

            if (this.flipX)
                physX = this.width - ~~x - 1;
            else
                physX = ~~x;

            if (this.flipY)
                physY = this.height - ~~y - 1;
            else
                physY = ~~y;

            const offset = (physY * this.width + physX) * 3;
            const old_a = 1 - color.a;

            //store pixel in buffer, alpha blend with existing values
            this.buffer[offset] = (this.buffer[offset] * old_a + this.gammaMapper[~~color.r] * color.a);
            this.buffer[offset + 1] = (this.buffer[offset + 1] * old_a + this.gammaMapper[~~color.g] * color.a);
            this.buffer[offset + 2] = (this.buffer[offset + 2] * old_a + this.gammaMapper[~~color.b] * color.a);
        }
    }

    /**
     * Send the current frame to the display
     */
    frame(displayTimeMicros: number): number {
        let statsBytes = 0;

        try {
            // Start Python bridge if not running
            if (!this.pythonProcess) {
                this.startPythonBridge();
            }

            if (this.pythonProcess && this.pythonProcess.stdin) {
                // Send frame data as JSON over stdin
                const frameData = {
                    type: 'frame',
                    width: this.width,
                    height: this.height,
                    data: Array.from(this.buffer)
                };

                const jsonData = JSON.stringify(frameData) + '\n';
                this.pythonProcess.stdin.write(jsonData);
                statsBytes = jsonData.length;
            }
        } catch (e) {
            console.error("IDM64x64: Error sending frame:", e);
        }

        // Clear buffer for next frame
        this.buffer = new Uint8ClampedArray(this.width * this.height * 3);

        return statsBytes;
    }

    /**
     * Start the Python GIF uploader process
     */
    startPythonBridge() {
        try {
            console.log("Starting IDM64x64 GIF uploader...");
            
            // Use absolute paths
            const pythonPath = '/home/rein/ledderidm/venv/bin/python3';
            const uploaderPath = '/home/rein/ledderidm/ledder/ledder/server/drivers/idm_gif_uploader.py';
            
            // Start Python GIF uploader with MAC address and settings
            // Maximum: 60 frames at 3fps = 20 seconds of animation
            const args = [uploaderPath, '--fps', '3', '--frames', '60'];
            if (this.macAddress) {
                args.push('--mac', this.macAddress);
            }

            this.pythonProcess = spawn(pythonPath, args, {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            this.pythonProcess.stdout?.on('data', (data) => {
                console.log(`IDM64x64: ${data.toString().trim()}`);
            });

            this.pythonProcess.stderr?.on('data', (data) => {
                console.error(`IDM64x64 Error: ${data.toString().trim()}`);
            });

            this.pythonProcess.on('close', (code) => {
                console.log(`IDM64x64 GIF uploader exited with code ${code}`);
                this.pythonProcess = null;
            });

            this.pythonProcess.on('error', (err) => {
                console.error(`IDM64x64 GIF uploader error: ${err}`);
                this.pythonProcess = null;
            });

        } catch (e) {
            console.error("Failed to start GIF uploader:", e);
        }
    }

    /**
     * Cleanup on exit
     */
    destroy() {
        if (this.pythonProcess) {
            console.log("Stopping IDM64x64 Python bridge...");
            this.pythonProcess.kill();
            this.pythonProcess = null;
        }
    }

    /**
     * Set stream mode (compatibility method - IDM always streams)
     */
    setStreamMode(mode: boolean) {
        this.streamMode = mode;
    }

    /**
     * Get stream mode
     */
    getStreamMode(): boolean {
        return this.streamMode;
    }
}
