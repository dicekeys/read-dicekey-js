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
  constructor(
    public readonly lineType: "overline" | "underline",
    public readonly line: Line,
    public readonly code: number
  ) {}

      
  public static fromJsonObject = (
    lineType: "overline" | "underline",
    {line, code}: UndoverlineJson
  ) => new Undoverline(lineType, line, code);
  
  public static fromJsonUnderlineObject = (jsonObj: UndoverlineJson | undefined) =>
    jsonObj && Undoverline.fromJsonObject("underline", jsonObj);
  public static fromJsonOverlineObject = (jsonObj: UndoverlineJson | undefined) =>
    jsonObj && Undoverline.fromJsonObject("overline", jsonObj);

  public readonly faceWithUndoverlineCodes =
    this.lineType === "underline" ?
      decodeUnderlineTable[this.code] :
      decodeOverlineTable[this.code];

  public readonly letter: FaceLetter | undefined =
    this.faceWithUndoverlineCodes == null ? undefined : this.faceWithUndoverlineCodes.letter;

  public readonly digit: FaceDigit | undefined =
    this.faceWithUndoverlineCodes == null ? undefined : this.faceWithUndoverlineCodes.digit;
}
