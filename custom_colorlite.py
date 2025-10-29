#!/usr/bin/env python3

# Custom ColorLite firmware for 5A-75B with multiple Ethernet PHY testing
# Based on ColorLite but with modifications to try different PHY configurations

import os
import argparse
from migen import *

from litex_boards.platforms import colorlight_5a_75b

from litex.soc.cores.gpio import GPIOOut
from litex.soc.cores.led import LedChaser
from litex.soc.integration.soc_core import *
from litex.soc.integration.builder import *

from liteeth.phy.ecp5rgmii import LiteEthPHYRGMII
from litex.build.generic_platform import *
from litex.soc.cores.clock import ECP5PLL

# Additional IOs for LED Panel control
_hub75_ios = [
    # HUB75 LED Panel interface
    ("hub75", 0,
        Subsignal("clk",    Pins("F1")),  # CLK
        Subsignal("lat",    Pins("F2")),  # LAT/STB  
        Subsignal("oe_n",   Pins("G1")),  # OE (Output Enable)
        Subsignal("r0",     Pins("J1")),  # R0 (Red upper)
        Subsignal("g0",     Pins("K1")),  # G0 (Green upper)
        Subsignal("b0",     Pins("L1")),  # B0 (Blue upper)
        Subsignal("r1",     Pins("J2")),  # R1 (Red lower)
        Subsignal("g1",     Pins("K2")),  # G1 (Green lower)
        Subsignal("b1",     Pins("L2")),  # B1 (Blue lower)
        Subsignal("addr",   Pins("M1 N1 P1 R1 T1")), # Address lines A-E
        IOStandard("LVCMOS33")
    ),
    # Status LEDs
    ("status_led", 0, Pins("U16"), IOStandard("LVCMOS33")),
    ("status_led", 1, Pins("T15"), IOStandard("LVCMOS33")),
]

# Clock and Reset Generator
class _CRG(Module):
    def __init__(self, platform, sys_clk_freq):
        self.rst = Signal()
        self.clock_domains.cd_sys = ClockDomain()
        self.clock_domains.cd_eth = ClockDomain()
        
        # # #
        
        # Clk / Rst
        clk25 = platform.request("clk25")
        
        # PLL
        self.submodules.pll = pll = ECP5PLL()
        self.comb += pll.reset.eq(self.rst)
        pll.register_clkin(clk25, 25e6)
        pll.create_clkout(self.cd_sys, sys_clk_freq)
        pll.create_clkout(self.cd_eth, 125e6)

class CustomColorLight(SoCCore):
    def __init__(self, revision="7.0", sys_clk_freq=int(60e6),
                 eth_ip="192.168.1.45", eth_phy=0, **kwargs):
        platform = colorlight_5a_75b.Platform(revision=revision)
        
        # Add custom IOs
        platform.add_extension(_hub75_ios)

        # SoCCore
        SoCCore.__init__(self, platform, sys_clk_freq,
            ident="CustomColorLight 5A-75B", ident_version=True,
            **kwargs)

        # CRG (Clock Reset Generator)
        from litex.soc.cores.clock import ECP5PLL
        self.submodules.crg = _CRG(platform, sys_clk_freq)

        # Ethernet PHY - try different configurations
        if eth_phy == 0:
            # PHY 0 configuration
            self.submodules.ethphy = LiteEthPHYRGMII(
                clock_domain="eth",
                pads=platform.request("eth", 0),
                tx_delay=0.0e-9,  # No delay
                rx_delay=0.0e-9   # No delay
            )
        else:
            # PHY 1 configuration  
            self.submodules.ethphy = LiteEthPHYRGMII(
                clock_domain="eth", 
                pads=platform.request("eth", 1),
                tx_delay=2.0e-9,  # 2ns delay
                rx_delay=2.0e-9   # 2ns delay
            )

        # Ethernet MAC with Etherbone
        from liteeth.mac import LiteEthMAC
        from liteeth.core import LiteEthUDPIPCore
        from liteeth.frontend.etherbone import LiteEthEtherbone
        
        # Convert IP string to int
        ip_int = int(sum([int(x) << (8 * (3-i)) for i, x in enumerate(eth_ip.split("."))]))
        
        self.submodules.ethcore = LiteEthUDPIPCore(
            phy=self.ethphy,
            mac_address=0x10e2d5000000,
            ip_address=ip_int,
            clk_freq=sys_clk_freq
        )
        
        self.submodules.etherbone = LiteEthEtherbone(
            self.ethcore.udp, 
            1234,  # UDP port for Etherbone
            cd="sys"
        )
        
        # Connect Etherbone to SoC bus
        self.bus.add_master(master=self.etherbone.wishbone.bus)

        # Status LEDs to show activity
        self.submodules.leds = LedChaser(
            pads=platform.request_all("status_led"),
            sys_clk_freq=sys_clk_freq
        )

        # HUB75 Panel Control (basic framework)
        if platform.lookup_request("hub75", loose=True):
            hub75_pads = platform.request("hub75")
            # Add basic HUB75 control registers here
            # This would be expanded for full panel control

def main():
    parser = argparse.ArgumentParser(description="Custom ColorLight 5A-75B LED Controller")
    parser.add_argument("--build",              action="store_true", help="Build bitstream")
    parser.add_argument("--load",               action="store_true", help="Load bitstream")  
    parser.add_argument("--flash",              action="store_true", help="Flash bitstream")
    parser.add_argument("--ip-address",         default="192.168.1.45", help="Ethernet IP address")
    parser.add_argument("--eth-phy",            default=0, type=int, choices=[0, 1], help="Ethernet PHY (0 or 1)")
    parser.add_argument("--revision",           default="8.2", help="Board revision")
    parser.add_argument("--sys-clk-freq",       default=60e6, type=float, help="System clock frequency")

    args = parser.parse_args()

    soc = CustomColorLight(
        revision=args.revision,
        sys_clk_freq=int(args.sys_clk_freq),
        eth_ip=args.ip_address,
        eth_phy=args.eth_phy
    )

    builder = Builder(soc, output_dir="build")
    
    if args.build:
        builder.build()

    if args.load:
        prog = soc.platform.create_programmer()
        prog.load_bitstream("build/gateware/soc.bit")

    if args.flash:
        prog = soc.platform.create_programmer() 
        prog.flash(0, "build/gateware/soc.bit")

if __name__ == "__main__":
    main()