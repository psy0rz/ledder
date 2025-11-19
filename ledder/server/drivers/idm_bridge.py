#!/usr/bin/env python3
"""
Python bridge for IDM 64x64 LED Matrix Display
Reads frame data from stdin (JSON format) and sends to the display via idotmatrix-api-client
"""

import asyncio
import sys
import json
import logging
import argparse
from typing import List, Tuple

try:
    from idotmatrix.client import IDotMatrixClient
    from idotmatrix.screensize import ScreenSize
    from idotmatrix.modules.image import ImageMode
except ImportError:
    print("ERROR: idotmatrix-api-client not installed. Install with: pip install idotmatrix-api-client", file=sys.stderr)
    sys.exit(1)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s :: %(levelname)s :: %(message)s",
    datefmt="%H:%M:%S",
)
# Reduce bleak logging noise
logging.getLogger("bleak").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)


class IDMBridge:
    """Bridge between Ledder and IDM display"""

    def __init__(self, mac_address: str = None):
        self.mac_address = mac_address
        self.client = None
        self.connected = False
        self.screen_size = ScreenSize.SIZE_64x64
        self.sending_frame = False
        self.pending_frame = None
        self.last_frame = None
        self.frame_count = 0

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

            logger.info("Setting display to DIY mode...")
            await self.client.image.set_mode(ImageMode.EnableDIY)

            self.connected = True
            logger.info("IDM display connected and ready!")

        except Exception as e:
            logger.error(f"Failed to connect to IDM display: {e}")
            raise

    async def send_frame(self, pixel_data: List[int]):
        """
        Send frame data to the display
        :param pixel_data: Flat array of RGB values [r,g,b,r,g,b,...]
        """
        # Skip if already sending a frame - just update pending
        if self.sending_frame:
            self.pending_frame = pixel_data
            return
        
        # Skip every other frame to double speed (30fps target instead of 60fps)
        self.frame_count += 1
        if self.frame_count % 6 != 0:  # Only send every 6th frame (~10fps)
            return
            
        self.sending_frame = True
        
        try:
            if not self.connected:
                await self.connect()

            # Convert flat RGB array to list of tuples [(r,g,b), (r,g,b), ...]
            pixels = []
            for i in range(0, len(pixel_data), 3):
                r = int(pixel_data[i])
                g = int(pixel_data[i + 1])
                b = int(pixel_data[i + 2])
                pixels.append((r, g, b))

            # Upload pixel data to display (this is the slow part)
            await self.client.image.upload_image_pixeldata(pixels)
            self.last_frame = pixel_data

        except Exception as e:
            logger.error(f"Error sending frame: {e}")
            self.connected = False
        finally:
            self.sending_frame = False

    async def run(self):
        """Main loop - read frames from stdin and send to display"""
        logger.info("IDM Bridge started, waiting for frames...")

        # Start background task to send pending frames
        async def send_pending_frames():
            while True:
                if self.pending_frame and not self.sending_frame:
                    frame = self.pending_frame
                    self.pending_frame = None
                    await self.send_frame(frame)
                await asyncio.sleep(0.01)  # Check every 10ms
        
        asyncio.create_task(send_pending_frames())

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
                            # Queue frame (don't wait)
                            if not self.sending_frame:
                                asyncio.create_task(self.send_frame(pixel_data))
                            else:
                                self.pending_frame = pixel_data

                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON: {e}")
                except Exception as e:
                    logger.error(f"Error processing frame: {e}")

        except KeyboardInterrupt:
            logger.info("Shutting down...")
        except Exception as e:
            logger.error(f"Fatal error: {e}")
            raise


async def main():
    parser = argparse.ArgumentParser(description='IDM 64x64 Display Bridge')
    parser.add_argument('--mac', type=str, help='Bluetooth MAC address of the display (optional)')
    args = parser.parse_args()

    bridge = IDMBridge(mac_address=args.mac)
    await bridge.run()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Stopped")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)
