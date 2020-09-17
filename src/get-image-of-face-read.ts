import {
  Line, Undoverline
} from "./undoverline";
import {
  FaceRead
} from "./face-read";
import {
  drawRotatedAndScaledImage
} from "./draw-rotated-and-scaled-image";


const angleOfLineInSignedRadians2f = ({start, end}: Line) =>
	Math.atan2(end.y - start.y, end.x - start.x);

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
  const {
    center,
    underline,
    overline
  } = faceRead;

  /**
   * Determine the more reliable underline/overline to read
   */
  const undoverlines: Undoverline[] = (
    // get the set of 0-2 undoverlines that are not null
    [underline, overline].filter( u => u != null ) as Undoverline[]
  ).sort( (a, b) =>
    // sort undoverlines so that one that better matches OCR read comes
    // first
    (a.letter === faceRead.ocrLetterCharsFromMostToLeastLikely[0] && 
     a.digit === faceRead.ocrDigitCharsFromMostToLeastLikely[0]
    ) ? -1 :
    ( b.letter === faceRead.ocrLetterCharsFromMostToLeastLikely[0] && 
      b.digit === faceRead.ocrDigitCharsFromMostToLeastLikely[0]
    ) ? 1 :
    0
  );
  if (undoverlines.length == 0) {
    return false;
  }
  const {line} = undoverlines[0];
  const {end, start} = line;
  // Calculate the underline/overline length with help from Pythagoras et al.
  const lineLength = Math.sqrt( Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2) );
  // Copy an extra 20% for extra buffer in case angles are off and so that
  // the image does not appear to cramped.
  const srcSize = lineLength * 1.2;

  drawRotatedAndScaledImage(dstCtx, srcImage,
    {x: dstCtx.canvas.width/2, y: dstCtx.canvas.height/2},
    center,
    angleOfLineInSignedRadians2f(undoverlines[0].line),
    dstCtx.canvas.width / srcSize
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
    renderImageOfFaceRead(dieRenderingCtx, srcImageRenderingCanvas, faceRead);
  } else {
    renderImageOfFaceRead(dieRenderingCtx, srcImage, faceRead);
  }
  const {width, height} = dieRenderingCanvas!;
  return dieRenderingCtx.getImageData(0, 0, width, height);
}