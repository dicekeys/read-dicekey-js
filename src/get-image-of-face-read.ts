import {
  angleOfLineInSignedRadians2f
} from "./drawing";
import {
  Undoverline
} from "./undoverline";
import {
  FaceRead
} from "./face-read";
import {
  drawRotatedAndScaledImage
} from "./drawing/draw-rotated-and-scaled-image";

/**
 * Render a single face from among the 25 faces read in an image of a DiceKey.
 * Used so that we can read images with bit errors and have the user error-check
 * them for us.
 * 
 * @param dstCtx The rendering context of the canvas to write into
 * @param srcImage The source image from which a DiceKey was read
 * @param faceRead The face to grab an image of.
 * 
 * @returns True if successful, false if unable to find the die center/angle to read
 */
export const renderImageOfFaceRead = (
  dstCtx: CanvasRenderingContext2D,
  srcImage: HTMLCanvasElement | ImageBitmap,
  faceRead: FaceRead
): boolean => {
  drawRotatedAndScaledImage(dstCtx, srcImage,
    {x: dstCtx.canvas.width/2, y: dstCtx.canvas.height/2},
    faceRead.center,
    faceRead.inferredAngleInRadians,
    dstCtx.canvas.width / faceRead.inferredFaceSize
  );
  return true;
}



var srcImageRenderingCanvas: HTMLCanvasElement | undefined;
var srcImageRenderingCtx: CanvasRenderingContext2D | undefined;

var dieRenderingCanvas: HTMLCanvasElement | undefined;
var dieRenderingCtx: CanvasRenderingContext2D | undefined;


/**
 * Get an ImageData object containing a single face among the 25 faces read in
 * an image of a DiceKey. Used so that we can read images with bit errors and
 * have the user error-check them for us.
 * 
 * @param dstCtx The rendering context of the canvas to write into
 * @param srcImage The source image from which a DiceKey was read
 * @param faceRead The face to grab an image of.
 * 
 * @returns True if successful, false if unable to find the die center/angle to read
 */
export const getImageOfFaceRead = (
  srcImage: HTMLCanvasElement | ImageBitmap | ImageData,
  faceRead: FaceRead,
  renderSize: number = 200
): ImageData => {
  if (dieRenderingCanvas == null || dieRenderingCtx == null) {
    dieRenderingCanvas = document.createElement("canvas");
    dieRenderingCtx = dieRenderingCanvas.getContext("2d")!;
  }
  if (dieRenderingCanvas.width !== renderSize || dieRenderingCanvas.height !== renderSize) {
    const dieRenderingSize: string = renderSize?.toString() ?? "200";
    dieRenderingCanvas.setAttribute("width", dieRenderingSize);
    dieRenderingCanvas.setAttribute("height", dieRenderingSize);
  }
  if (srcImage instanceof ImageData) {
    if (srcImageRenderingCanvas == null || srcImageRenderingCtx == null) {
      srcImageRenderingCanvas = document.createElement("canvas");
      srcImageRenderingCtx = srcImageRenderingCanvas.getContext("2d")!;
    }
    if (srcImageRenderingCanvas.width !== srcImage.width || srcImageRenderingCanvas.height !== srcImage.height) {
      srcImageRenderingCanvas.setAttribute("width", srcImage.width.toString());
      srcImageRenderingCanvas.setAttribute("height", srcImage.height.toString());  
    }
    srcImageRenderingCtx.putImageData(srcImage, 0, 0);
    renderImageOfFaceRead(dieRenderingCtx, srcImageRenderingCanvas, faceRead);
  } else {
    renderImageOfFaceRead(dieRenderingCtx, srcImage, faceRead);
  }
  const {width, height} = dieRenderingCanvas!;
  return dieRenderingCtx.getImageData(0, 0, width, height);
}