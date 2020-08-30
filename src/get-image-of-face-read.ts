import {
  Line, Undoverline
} from "./undoverline";
import {
  FaceRead
} from "./face-read";
import { Canvas, Image } from "canvas";
import { faceRotationLetterToClockwiseAngle } from "./face";

  
export const angleOfLineInSignedRadians2f = (line: Line) => {
  const {start, end} = line;
	const deltaX = end.x - start.x;
	const deltaY = end.y - start.y;
	return Math.atan2(deltaY, deltaX);
}

// from https://stackoverflow.com/questions/17411991/html5-canvas-rotate-image
// x,y position of image center
// scale scale of image
// rotation in radians.
// same as above but cx and cy are the location of the point of rotation
// in image pixel coordinates
const drawImageCenter = (
  ctx: CanvasRenderingContext2D,
  image: ImageBitmap,
  x: number, y: number,
  scale: number,
  rotation: number
) => {
  ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
  ctx.rotate(rotation);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.setTransform(1,0,0,1,0,0);
}

export const getImageOfFaceRead = (destCtx: CanvasRenderingContext2D, srcImage: HTMLCanvasElement | ImageBitmap, faceRead: FaceRead) => {
  const {
    center,
    underline,
    overline
  } = faceRead;

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
    return undefined;
  }
  const {line} = undoverlines[0];
  const {end, start} = line;
  const angle = angleOfLineInSignedRadians2f(undoverlines[0].line);
  const lineLength = Math.sqrt( Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2) );
  const scale = destCtx.canvas.width / (lineLength * 1.2);
  const {x, y} = center;  
  destCtx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
//  destCtx.rotate(angle);
  const halfImage = lineLength / 2;// 0;// destCtx.canvas.width / (2 * scale);
  destCtx.drawImage(srcImage, -x, -y);// -x + halfImage, -y + halfImage);
  destCtx.setTransform(1,0,0,1,0,0);
}
