import {DiceKeyImageProcessorModulePromise} from "./dicekey-image-processor"
var path = require('path');
import {
    createCanvas, createImageData
} from "canvas";
import * as fs from "fs";

import Jimp from "jimp"
import { getImageOfFaceRead } from "./get-image-of-face-read";
import { FaceRead } from "./face-read";

describe("getImageOfFaceRead tests", () => {
    test('image with read error', async () => {
        const image = await Jimp.read(
            path.resolve(
                __dirname,
                '../cpp/read-dicekey/tests/test-lib-read-keysqr/img/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg'
        ));
        const mod = await DiceKeyImageProcessorModulePromise;
        const diceKeyImageProcessor = new mod.DiceKeyImageProcessor();
        const {bitmap} = image;
        const {width, height, data} = bitmap;

        const beforeMs = (new Date()).getTime();
        const result = diceKeyImageProcessor.processAndAugmentRGBAImage(width, height, data);
        // bitmap.data.set(bitMapBuffer);
        image.write("test-outputs/processAndAugmentRGBAImage.png");
        const afterMs = (new Date()).getTime();

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        const imageData = createImageData(width, height);
        imageData.data.set(data);
        ctx.putImageData(imageData, 0, 0);

        const charCanvas = createCanvas(200, 200);
        const destCtx = charCanvas.getContext("2d");
        const facesRead = JSON.parse(diceKeyImageProcessor.diceKeyReadJson()) as FaceRead[];
        const faceToGet = facesRead[1]; 
        
        getImageOfFaceRead(destCtx, ctx.canvas, faceToGet);
        fs.writeFileSync("fixme.png", charCanvas.toBuffer());

        // console.log(`processJsImageData ${bitmap.width}x${bitmap.height} time (ms)`, afterMs - beforeMs);
        diceKeyImageProcessor.delete();
        expect(result);
    });
});