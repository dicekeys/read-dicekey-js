import {
  FaceRead,
} from "./face-read";
import {
  Undoverline
} from "./undoverline";
import {
  FaceDimensionsFractional
} from "./face-dimensions";

/**
 * Given a FaceRead record, calculate the size of the face image in pixels and the angle of the die
 * by inspecting the underlines and overlines.
 * 
 * @param faceRead 
 * 
 * @returns undefined if there is no underline or overline in the FaceRead record
 */
export const getFaceSizeAndAngle = (faceRead: FaceRead): {faceSizeInPixels: number, angleInRadians: number} | undefined => {
  const {
    underline,
    overline
  } = faceRead;
  const undoverlineData = (
    // get the set of 0-2 undoverlines that are not null
    [underline, overline].filter( u => u != null ) as Undoverline[]
  ).map( ({line}) => ({
    lineLength: Math.sqrt( Math.pow(line.end.x - line.start.x, 2) + Math.pow(line.end.y - line.start.y, 2) ),
    angleInRadians: Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x)
  }));
  if (undoverlineData.length == 0) {
    return undefined;
  }
  const undoverlineLength = undoverlineData.reduce( (r, {lineLength}) => r + lineLength, 0) / undoverlineData.length;
  const faceSizeInPixels = undoverlineLength / FaceDimensionsFractional.undoverlineLength;
  const angleInRadians = (undoverlineData.length < 2 || 
    Math.abs(undoverlineData[0].angleInRadians - undoverlineData[1].angleInRadians) > Math.PI
  ) ? undoverlineData[0].angleInRadians :
    (undoverlineData[0].angleInRadians + undoverlineData[1].angleInRadians) / 2;
  return {faceSizeInPixels, angleInRadians};
}