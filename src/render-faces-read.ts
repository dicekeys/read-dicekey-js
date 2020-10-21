import {
  FaceRead,
} from "./face-read";
import {
  FaceDimensionsFractional
} from "./face-dimensions";
import {
  getFaceSizeAndAngle
} from "./get-face-size-and-angle";
import {
  drawRotatedRect
 } from "./drawing/draw-rotated-rect";
import {
  createAngularCoordinateSystem
} from "./drawing/create-angular-coordinate-system";

export interface RenderFaceReadOptions {
  lineThicknessAfFractionOfFaceSize?: number;
  errorLineThicknessAsFractionOfFaceSize?: number;
  colorIndicatingCorrectness?: string;
  colorIndicatingSmallError?: string;
  colorIndicatingLargeError?: string;
  drawFaceOutlineRectangleIfFaceReadWithErrors?: boolean;
}

/**
 * Render a FaceRead onto a canvas rendering context.
 * @param ctx 
 * @param faceRead 
 */
export const renderFaceRead = (ctx: CanvasRenderingContext2D, faceRead: FaceRead, options: RenderFaceReadOptions = {}) => {
  const faceDimensions = getFaceSizeAndAngle(faceRead);
  if (faceDimensions == null) {
    return;
  }
  const {faceSizeInPixels, angleInRadians} = faceDimensions;
  const {center, underline, overline} = faceRead;
  const {
    lineThicknessAfFractionOfFaceSize = 0.02,
    errorLineThicknessAsFractionOfFaceSize = lineThicknessAfFractionOfFaceSize * 2,
    colorIndicatingCorrectness = "rgba(0,255,0,0.5)",
    colorIndicatingSmallError = "rgba(207, 83, 0,0.75)",
    colorIndicatingLargeError = "rgba(255,32,32,.75)",
    drawFaceOutlineRectangleIfFaceReadWithErrors = true,
  } = options

  const coordinateSystemFromCenterOfDie = createAngularCoordinateSystem(center, angleInRadians);
  const undoverlineLength = faceSizeInPixels * FaceDimensionsFractional.undoverlineLength;
  const undoverlineThickness = faceSizeInPixels * FaceDimensionsFractional.undoverlineThickness
  const centerOfUndoverlineToCenterOfFace = FaceDimensionsFractional.centerOfUndoverlineToCenterOfFace * faceSizeInPixels;
  const defaultLineThickness = 1 + Math.floor(lineThicknessAfFractionOfFaceSize * faceSizeInPixels);
  const errorLineThickness = 1 + Math.floor(errorLineThicknessAsFractionOfFaceSize * faceSizeInPixels);

  const {errors} = faceRead;
  const hasErrors = errors != null && errors.length > 0;
  ctx.lineWidth = errorLineThickness;

  ctx.fillStyle = ctx.strokeStyle =
    (!hasErrors) ?
      colorIndicatingCorrectness :
    (errors.length == 1 && errors[0].type === "undoverline-bit-mismatch" && errors[0].hammingDistance <= 2) ?
      colorIndicatingSmallError :
      colorIndicatingLargeError;

  // Draw a rectangle around the face if an error has been found
  if (hasErrors && drawFaceOutlineRectangleIfFaceReadWithErrors) {
    drawRotatedRect(ctx, center, faceSizeInPixels, faceSizeInPixels, angleInRadians);
    ctx.stroke();
  }

  const underlineError = (errors && errors.length > 0 && errors[0].type === "undoverline-bit-mismatch" && errors[0].location === "underline");
  const overlineError = (errors && errors.length > 0 && errors[0].type === "undoverline-bit-mismatch" && errors[0].location === "overline");

  if (underline) {
    const underlineCenter = coordinateSystemFromCenterOfDie.pointAtAsXy({x: 0, y: centerOfUndoverlineToCenterOfFace});
    drawRotatedRect(ctx, underlineCenter, undoverlineLength, undoverlineThickness, angleInRadians);
    ctx.stroke();
  }

  if (overline) {
    const overlineCenter = coordinateSystemFromCenterOfDie.pointAtAsXy({x: 0, y: -centerOfUndoverlineToCenterOfFace});
    drawRotatedRect(ctx, overlineCenter, undoverlineLength, undoverlineThickness, angleInRadians);
    ctx.stroke();
  }

  const fontString = `bold ${faceSizeInPixels * FaceDimensionsFractional.fontSize}px Inconsolata,monospace`;
  ctx.font = fontString;
  const distanceToBaseline = FaceDimensionsFractional.textBaselineY-FaceDimensionsFractional.center;
  if (faceRead.letter) {
    ctx.save();
    ctx.translate(...coordinateSystemFromCenterOfDie.pointAtAsTuple({
      x: -faceSizeInPixels * FaceDimensionsFractional.textRegionWidth/2,
      y: faceSizeInPixels * distanceToBaseline
    }));
    ctx.rotate(angleInRadians)
    ctx.fillText(faceRead.letter, 0, 0)
    ctx.restore();
  }
  if (faceRead.digit) {
    ctx.save();
    ctx.translate(...coordinateSystemFromCenterOfDie.pointAtAsTuple({
      x: faceSizeInPixels * FaceDimensionsFractional.spaceBetweenLetterAndDigit/2,
      y: faceSizeInPixels * distanceToBaseline
    }));
    ctx.rotate(angleInRadians)
    ctx.fillText(faceRead.digit, 0, 0)
    ctx.restore();
  }
}

export const renderFacesRead = (
  ctx: CanvasRenderingContext2D,
  facesRead: FaceRead[],
  options?: RenderFaceReadOptions  
) => facesRead.forEach( face => renderFaceRead(ctx, face, options));
