import "core-js/stable";
import "regenerator-runtime/runtime";

// Hack to allow the webassembly module to load since it looks for window
// FUTURE - can this be removed with better use of emscripten to generate non-broken code?
// is this an artifact of the use of parcel when Stuart was testing this? 
(global as any).Window = (self as any).Window || self;

import {
    DiceKeyImageProcessorModuleWithHelpers,
    DiceKeyImageProcessorModulePromise
} from "./dicekey-image-processor"
import { DiceKeyImageProcessor } from "read-dicekey-js";
import { Worker } from "cluster";

/**
 * A request to process an image frame while scanning dicekeys
 */
export interface ProcessFrameRequest {
    width: number;
    height: number;
    rgbImageAsArrayBuffer: ArrayBuffer;
}

/**
 * A response with the result of processing a camera frame
 * to look for a DiceKey
 */
export interface ProcessFrameResponse {
    width: number;
    height: number;
    overlayImageBuffer: ArrayBuffer | SharedArrayBuffer,
    isFinished: boolean,
    diceKeyReadJson: string
}

function isProcessFrameRequest(t: any) : t is ProcessFrameRequest {
    return typeof t === "object" &&
        "width" in t && "height" in t &&
        "rgbImageAsArrayBuffer" in t;
}

/**
 * This class implements the worker that processes image frames.
 * It is launched after the image-processing web assembly module is loaded
 */
class FrameProcessingWorker {
    private readonly module: DiceKeyImageProcessorModuleWithHelpers;
    private readonly diceKeyImageProcessor: DiceKeyImageProcessor;

    constructor(module: DiceKeyImageProcessorModuleWithHelpers) {
        this.module = module;
        this.diceKeyImageProcessor = new module.DiceKeyImageProcessor();
        addEventListener( "message", (requestMessage) => {
            if (!isProcessFrameRequest(requestMessage.data)) return;
            const response = this.processImageFrame(requestMessage.data);
            const transferableObjectsWithinResponse: Transferable[] = [
                response.overlayImageBuffer
            ];
            // TypeScript hack since it doesn't understand this is a worker and StackOverflow
            // posts make it look hard to convince it otherwise.
            (self as unknown as {postMessage: (m: any, t: Transferable[]) => unknown}).postMessage(response, transferableObjectsWithinResponse);
        });
    }
    
    processImageFrame = ({width, height, rgbImageAsArrayBuffer}: ProcessFrameRequest): ProcessFrameResponse => {
        this.diceKeyImageProcessor.processImageData(width, height, new Uint8ClampedArray(rgbImageAsArrayBuffer) );
        // Render the augmented image onto the overlay
        const bitMapArray = this.module.tsMemory.usingByteArray(width * height * 4, (bitmapBuffer) => {
            this.diceKeyImageProcessor.renderAugmentationOverlay(width, height, bitmapBuffer.byteOffset);
            // Copy and return output array into a byte array that exists outside webasm memory.
            return new Uint8Array(bitmapBuffer)
        });
        return {
            height, width,
            overlayImageBuffer: bitMapArray.buffer,
            isFinished: this.diceKeyImageProcessor.isFinished(),
            diceKeyReadJson: this.diceKeyImageProcessor.diceKeyReadJson()
        }
    }
}

// Create the worker once the required webassembly has been created.
DiceKeyImageProcessorModulePromise.then( module => new FrameProcessingWorker(module) );
