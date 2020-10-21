import {DiceKeyImageProcessorModulePromise} from "../dicekey-image-processor"
var path = require('path');
import * as fs from "fs";
import {
    createCanvas, createImageData
} from "canvas";

import Jimp from "jimp"
import { FaceRead } from "face-read";
import { renderFacesRead } from "../render-faces-read";

const testDir = `../../cpp/read-dicekey/tests/test-lib-read-dicekey/img`

test('processRGBAImage', async () => {
    // Uncomment this if you're having problems with CI not finding the directory
    // in the submodule and want to see the dir layout before the CI failure...
    // const pc = ["..", "cpp", "read-dicekey", "tests", "test-lib-read-dicekey", "img"];
    // [...Array(pc.length).keys()].forEach( (i) => {
    //     const p = path.resolve( __dirname, pc.slice(0, i+1).join("/"));P
    //     console.log(p, JSON.stringify(fs.readdirSync(p), null, 2));
    // });
    const image = await Jimp.read(
        path.resolve(
            __dirname,
            `${testDir}/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg`
    ));
    const diceKeyImageProcessor = new (await DiceKeyImageProcessorModulePromise).DiceKeyImageProcessor();
    const {bitmap} = image;
    const beforeMs = (new Date()).getTime();
    const result = diceKeyImageProcessor.processRGBAImage(bitmap.width, bitmap.height, bitmap.data);
    const afterMs = (new Date()).getTime();
    // console.log(`processRGBAImage ${bitmap.width}x${bitmap.height} time (ms)`, afterMs - beforeMs);
    diceKeyImageProcessor.delete();
    expect(result);
});


test('processRGBAImageAndRenderOverlay', async () => {
    const image = await Jimp.read(
        path.resolve(
            __dirname,
            `${testDir}/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg`
    ));
    const mod = await DiceKeyImageProcessorModulePromise;
    const diceKeyImageProcessor = new mod.DiceKeyImageProcessor();
    const {bitmap} = image;
    const beforeMs = (new Date()).getTime();
    const result = diceKeyImageProcessor.processRGBAImageAndRenderOverlay(bitmap.width, bitmap.height, bitmap.data);
    image.write("test-outputs/processRGBAImageAndRenderOverlay.png");
    const afterMs = (new Date()).getTime();
    diceKeyImageProcessor.delete();
    expect(result).toBe(true);
});


test('processRGBAImageAndRender really big but empty', async () => {
    const mod = await DiceKeyImageProcessorModulePromise;
    const diceKeyImageProcessor = new mod.DiceKeyImageProcessor();
    const width = 1920;
    const height = 1200;
    const data = new Uint8Array(4 * width  * height);
    const beforeMs = (new Date()).getTime();
    const result = diceKeyImageProcessor.processRGBAImageAndRenderOverlay(width, height, data);
    const afterMs = (new Date()).getTime();
    diceKeyImageProcessor.delete();
    expect(result).toBe(false);
});



test('processAndAugmentRGBAImage', async () => {
    const image = await Jimp.read(
        path.resolve(
            __dirname,
            `${testDir}/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg`
    ));
    const mod = await DiceKeyImageProcessorModulePromise;
    const diceKeyImageProcessor = new mod.DiceKeyImageProcessor();
    const {bitmap} = image;
    const beforeMs = (new Date()).getTime();
    const result = diceKeyImageProcessor.processAndAugmentRGBAImage(bitmap.width, bitmap.height, bitmap.data);
    // bitmap.data.set(bitMapBuffer);
    image.write("test-outputs/processAndAugmentRGBAImage.png");
    const afterMs = (new Date()).getTime();

    // console.log(`processJsImageData ${bitmap.width}x${bitmap.height} time (ms)`, afterMs - beforeMs);
    diceKeyImageProcessor.delete();
    expect(result);
});


for (const fileName of [
    "B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg",
    "C22I12L11G51P31F53K22V40S13W53T31O50Z30B13M51E22J13H43U30A13D62N13R61X60Y41-faded.jpg"    
]) {
test(`Process and render overlay with Javascript ${fileName}`, async () => {
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
    const canvas = createCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d");

    const imageData = createImageData(width, height);
    imageData.data.set(data);
    ctx.putImageData(imageData, 0, 0);
    
    const result = diceKeyImageProcessor.processRGBAImage(bitmap.width, bitmap.height, bitmap.data);
    const facesReadJsonObj = JSON.parse(diceKeyImageProcessor.diceKeyReadJson()) as FaceRead[] | undefined | null;
    expect(facesReadJsonObj).not.toBeNull();
    expect(facesReadJsonObj).not.toBeUndefined();
    const facesRead = facesReadJsonObj!.map( faceReadJsonObj => FaceRead.fromJsonObject(faceReadJsonObj) );
    renderFacesRead(ctx, facesRead ?? []);
    fs.writeFileSync(`test-outputs/JavaScriptOverlay ${fileName.split(".")[0]}.png`, canvas.toBuffer());
    const afterMs = (new Date()).getTime();
    // console.log(`processJsImageData ${bitmap.width}x${bitmap.height} time (ms)`, afterMs - beforeMs);
    diceKeyImageProcessor.delete();
    expect(result);
});
}