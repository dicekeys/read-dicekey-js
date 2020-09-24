import {
  DiceKeyImageProcessorModulePromise
} from "../dicekey-image-processor"
var path = require('path');
import {
    createCanvas, createImageData
} from "canvas";
import * as fs from "fs";

import Jimp from "jimp"
import {
  renderImageOfFaceRead
} from "../get-image-of-face-read";
import {
  FaceRead, FaceReadJson
} from "../face-read";

const testData: string[] = [
  "C22I12L11G51P31F53K22V40S13W53T31O50Z30B13M51E22J13H43U30A13D62N13R61X60Y41-faded.jpg",
  "D2tS2tP2lN2lO2bC2bA2lX1tG1lY2rH2lT2tR1lU2rM1tB2lV2lE2bZ1bF2tI1bJ2rL2lK2bW2t.jpg",
];

const testDir = `../../cpp/read-dicekey/tests/test-lib-read-keysqr/img`;

/**
 * @jest-environment jsdom
 */
describe(`getImageOfFaceRead tests`, () => {
  for (const fileName of testData) {
    const filePrefix = fileName.split(".")[0];
    test(`image with read error ${filePrefix}`, async () => {
        const image = await Jimp.read(
            path.resolve(
                __dirname,
                `${testDir}/${fileName}`
        ));
        const mod = await DiceKeyImageProcessorModulePromise;
        const diceKeyImageProcessor = new mod.DiceKeyImageProcessor();
        const {bitmap} = image;
        const {width, height, data} = bitmap;

        const beforeMs = (new Date()).getTime();
        const result = diceKeyImageProcessor.processAndAugmentRGBAImage(width, height, data);
        // bitmap.data.set(bitMapBuffer);
        // image.write(`test-outputs/processAndAugmentRGBAImage-before-${filePrefix}.png`);
        const afterMs = (new Date()).getTime();

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        const imageData = createImageData(width, height);
        imageData.data.set(data);
        ctx.putImageData(imageData, 0, 0);
        const facesRead = (
          (JSON.parse(diceKeyImageProcessor.diceKeyReadJson()) ?? []) as FaceReadJson[]
        ).map( face => FaceRead.fromJsonObject(face) )

        facesRead.forEach( (face, faceIndex) => {
          if (face.errors && face.errors.length > 0) {      
            const charCanvas = createCanvas(200, 200);
            const destCtx = charCanvas.getContext("2d");
            renderImageOfFaceRead(destCtx, ctx.canvas, face);
            fs.writeFileSync(`test-outputs/${filePrefix}-${ face.errors.map( e => e.type ).join("--") }.png`, charCanvas.toBuffer());
            fs.writeFileSync(`test-outputs/${filePrefix}-before-face-isolated.png`, canvas.toBuffer());

          const faceImageDataArray = diceKeyImageProcessor.getFaceImage(faceIndex);
          const faceImageSize = Math.round(Math.sqrt((faceImageDataArray.length / 4)));
          const faceImageData = createImageData(new Uint8ClampedArray(faceImageDataArray.buffer), faceImageSize);
          const faceImageCanvas = createCanvas(faceImageData.width, faceImageData.height);
          faceImageCanvas.getContext("2d")!.putImageData(faceImageData, 0, 0);
          fs.writeFileSync(`test-outputs/${filePrefix}-${ faceIndex }.png`, faceImageCanvas.toBuffer());
        }
      });

        diceKeyImageProcessor.delete();
        expect(result);
    });
  }
});