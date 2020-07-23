import {DiceKeyImageProcessorModulePromise} from "./dicekey-image-processor"
var path = require('path');
import * as fs from "fs";

import Jimp from "jimp"

test('processRGBAImage', async () => {
    // Uncomment this if you're having problems with CI not finding the directory
    // in the submodule and want to see the dir layout before the CI failure...
    // const pc = ["..", "cpp", "read-dicekey", "tests", "test-lib-read-keysqr", "img"];
    // [...Array(pc.length).keys()].forEach( (i) => {
    //     const p = path.resolve( __dirname, pc.slice(0, i+1).join("/"));
    //     console.log(p, JSON.stringify(fs.readdirSync(p), null, 2));
    // });
    const image = await Jimp.read(
        path.resolve(
            __dirname,
            '../cpp/read-dicekey/tests/test-lib-read-keysqr/img/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg'
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
            '../cpp/read-dicekey/tests/test-lib-read-keysqr/img/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg'
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
            '../cpp/read-dicekey/tests/test-lib-read-keysqr/img/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg'
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