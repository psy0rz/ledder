import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import {spawn} from "child_process"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"

export default class RemoteVideo extends Animator {
    private frameData: PixelList[] = [];
    private isDecoding: boolean = false;
    private decodingComplete: boolean = false;
    private maxFrames: number = 500; // Limit frames to prevent memory overflow

    async decodeVideo(url: string, box: PixelBox, fps: number) {
        if (this.isDecoding) {
            console.warn("Decode already in progress, skipping");
            return false;
        }

        // Clear previous frame data
        this.frameData = [];
        this.isDecoding = true;
        this.decodingComplete = false;

        const width = box.width();
        const height = box.height();
        const frameSize = width * height * 3; // RGB needs 3 bytes
        const buffer = Buffer.allocUnsafe(frameSize * 2); // Double buffer for efficiency
        let bufPos = 0;
        let frameCount = 0;

        console.log(`Decoding video: ${url} at ${fps}fps (${width}x${height})`);

        return new Promise<boolean>((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
                '-i', url,
                '-r', fps.toString(),
                '-f', 'rawvideo',
                '-s', `${width}x${height}`,
                '-pix_fmt', 'rgb24',
                '-'  // Output to stdout
            ], {
                stdio: ['ignore', 'pipe', 'pipe']
            });

            ffmpeg.stdout.on('data', (chunk: Buffer) => {
                // Stop accepting frames if we've hit the limit
                if (frameCount >= this.maxFrames) {
                    ffmpeg.kill('SIGTERM');
                    return;
                }

                chunk.copy(buffer, bufPos);
                bufPos += chunk.length;

                // Process all complete frames in the buffer
                while (bufPos >= frameSize && frameCount < this.maxFrames) {
                    const pl = new PixelList();
                    let offset = 0;

                    // Optimized pixel creation - batch processing
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            pl.add(new Pixel(x, y, new Color(
                                buffer[offset],
                                buffer[offset + 1],
                                buffer[offset + 2],
                                1
                            )));
                            offset += 3;
                        }
                    }

                    this.frameData.push(pl);
                    frameCount++;

                    // Shift remaining data to beginning of buffer
                    if (bufPos > frameSize) {
                        buffer.copy(buffer, 0, frameSize, bufPos);
                    }
                    bufPos -= frameSize;
                }
            });

            ffmpeg.stderr.on('data', (chunk: Buffer) => {
                const msg = chunk.toString();
                if (!msg.includes('frame=') && !msg.includes('fps=')) {
                    console.error(`ffmpeg: ${msg}`);
                }
            });

            ffmpeg.on('close', (code) => {
                this.isDecoding = false;
                this.decodingComplete = true;
                if (code === 0 || code === null) {
                    console.log(`Decode complete: ${frameCount} frames`);
                    resolve(true);
                } else if (frameCount >= this.maxFrames) {
                    console.log(`Decode stopped at frame limit: ${frameCount} frames`);
                    resolve(true);
                } else {
                    console.error(`ffmpeg exited with code ${code}`);
                    reject(new Error(`ffmpeg failed with code ${code}`));
                }
            });

            ffmpeg.on('error', (err) => {
                this.isDecoding = false;
                console.error(`ffmpeg error: ${err.message}`);
                reject(err);
            });
        });
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const imgBox = new PixelBox(box);
        box.add(imgBox);

        const imageConfig = controls.input('Image URL', "http://localhost:3000/presets/Fires/PlasmaFire/Active%202.png", true);
        const animationControls = controls.group("Animation Control");
        const movieFpsControl = animationControls.value("Video FPS", 25, 1, 60, 1, true);
        const playbackSpeedControl = animationControls.value("Playback Speed", 1, 0.1, 5, 0.1, true);
        const loopControl = animationControls.switch("Loop", true, true);
        const autoPlayControl = animationControls.switch("Auto Play", true, true);
        const maxFramesControl = animationControls.value("Max Frames", 500, 50, 2000, 50, true);
        const statusControl = animationControls.value("Status (frames)", 0, 0, 10000, 1, false);

        let framePointer = 0;
        let lastUrl = "";
        let lastFpsUpdate = movieFpsControl.value;
        let lastSpeedUpdate = playbackSpeedControl.value;

        // Update max frames from control
        this.maxFrames = maxFramesControl.value;

        // Start initial decode
        if (imageConfig.text && imageConfig.text !== lastUrl) {
            lastUrl = imageConfig.text;
            try {
                await this.decodeVideo(imageConfig.text, box, movieFpsControl.value);
            } catch (err) {
                console.error("Failed to decode video:", err);
            }
        }

        // Set initial frame timing
        scheduler.setFrameTimeuS((1000000 / movieFpsControl.value) / playbackSpeedControl.value);

        scheduler.interval(1, (frameNr) => {
            // Update max frames if changed
            if (maxFramesControl.value !== this.maxFrames) {
                this.maxFrames = maxFramesControl.value;
            }

            // Update timing if FPS or speed changed
            const currentFps = movieFpsControl.value;
            const currentSpeed = playbackSpeedControl.value;
            if (currentFps !== lastFpsUpdate || currentSpeed !== lastSpeedUpdate) {
                scheduler.setFrameTimeuS((1000000 / currentFps) / currentSpeed);
                lastFpsUpdate = currentFps;
                lastSpeedUpdate = currentSpeed;
            }

            // Check if URL changed
            if (imageConfig.text !== lastUrl && !this.isDecoding) {
                lastUrl = imageConfig.text;
                framePointer = 0;
                this.decodeVideo(imageConfig.text, box, currentFps).catch(err => {
                    console.error("Failed to decode video:", err);
                });
            }

            // Update status display
            statusControl.value = this.frameData.length;

            // Render current frame if we have frames
            if (this.frameData.length > 0 && autoPlayControl.enabled) {
                // Ensure frame pointer is valid
                if (framePointer >= this.frameData.length) {
                    if (loopControl.enabled) {
                        framePointer = 0;
                    } else {
                        framePointer = this.frameData.length - 1;
                        return; // Stop at last frame
                    }
                }

                imgBox.clear();
                imgBox.add(this.frameData[framePointer]);
                framePointer++;
            } else if (this.frameData.length > 0 && !autoPlayControl.enabled) {
                // Paused - just show current frame
                if (framePointer >= this.frameData.length) {
                    framePointer = this.frameData.length - 1;
                }
                imgBox.clear();
                imgBox.add(this.frameData[framePointer]);
            }
        });
    }
}

