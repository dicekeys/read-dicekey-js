import "core-js/stable";
import "regenerator-runtime/runtime";
import {
    DiceKeyImageProcessorModuleWithHelpers,
    DiceKeyImageProcessorModulePromise
} from "./dicekey-image-processor"
import { DiceKeyImageProcessor } from "read-dicekey-js";

const  videoConstraintsForDevice = (deviceId: string): MediaStreamConstraints => ({
    video: {deviceId}
});

class ImageProcessingTestPage {
    private readonly module: DiceKeyImageProcessorModuleWithHelpers;
    private readonly diceKeyImageProcessor: DiceKeyImageProcessor;
    private readonly captureCanvas = document.createElement("canvas") as HTMLCanvasElement;
    private captureCanvasCtx = this.captureCanvas.getContext("2d");
    private readonly overlayCanvas = document.getElementById("overlay-canvas") as HTMLCanvasElement;
    private overlayCanvasCtx = this.overlayCanvas.getContext("2d");
    private readonly player = document.getElementById('player') as HTMLVideoElement;
    private readonly cameraSelectionMenu = document.getElementById('camera-selection-menu') as HTMLSelectElement;
    private mediaStream: MediaStream | undefined;

    constructor(module: DiceKeyImageProcessorModuleWithHelpers) {
        this.module = module;
        this.diceKeyImageProcessor = new module.webasmModule.DiceKeyImageProcessor();
        this.updateCameraForConstraints();
        navigator.mediaDevices.enumerateDevices().then( this.updateMediaDeviceList );
        this.processFrame();
    }
    
    updateCameraForConstraints = (mediaStreamConstraints: MediaStreamConstraints = {video: true}) => {
        navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then((newStream) => {
            const oldMediaStream = this.mediaStream;
            // If there's an existing stream, terminate it
            this.mediaStream?.getTracks().forEach(track => track.stop() );
            // Now set the new stream
            this.player.srcObject = this.mediaStream = newStream;
        });  
    }

    updateCameraForDevice = (deviceId: string) =>
        this.updateCameraForConstraints(videoConstraintsForDevice(deviceId));

    createCameraDeviceSelectedEventHandler = (deviceId: string) =>
        () => this.updateCameraForDevice(deviceId);

    updateMediaDeviceList = (mediaDevices: MediaDeviceInfo[]) => {
        // Remove all child elements (select options)
        this.cameraSelectionMenu.innerHTML = '';
        // Replace old child elements with updated select options
        this.cameraSelectionMenu.append(...
            mediaDevices
                // ignore devices that aren't cameras
                .filter( ({kind}) => kind === 'videoinput' )
                // turn the list of cameras into a list of menu options
                .map( (camera, index) => {
                    const option = document.createElement('option');
                    option.value = camera.deviceId;
                    option.appendChild(document.createTextNode(camera.label || `Camera ${index + 1}`));
                    return option;
                })
            );
        this.cameraSelectionMenu.addEventListener("change", (event) =>
            this.updateCameraForDevice(this.cameraSelectionMenu.value) );
    }


    processFrame = () => {
        if (this.player.videoWidth == 0 || this.player.videoHeight == 0) {
            setTimeout(this.processFrame, 100);
            return;
        }
        if (this.captureCanvas.width != this.player.videoWidth || this.captureCanvas.height != this.player.videoHeight) {
            [this.captureCanvas.width, this.captureCanvas.height] = [this.player.videoWidth, this.player.videoHeight];
            this.captureCanvasCtx = this.captureCanvas.getContext("2d");
        }
        if (this.overlayCanvas.width != this.player.videoWidth || this.overlayCanvas.height != this.player.videoHeight) {
            [this.overlayCanvas.width, this.overlayCanvas.height] = [this.player.videoWidth, this.player.videoHeight];
            this.overlayCanvasCtx = this.overlayCanvas.getContext("2d");
            const {left, top} = this.player.getBoundingClientRect()
            this.overlayCanvas.style.setProperty("left", left.toString());
            this.overlayCanvas.style.setProperty("top", top.toString());
        }
        this.captureCanvasCtx.drawImage(this.player, 0, 0);
        var capturedImageData = this.captureCanvasCtx.getImageData(0, 0, this.captureCanvas.width, this.captureCanvas.height);
        const beforeMs = (new Date()).getTime();
        const result = this.diceKeyImageProcessor.processImageData(this.captureCanvas.width, this.captureCanvas.height, capturedImageData.data);
        const afterMs = (new Date()).getTime();
        //console.log("Frame time: ", afterMs - beforeMs);
        if (result) {
            const json = this.diceKeyImageProcessor.diceKeyReadJson();
            //console.log("Json", json);
            // console.log("Time in Ms", afterMs - beforeMs);
        }
        this.module.usingByteArray(capturedImageData.width * capturedImageData.height * 4, (bitMapBuffer) => {
            this.overlayCanvas.width = capturedImageData.width;
            this.overlayCanvas.height = capturedImageData.height;
            this.diceKeyImageProcessor.renderAugmentationOverlay(capturedImageData.width, capturedImageData.height, bitMapBuffer.byteOffset);
            const overlayImageData = this.overlayCanvasCtx.getImageData(0, 0, capturedImageData.width, capturedImageData.height);
            overlayImageData.data.set(bitMapBuffer);
            this.overlayCanvasCtx.putImageData(overlayImageData, 0, 0);
        });
    
        if (!this.diceKeyImageProcessor.isFinished()) {
            setTimeout(this.processFrame, 10)
        }
    
    }
};

const start = () =>
    window.addEventListener("load", ( () => {
        DiceKeyImageProcessorModulePromise.then( (module) =>
            new ImageProcessingTestPage(module)
    )}));

start();
