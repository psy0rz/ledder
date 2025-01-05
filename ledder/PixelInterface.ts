import type ColorInterface from "./ColorInterface.js";

export default interface PixelInterface {
    x: number;
    y: number;
    color: ColorInterface;
    data?: any //arbitrary datafield
}
