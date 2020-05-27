// import {round} from "./round";
import {
  Face,
  FaceRotationLetterToClockwise90DegreeRotationsFromUpright,
  FaceLetter, FaceLetters, FaceDigit, FaceOrientation, faceRotationLetterToClockwiseAngle
} from "./face";
import {
  Point
} from "./undoverline"
import {letterIndexTimesSixPlusDigitIndexFaceWithUndoverlineCodes, FaceWithUndoverlineCodes, UndoverlineCodes, getUndoverlineCodes} from "./undoverline-tables";
import {FaceDimensionsFractional} from "./face-dimensions";
export const FontFamily = "Inconsolata";
export const FontWeight = "700";

export enum UndoverlineType {
  underline = "underline",
  overline = "overline",
}

export function addUndoverlineCodes<T extends Face>(face: T): T & UndoverlineCodes {
  const letterIndexTimesSixPlusDigitIndex = (FaceLetters.indexOf(face.letter) * 6) + (parseInt(face.digit) -1);
  const {underlineCode, overlineCode} = 
    letterIndexTimesSixPlusDigitIndexFaceWithUndoverlineCodes[letterIndexTimesSixPlusDigitIndex];
  return Object.assign(face, {underlineCode, overlineCode});
}


export class RenderContext {
  constructor(
    protected ctx: CanvasRenderingContext2D,
    protected linearSizeOfFace: number
  ) {}

  protected readonly fontSize = FaceDimensionsFractional.fontSize * this.linearSizeOfFace;
  protected readonly letterSpacing = FaceDimensionsFractional.spaceBetweenLetterAndDigit * this.linearSizeOfFace;
  protected readonly fractionalXDistFromFaceCenterToCharCenter = (FaceDimensionsFractional.charWidth + FaceDimensionsFractional.spaceBetweenLetterAndDigit) / 2
  protected readonly charXOffsetFromCenter = this.fractionalXDistFromFaceCenterToCharCenter * this.linearSizeOfFace;
  private readonly undoverlineLength = FaceDimensionsFractional.undoverlineLength * this.linearSizeOfFace;
  private readonly undoverlineHeight = FaceDimensionsFractional.undoverlineThickness * this.linearSizeOfFace;
  private readonly undoverlineDotWidth = FaceDimensionsFractional.undoverlineDotWidth * this.linearSizeOfFace;
  private readonly undoverlineDotHeight = FaceDimensionsFractional.undoverlineDotHeight * this.linearSizeOfFace;

  renderFace = (
    face: Face,
    center: Point
  ): void => {
    const dieLeft = center.x - 0.5 * this.linearSizeOfFace;
    const dieTop = center.y - 0.5 * this.linearSizeOfFace;
    const undoverlineLeft = dieLeft + this.linearSizeOfFace * FaceDimensionsFractional.undoverlineLeftEdge;
    const undoverlineRight = undoverlineLeft + this.linearSizeOfFace * FaceDimensionsFractional.undoverlineLength;
    const firstDotLeft = dieLeft + this.linearSizeOfFace * FaceDimensionsFractional.undoverlineFirstDotLeftEdge ;
    const {underlineCode, overlineCode} = getUndoverlineCodes(face);

    // Draw an underline or overline
    const renderUndoverline = (lineType: "underline" | "overline", code: number): void => {
      const isOverline = lineType == "overline";
        // Calculate the coordinates of the black [und|ov]erline rectangle
        const fractionalTop =  isOverline ?
          FaceDimensionsFractional.overlineTop : FaceDimensionsFractional.underlineTop;
        const top = dieTop + this.linearSizeOfFace * fractionalTop;

      // Adjust from center top top of face, then add distance from top to face to top of dot box
      const fractionalDotTop =  isOverline ?
        FaceDimensionsFractional.overlineDotTop : FaceDimensionsFractional.underlineDotTop;
      const undoverlineDotTop = dieTop + this.linearSizeOfFace * fractionalDotTop;
//      const bottom = top + FaceDimensionsFractional.undoverlineThickness * this.linearSizeOfFace
      this.ctx.fillStyle = "#000000";
      this.ctx.fillRect(undoverlineLeft, top, this.undoverlineLength, this.undoverlineHeight);

      // Draw the white boxes representing the code in the [und|ov]erline
      // within the [und|ov]erline rectangle.
      this.ctx.fillStyle = "#FFFFFF";
      if (code != null) {
        const fullCode = 1024 + (isOverline ? 512 : 0) + (code << 1);
        for (var pos=0; pos <= 10; pos++) {
          if (((fullCode >> (10 - pos)) & 1) != 0) {
            // Draw a white box at position pos because that bit is 1 in the code
            const undoverlineDotLeft = firstDotLeft + this.undoverlineDotWidth * pos;
            this.ctx.fillRect(undoverlineDotLeft, undoverlineDotTop, this.undoverlineDotWidth, this.undoverlineDotHeight)
          }
        }
      }
    }

    // Rotate the canvas in counterclockwise before rendering, so that
    // when the rotation is restored (clockwise) the face will be in the
    // correct direction
    const rotateCanvasBy = faceRotationLetterToClockwiseAngle(face.orientationAsLowercaseLetterTRBL);
    if (rotateCanvasBy !== 0) {
        this.ctx.save()
        this.ctx.rotate(rotateCanvasBy)
    }

    // Calculate the positions of the letter and digit
    // Letter is left of center
    const letterX = center.x - this.charXOffsetFromCenter;
    // Digit is right of cetner
    const digitX = center.x + this.charXOffsetFromCenter;
    const textY = dieTop + FaceDimensionsFractional.textBaselineY * this.linearSizeOfFace
    // Render the letter and digit
    this.ctx.fillStyle = "#000000"
    this.ctx.textAlign = "center";
    const font = `${ FaceDimensionsFractional.fontSize * this.linearSizeOfFace }px 700 Inconsolata`;
    this.ctx.font = font;
    this.ctx.fillText(face.letter.toString(), letterX, textY)
    this.ctx.fillText(face.digit.toString(), digitX, textY)
    // Render the underline and overline
    renderUndoverline("underline", underlineCode);
    renderUndoverline("overline", overlineCode);

    // Undo the rotation used to render the face
    if (rotateCanvasBy !== 0) {
        this.ctx.restore()
    }

  }
    

}