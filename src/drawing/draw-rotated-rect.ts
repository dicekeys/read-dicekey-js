import {createAngularCoordinateSystem} from "./create-angular-coordinate-system";
import {Point} from "./point";

/**
 * Draw a rotated rectangle into a canvas rendering context.
 * The caller needs to call stroke() or fill() on the canvas
 * rendering context based on whether they want to draw the
 * edges or fill in the rectangle.
 * 
 * @param ctx 
 * @param center 
 * @param xSize 
 * @param ySize 
 * @param angleInRadians 
 */
export const drawRotatedRect = (ctx: CanvasRenderingContext2D, center: Point, xSize: number, ySize: number, angleInRadians: number) => {
  const coordinateSystemAtCenterOfRectangle = createAngularCoordinateSystem(center, angleInRadians);
  const halfXSize = xSize / 2;
  const halfYSize = ySize / 2;

  const points = ([
      [-1, -1], [-1, 1], [1, 1], [1, -1]
    ] as const
  ).map( ([xDir, yDir]) => coordinateSystemAtCenterOfRectangle.pointAtAsTuple({x: halfXSize * xDir, y: halfYSize * yDir}) )
  // Start at the last point
  ctx.moveTo(...points[3]!)
  ctx.beginPath();
  // Draw a line around the rectangle starting from  point 3
  // to point 0, then to 1, then 2, then back to 3.
  points.forEach( point => ctx.lineTo(...point));
}