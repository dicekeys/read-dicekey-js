import {
  FaceRead,
} from "./face-read";
import {
  Undoverline
} from "./undoverline";
import {
  FaceDimensionsFractional
} from "./face-dimensions";

type TupleOfOneOrTwo<T> = [T] | [T, T]

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
  const undoverlines = [underline, overline].filter( u => u != null ) as Undoverline[];
  if (undoverlines.length == 0) {
    return undefined;
  }
  const lineLengths = undoverlines.map( ({line}) => Math.sqrt( Math.pow(line.end.x - line.start.x, 2) + Math.pow(line.end.y - line.start.y, 2) )) as TupleOfOneOrTwo<number>;
  const anglesInRadians = undoverlines.map( ({line}) => Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x)) as TupleOfOneOrTwo<number>;


  const undoverlineLength = lineLengths.reduce( (r, lineLength) => r + lineLength, 0) / lineLengths.length;
  const faceSizeInPixels = undoverlineLength / FaceDimensionsFractional.undoverlineLength;
  const [angleInRadians0, angleInRadians1] = anglesInRadians;
  const angleInRadians = (angleInRadians1 == null || Math.abs(angleInRadians0 - angleInRadians1) > Math.PI) ?
    angleInRadians0 :
    (angleInRadians0 + angleInRadians1) / 2;
  return {faceSizeInPixels, angleInRadians};
}