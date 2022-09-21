//Update canvas display with frames received via websocket from server
export class DisplayCanvas {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    imageData: ImageData;
    imageBuf8: Uint8ClampedArray;
    imageBuf: ArrayBuffer;
    boxes: NodeListOf<any>;

    //width and height are led-display-pixels, not canvas pixels.
    constructor(width, height, zoom, displayId, boxClass) {

        this.canvas = document.querySelector(displayId);
        this.boxes = document.querySelectorAll(boxClass);

        //scaling
        this.canvas.width = width
        this.canvas.height = height

        //context and buffer
        this.canvasContext = this.canvas.getContext('2d');
        this.imageData = this.canvasContext.getImageData(0, 0, width, height);

        //zoom
        for (const box of this.boxes) {
            box.style.width = this.canvas.width * zoom + 'px';
            box.style.height = this.canvas.height * zoom + 'px';
        }



    }



    frame(arrayBuffer: ArrayBuffer) {

        this.imageData.data.set(new Uint8Array(arrayBuffer))
        window.requestAnimationFrame(()=>{
            this.canvasContext.putImageData(this.imageData, 0, 0);
        })

    }


}
