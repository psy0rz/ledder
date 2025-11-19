#!/usr/bin/env python3
"""
GIF uploader for IDM 64x64 LED Matrix Display
Receives frames, creates an animated GIF, and uploads it to the display
"""

import asyncio
import sys
import json
import logging
import argparse
from typing import List
from PIL import Image
import io
import tempfile
import os

try:
    from idotmatrix.client import IDotMatrixClient
    from idotmatrix.screensize import ScreenSize
    from idotmatrix.util.image_utils import ResizeMode
except ImportError:
    print("ERROR: idotmatrix-api-client not installed. Install with: pip install idotmatrix-api-client", file=sys.stderr)
    sys.exit(1)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s :: %(levelname)s :: %(message)s",
    datefmt="%H:%M:%S",
)
logging.getLogger("bleak").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)


class IDMGifUploader:
    """Collect frames and upload as animated GIF to display"""

    def __init__(self, mac_address: str = None, fps: int = 10, max_frames: int = 100):
        self.mac_address = mac_address
        self.client = None
        self.connected = False
        self.screen_size = ScreenSize.SIZE_64x64
        self.fps = fps
        self.max_frames = max_frames
        self.frames = []
        self.width = 64
        self.height = 64
        self.uploading = False
        self.duration_per_frame = int(1000 / fps)  # milliseconds per frame
        self.gif_uploaded = False  # Track if we've uploaded our GIF already
        self.duration_per_frame = int(1000 / fps)  # milliseconds per frame

    async def connect(self):
        """Connect to the IDM display"""
        try:
            logger.info("Initializing IDM client...")
            self.client = IDotMatrixClient(
                screen_size=self.screen_size,
                mac_address=self.mac_address,
            )

            logger.info("Connecting to IDM display...")
            await self.client.connect()
            self.connected = True
            logger.info("IDM display connected!")

        except Exception as e:
            logger.error(f"Failed to connect to IDM display: {e}")
            raise

    def add_frame(self, pixel_data: List[int]):
        """
        Add a frame to the GIF
        :param pixel_data: Flat array of RGB values [r,g,b,r,g,b,...]
        """
        # Skip frames if currently uploading
        if self.uploading:
            return
            
        try:
            # Convert flat RGB array to PIL Image
            img = Image.new('RGB', (self.width, self.height))
            pixels = img.load()
            
            for y in range(self.height):
                for x in range(self.width):
                    idx = (y * self.width + x) * 3
                    r = int(pixel_data[idx])
                    g = int(pixel_data[idx + 1])
                    b = int(pixel_data[idx + 2])
                    pixels[x, y] = (r, g, b)
            
            self.frames.append(img)

            # Upload when we have enough frames (only once)
            if len(self.frames) >= self.max_frames and not self.gif_uploaded:
                logger.info(f"Collected {self.max_frames} frames, uploading GIF...")
                asyncio.create_task(self.upload_gif())

        except Exception as e:
            logger.error(f"Error adding frame: {e}")

    async def upload_gif(self):
        """Upload the collected frames as an animated GIF to the display"""
        self.uploading = True
        try:
            # Create GIF from frames
            if not self.frames:
                logger.warning("No frames to upload")
                return
            
            temp_gif = "temp_animation.gif"
            
            # Save as animated GIF
            self.frames[0].save(
                temp_gif,
                save_all=True,
                append_images=self.frames[1:],
                duration=self.duration_per_frame,
                loop=0
            )
            
            logger.info("GIF created, uploading to display...")
            
            # Initialize IDM client
            logger.info("Initializing IDM client...")
            client = IDotMatrixClient(
                screen_size=ScreenSize.SIZE_64x64,
                mac_address=self.mac_address
            )
            
            # Connect and upload
            logger.info("Connecting to IDM display...")
            await client.connect()
            
            logger.info("Uploading GIF...")
            await client.gif.upload_gif_file(
                temp_gif,
                resize_mode=ResizeMode.FIT,
                palletize=True,
                duration_per_frame_in_ms=self.duration_per_frame
            )
            
            logger.info("GIF uploaded successfully!")
            
            # Mark as uploaded so we don't upload again
            self.gif_uploaded = True
            logger.info("GIF will now loop forever on the display")
            
            # Disconnect (ignore errors as connection might be closed already)
            try:
                await client.disconnect()
            except Exception as e:
                logger.debug(f"Disconnect error (non-critical): {e}")
            
            # Clean up
            if os.path.exists(temp_gif):
                os.remove(temp_gif)
            
            # Keep frames in memory (don't clear) so we stop collecting
            # self.frames = []  # Don't clear - we're done collecting
            
        except Exception as e:
            logger.error(f"Error uploading GIF: {e}")
            import traceback
            traceback.print_exc()
        finally:
            self.uploading = False

    async def run(self):
        """Main loop - read frames from stdin"""
        logger.info(f"IDM GIF Uploader started (fps={self.fps}, max_frames={self.max_frames})")
        logger.info("Collecting frames...")

        try:
            # Read frames from stdin asynchronously
            loop = asyncio.get_event_loop()
            reader = asyncio.StreamReader()
            protocol = asyncio.StreamReaderProtocol(reader)
            await loop.connect_read_pipe(lambda: protocol, sys.stdin)

            while True:
                try:
                    line = await reader.readline()
                    if not line:
                        break
                    
                    data = json.loads(line.decode().strip())

                    if data.get('type') == 'frame':
                        pixel_data = data.get('data', [])
                        if pixel_data:
                            self.add_frame(pixel_data)

                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON: {e}")
                except Exception as e:
                    logger.error(f"Error processing frame: {e}")

        except KeyboardInterrupt:
            logger.info("Shutting down...")
            # Upload remaining frames if any
            if self.frames:
                await self.upload_gif()
        except Exception as e:
            logger.error(f"Fatal error: {e}")
            raise


async def main():
    parser = argparse.ArgumentParser(description='IDM 64x64 GIF Uploader')
    parser.add_argument('--mac', type=str, help='Bluetooth MAC address of the display (optional)')
    parser.add_argument('--fps', type=int, default=10, help='Target FPS for GIF (default: 10)')
    parser.add_argument('--frames', type=int, default=100, help='Number of frames per GIF (default: 100)')
    args = parser.parse_args()

    uploader = IDMGifUploader(
        mac_address=args.mac,
        fps=args.fps,
        max_frames=args.frames
    )
    await uploader.run()


if __name__ == "__main__":
    asyncio.run(main())
