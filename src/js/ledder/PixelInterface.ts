import {ColorInterface} from "./ColorInterface.js";

export interface PixelInterface {
    x: number;
    y: number;
    color: ColorInterface;
    data?: any //arbitrary datafield
}
