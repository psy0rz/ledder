import Draw from "../Draw.js";
import Pixel from "../Pixel.js";
import PixelList from "../PixelList.js";
import type ColorInterface from "../ColorInterface.js";
import Color from "../Color.js";

// Draw a line using Bresenham's algorithm
export default class DrawLine extends Draw {
    constructor(x1: number, y1: number, x2: number, y2: number, color1: ColorInterface, color2?: ColorInterface) {
        super();

        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let sx = x1 < x2 ? 1 : -1;
        let sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;

        let steps = Math.max(dx, dy);
        let i = 0;

        let x = x1;
        let y = y1;

        while (true) {
            if (color2 !== undefined) {
                let weight = steps === 0 ? 0 : i / steps;
                this.add(new Pixel(x, y, this.interpolateColor(color1, color2, weight)));
            } else {
                this.add(new Pixel(x, y, color1));
            }
            if (x === x2 && y === y2) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x += sx; }
            if (e2 < dx) { err += dx; y += sy; }
            i++;
        }
    }

    interpolateColor(color1: ColorInterface, color2: ColorInterface, weight: number) {
        let c1 = color1.copy();
        let c2 = color2.copy();
        let r = Math.round((c1.r * (1 - weight)) + (c2.r * weight));
        let g = Math.round((c1.g * (1 - weight)) + (c2.g * weight));
        let b = Math.round((c1.b * (1 - weight)) + (c2.b * weight));
        let a = Math.min(1.0, (c1.a * (1 - weight)) + (c2.a * weight));
        return new Color(r, g, b, a);
    }
}