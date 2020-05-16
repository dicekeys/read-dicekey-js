import {getDiceKeyImageProcessorAsync, DiceKeyImageProcessor} from "./dice-key-image-processor"
import Jimp from "jimp"

test("Got jest?", () => {
    expect(true);
})

test('Process dice image', async () => {
    const image = await Jimp.read('./cpp/read-dicekey/tests/test-lib-read-keysqr/img/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg');
    const diceKeyImageProcessor = await getDiceKeyImageProcessorAsync();
    const {bitmap} = image;
    const beforeMs = (new Date()).getTime();
    const result = diceKeyImageProcessor.processJsImageData(bitmap.width, bitmap.height, bitmap.data);
    const afterMs = (new Date()).getTime();
    diceKeyImageProcessor.delete();
    expect(result);
});
