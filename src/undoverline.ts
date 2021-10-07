import {
  decodeUnderlineTable, decodeOverlineTable
} from "./undoverline-tables";
import {
  FaceLetter, FaceDigit
} from "./face";
import {
  Point
} from "./drawing/point";
import {
  Line
} from "./drawing/line";
import { FaceWithUndoverlineCodes } from "index";


export interface UndoverlineJson {
  readonly line: Line;
  readonly code: number;
}

export const PointJsonKeys = ["x", "y"] as const;

export const LineJsonKeys = ["start", "end"] as const;

export const UndoverlineJsonKeys = ["line", "code"] as const;
(()=> {
  const testPointJsonKeys: readonly (keyof Point)[] = PointJsonKeys;
  const testLineJsonKeys: readonly (keyof Line)[] = LineJsonKeys;
  const testUndoverlineJsonKeys: readonly (keyof UndoverlineJson)[] = UndoverlineJsonKeys;
  console.log(testPointJsonKeys, testLineJsonKeys, testUndoverlineJsonKeys)
})

export class Undoverline implements UndoverlineJson {
  public readonly faceWithUndoverlineCodes: FaceWithUndoverlineCodes | undefined;
  public readonly letter: FaceLetter | undefined;
  public readonly digit: FaceDigit | undefined;

  constructor(
    public readonly lineType: "overline" | "underline",
    public readonly line: Line,
    public readonly code: number
  ) {
    this.faceWithUndoverlineCodes = lineType === "underline" ?
      decodeUnderlineTable[code] :
      decodeOverlineTable[code];

    this.letter =
      this.faceWithUndoverlineCodes == null ? undefined : this.faceWithUndoverlineCodes.letter;

    this.digit =
      this.faceWithUndoverlineCodes == null ? undefined : this.faceWithUndoverlineCodes.digit;
  }

  public static fromJsonObject = (
    lineType: "overline" | "underline",
    {line, code}: UndoverlineJson
  ) => new Undoverline(lineType, line, code);
  
  public static fromJsonUnderlineObject = (jsonObj: UndoverlineJson | undefined) =>
    jsonObj && Undoverline.fromJsonObject("underline", jsonObj);
  public static fromJsonOverlineObject = (jsonObj: UndoverlineJson | undefined) =>
    jsonObj && Undoverline.fromJsonObject("overline", jsonObj);
}
