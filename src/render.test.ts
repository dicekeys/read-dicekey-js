import {createCanvas} from "canvas";
import Jimp from "jimp"
import {RenderContext} from "./dicekeys/render";
import {writeFileSync} from "fs";
test('Render A1', async () => {
  const canvas = createCanvas(500, 500, "svg");
  const ctx = canvas.getContext("2d");
  const rc = new RenderContext(ctx, 100);
  rc.renderFace({letter: "A", digit: "1", orientationAsLowercaseLetterTRBL: "t"}, {x: 250, y: 250});
  writeFileSync("test-outputs/A1t.svg", canvas.toBuffer());
});
