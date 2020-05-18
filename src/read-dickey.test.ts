import {DiceKeyImageProcessorModulePromise} from "./dicekey-image-processor"
import Jimp from "jimp"

test("Got jest?", () => {
    expect(true);
})

test('Process dice image', async () => {
    const image = await Jimp.read('./cpp/read-dicekey/tests/test-lib-read-keysqr/img/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg');
    const diceKeyImageProcessor = new (await DiceKeyImageProcessorModulePromise).webasmModule.DiceKeyImageProcessor();
    const {bitmap} = image;
    const beforeMs = (new Date()).getTime();
    const result = diceKeyImageProcessor.processImageData(bitmap.width, bitmap.height, bitmap.data);
    const afterMs = (new Date()).getTime();
    console.log(`processJsImageData ${bitmap.width}x${bitmap.height} time (ms)`, afterMs - beforeMs);
    diceKeyImageProcessor.delete();
    expect(result);
});

test('Augment dice image', async () => {
    const image = await Jimp.read('./cpp/read-dicekey/tests/test-lib-read-keysqr/img/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg');
    const mod = await DiceKeyImageProcessorModulePromise;
    const diceKeyImageProcessor = new mod.webasmModule.DiceKeyImageProcessor();
    const {bitmap} = image;
    const result = diceKeyImageProcessor.processImageData(bitmap.width, bitmap.height, bitmap.data);
    const beforeMs = (new Date()).getTime();
    mod.usingByteArray(bitmap.width * bitmap.height * 4, (bitMapBuffer) => {
        
        diceKeyImageProcessor.renderAugmentationOverlay(bitmap.width, bitmap.height, bitMapBuffer.byteOffset);
        bitmap.data.set(bitMapBuffer);
    });
    image.write("test-outputs/augment-dice-image.png");
    const afterMs = (new Date()).getTime();

    console.log(`processJsImageData ${bitmap.width}x${bitmap.height} time (ms)`, afterMs - beforeMs);
    diceKeyImageProcessor.delete();
    expect(result);
});
