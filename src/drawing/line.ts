import {Point} from "./point";

export interface Line {
  readonly start: Point;
  readonly end: Point;
}

export const angleOfLineInSignedRadians2f = ({start, end}: Line) =>
  Math.atan2(end.y - start.y, end.x - start.x);

export const midpointOfLine = ({start, end}: Line): Point => ({
  x: (end.x + start.x) / 2,
  y: (end.y + start.y) / 2
});

export const lineLength = ({start, end}: Line): number =>
  Math.sqrt( Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2) );
