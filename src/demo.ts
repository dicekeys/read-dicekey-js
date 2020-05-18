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

/**
 * This class implements the demo page.
 */
class DemoPage {
    private readonly module: DiceKeyImageProcessorModuleWithHelpers;
    private readonly diceKeyImageProcessor: DiceKeyImageProcessor;
    private readonly captureCanvas = document.createElement("canvas") as HTMLCanvasElement;
    private captureCanvasCtx = this.captureCanvas.getContext("2d");
    private readonly overlayCanvas = document.getElementById("overlay-canvas") as HTMLCanvasElement;
    private overlayCanvasCtx = this.overlayCanvas.getContext("2d");
    private readonly player = document.getElementById('player') as HTMLVideoElement;
    private readonly cameraSelectionMenu = document.getElementById('camera-selection-menu') as HTMLSelectElement;
    private mediaStream: MediaStream | undefined;

    /**
     * The code supporting the dmeo page cannot until the WebAssembly module for the image
     * processor has been loaded.  Pass the module to wire up the page with this class.
     * @param module The web assembly module that implements the DiceKey image processing.
     */
    constructor(module: DiceKeyImageProcessorModuleWithHelpers) {
        this.module = module;
        this.diceKeyImageProcessor = new module.DiceKeyImageProcessor();
        // Start out with the default camear
        this.updateCamera();
        // See what other cameras are available
        navigator.mediaDevices.enumerateDevices().then( this.updateCameraList );
        // Start frame processing (to be replaced with a web worker)
        this.processFrame();
    }
    
    /**
     * Set the current camera
     */
    updateCamera = (mediaStreamConstraints: MediaStreamConstraints = {video: true}) => {
        navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then((newStream) => {
            const oldMediaStream = this.mediaStream;
            // If there's an existing stream, terminate it
            this.mediaStream?.getTracks().forEach(track => track.stop() );
            // Now set the new stream
            this.player.srcObject = this.mediaStream = newStream;
        });  
    }

    /**
     * Update the camera to use a device selected by the user.
     */
    updateCameraForDevice = (deviceId: string) =>
        this.updateCamera(videoConstraintsForDevice(deviceId));

    /**
     * Update the list of cameras
     */
    updateCameraList = (listOfAllMediaDevices: MediaDeviceInfo[]) => {
        // Remove all child elements (select options)
        this.cameraSelectionMenu.innerHTML = '';
        // Replace old child elements with updated select options
        this.cameraSelectionMenu.append(...
            listOfAllMediaDevices
                // ignore all media devices except cameras
                .filter( ({kind}) => kind === 'videoinput' )
                // turn the list of cameras into a list of menu options
                .map( (camera, index) => {
                    const option = document.createElement('option');
                    option.value = camera.deviceId;
                    option.appendChild(document.createTextNode(camera.label || `Camera ${index + 1}`));
                    return option;
                })
            );
        // Handle user selection of cameras
        this.cameraSelectionMenu.addEventListener("change", (event) =>
            // The deviceID of the camera was stored in the value name of the option,
            // so it can be retrieved from the value field fo the select element
            this.updateCameraForDevice(this.cameraSelectionMenu.value) );
    }


    processFrame = () => {
        if (this.player.videoWidth == 0 || this.player.videoHeight == 0) {
            // There's no need to take action if there's no video
            setTimeout(this.processFrame, 100);
            return;
        }
        // Ensure the capture canvas is the size of the video being retrieved
        if (this.captureCanvas.width != this.player.videoWidth || this.captureCanvas.height != this.player.videoHeight) {
            [this.captureCanvas.width, this.captureCanvas.height] = [this.player.videoWidth, this.player.videoHeight];
            this.captureCanvasCtx = this.captureCanvas.getContext("2d");
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
 
        // Ensure the overlay canvas is the same size as the captured canvas
        if (this.overlayCanvas.width != this.captureCanvas.width || this.overlayCanvas.height != this.captureCanvas.height) {
            [this.overlayCanvas.width, this.overlayCanvas.height] = [this.captureCanvas.width, this.captureCanvas.height];
            this.overlayCanvasCtx = this.overlayCanvas.getContext("2d");
            // Ensure the overlay is lined up with the video frame
            const {left, top} = this.player.getBoundingClientRect()
            this.overlayCanvas.style.setProperty("left", left.toString());
            this.overlayCanvas.style.setProperty("top", top.toString());
        }
        // Render the augmented image onto the overlay
        this.module.tsMemory.usingByteArray(capturedImageData.width * capturedImageData.height * 4, (bitMapBuffer) => {
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
    // Don't start until the window is loaded
    window.addEventListener("load", ( () => {
        // And the module is loaded
        DiceKeyImageProcessorModulePromise.then( (module) =>
            // Start by constructing the class that implements the page's functionality
            new DemoPage(module)
    )}));

start();
