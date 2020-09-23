
/**
 * Create a transformation matrix for a destination drawing context to
 * rotate, copy, and scale an image from a source image.
 * 
 * @param dstCenter The center x and y coordinates where that center point should land in the destination coordinate system 
 * @param srcCenter The x and y coordinates for the center point at which the rotation will happen.
 * @param rotationAngleInRadians The angle to rotate in radians
 * @param linearScalingFactorAsDestPixelsPerSourcePixel  A scaling factor (the same for both x and y dimensions)
 * provided as a ratio of the destination resolution/size over the source resolution/size.
 * So, if there's 2 destination pixels for every source pixel on a given axis, it would be 2.
 * 
 * Example:
 * ```typescript
 *   const transform = createTransformArrayToRotateAndScaleAnImage(
 *       // In this example, the copied image is rotated around the center
 *       // of the destination canvas.
 *       {x: dstCtx.canvas.width / 2, y: dstCtx.canvas.height/2},
 *       // The center point for the rotation in the source coordinate system
 *       {x: 20, y: 20),
 *       // An angle in radians
 *       Math.pi / 2,
 *       // Scale to the size of the destination canvas
 *       dstCtx.canvas.width / srcSize
 *   );
 *   dstCtx.setTransform(...transform);
 *   dstCtx.drawImage(srcImage, 0, 0);
 *   dstCtx.resetTransform();
 * ```
 */
export function createTransformArrayToRotateAndScaleAnImage(
  dstCenter: {x: number, y: number},
  srcCenter: {x: number, y: number},
  rotationAngleInRadians: number,
  linearScalingFactorAsDestPixelsPerSourcePixel: number = 1
): [number, number, number, number, number, number] {
  const scaledCosAngle = Math.cos(rotationAngleInRadians) * linearScalingFactorAsDestPixelsPerSourcePixel;
  const scaledSinAngle = Math.sin(rotationAngleInRadians) * linearScalingFactorAsDestPixelsPerSourcePixel;
  // The explanation of transform matrices I found most help was 
  // https://www.w3resource.com/html5-canvas/html5-canvas-matrix-transforms.php
  const a = scaledCosAngle;
  const c = scaledSinAngle;
  const e = dstCenter.x - srcCenter.x * scaledCosAngle - srcCenter.y * scaledSinAngle;
  const b = -scaledSinAngle;
  const d = scaledCosAngle;
  const f = dstCenter.y + srcCenter.x * scaledSinAngle - srcCenter.y * scaledCosAngle;
  return [a, b, c, d, e, f]
}

/**
 * Rotate, scale, and draw a source image onto a CanvasRenderingContext2D, using the center
 * of rotation as the common frame of reference between the source the source and destination
 * coordinate systems.
 * 
 * @param dstCtx The CanvasRenderingContext2D of the canvas to draw onto.
 * @param srcImage The source image to rotate and copy, which must be a valid
 * first parameter for the CanvasRenderingContext2D.drawImage method.
 * @param srcCenter The x and y coordinates for the center point at which the rotation
 * will happen in the source coordinate system.
 * @param dstCenter The center x and y coordinates in the destination coordinate
 * system at which the center of rotation should
 * be written to.
 * @param rotationAngleInRadians The angle to rotate in radians
 * @param linearScalingFactorAsDestPixelsPerSourcePixel  A scaling factor
 * (the same for both x and y dimensions) provided as a ratio of
 * the destination resolution/size over the source resolution/size.
 * So, if there's 2 destination pixels for every source pixel on a
 * given axis, it would be 2.  (Defaults to 1.)
 * 
 * Example:
 * ```typescript
 *   drawScaledAndRotated(
 *       destCtx,
 *       srcImage,
 *       // In this example, the copied image is rotated around the center
 *       // of the destination canvas.
 *       {x: dstCtx.canvas.width / 2, y: dstCtx.canvas.height/2},
 *       // The center point for the rotation in the source coordinate system
 *       {x: 20, y: 20),
 *       // An angle in radians
 *       Math.pi / 2,
 *       // Scale to the size of the destination canvas
 *       dstCtx.canvas.width / diameterOfContentToBeCopiedInSrcCoordiantes
 *   );
 * ```
 */
export function drawRotatedAndScaledImage(
  dstCtx: CanvasRenderingContext2D,
  srcImage: HTMLCanvasElement | ImageBitmap,
  dstCenter: {x: number, y: number},
  srcCenter: {x: number, y: number},
  rotationAngleInRadians: number,
  linearScalingFactorAsDestPixelsPerSourcePixel: number = 1
) {
  dstCtx.setTransform(...createTransformArrayToRotateAndScaleAnImage(
    dstCenter, srcCenter, rotationAngleInRadians, linearScalingFactorAsDestPixelsPerSourcePixel
  ))
  dstCtx.drawImage(srcImage, 0, 0);
  dstCtx.resetTransform();
}
