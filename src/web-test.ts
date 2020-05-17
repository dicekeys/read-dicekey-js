import "core-js/stable";
import "regenerator-runtime/runtime";
import {DiceKeyImageProcessorModulePromise} from "./dicekey-image-processor"

const runTest = async () => {
    const module = await DiceKeyImageProcessorModulePromise;
    const diceKeyImageProcessor = new module.webasmModule.DiceKeyImageProcessor();
    const captureCanvas = document.createElement("canvas") as HTMLCanvasElement;
    const overlayCanvas = document.getElementById("overlay-canvas") as HTMLCanvasElement;
    const player = document.getElementById('player') as HTMLVideoElement;
    [captureCanvas.width, captureCanvas.height] = [player.videoWidth, player.videoHeight];
    const processFrame = () => {
        const captureCtx = captureCanvas.getContext("2d");
        captureCtx.drawImage(player, 0, 0);
        var capturedImageData = captureCtx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
        const beforeMs = (new Date()).getTime();
        const result = diceKeyImageProcessor.processJsImageData(captureCanvas.width, captureCanvas.height, capturedImageData.data);
        const afterMs = (new Date()).getTime();
        console.log("Frame time: ", afterMs - beforeMs);
        if (result) {
            const json = diceKeyImageProcessor.diceKeyReadJson();
            console.log("Json", json);
            console.log("Time in Ms", afterMs - beforeMs);
        }
        module.usingByteArray(capturedImageData.width * capturedImageData.height * 4, (bitMapBuffer) => {
            overlayCanvas.width = capturedImageData.width;
            overlayCanvas.height = capturedImageData.height;
            const overlayCtx = overlayCanvas.getContext("2d");
            diceKeyImageProcessor.renderAugmentationOverlayJs(capturedImageData.width, capturedImageData.height, bitMapBuffer.byteOffset);
            const overlayImageData = overlayCtx.getImageData(0, 0, capturedImageData.width, capturedImageData.height);
            overlayImageData.data.set(bitMapBuffer);
            overlayCtx.putImageData(overlayImageData, 0, 0);
        });
    
        if (!diceKeyImageProcessor.isFinished()) {
            setTimeout(processFrame, 100)
        }
    }
    processFrame();
}

const constraints = {
    video: true,
};

navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    const player = document.getElementById('player') as HTMLVideoElement;
    player.srcObject = stream;
    setTimeout(runTest, 2000);
});
