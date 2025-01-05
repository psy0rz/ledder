import Draw from "../Draw.js";
import Pixel from "../Pixel.js";
import type ColorInterface from "../ColorInterface.js";

//draw a circle x0,y0 are center coordinates.
export default class DrawCircle extends Draw {
    constructor(x0: number, y0: number, radius: number, color: ColorInterface) {
        super();
        //Midpoint circle algorithm for ledder by WallieOnline
        var x = radius;
        var y = 0;
        var radiusError = 1 - x;
        while (x >= y) {
            this.add(new Pixel(x + x0, y + y0, color));
            this.add(new Pixel(y + x0, x + y0, color));
            this.add(new Pixel(-x + x0, y + y0, color));
            this.add(new Pixel(-y + x0, x + y0, color));
            this.add(new Pixel(-x + x0, -y + y0, color));
            this.add(new Pixel(-y + x0, -x + y0, color));
            this.add(new Pixel(x + x0, -y + y0, color));
            this.add(new Pixel(y + x0, -x + y0, color));
            y++;
            if (radiusError < 0) {
                radiusError += 2 * y + 1;
            }
            else {
                x--;
                radiusError+= 2 * (y - x + 1);
            }
        }
    }
}
