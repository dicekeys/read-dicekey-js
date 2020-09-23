import {Point} from "./point";

/**
 * Create an angular coordinate system centered around a zero point and at an
 * angle, for translating points.  Useful for drawing objects into to match
 * an object that rotated or for drawing such objects as rotated rectangles.
 * 
 * @param zeroPoint The center of the coordinate system
 * @param angleInRadians The angle at which it is rotated.
 */
export const createAngularCoordinateSystem = (zeroPoint: Point, angleInRadians: number) => {
  const cosAngle = Math.cos(angleInRadians);
  const sinAngle = Math.sin(angleInRadians);
  const pointAtAsXy = (offset: Point): Point => ({
    x: zeroPoint.x + offset.x * cosAngle - offset.y * sinAngle,
    y: zeroPoint.y + offset.x * sinAngle + offset.y * cosAngle
  })
  const pointAtAsTuple = (offset: Point): [number, number] => [    
    zeroPoint.x + offset.x * cosAngle - offset.y * sinAngle,
    zeroPoint.y + offset.x * sinAngle + offset.y * cosAngle
  ];
  return {pointAtAsXy, pointAtAsTuple};
}