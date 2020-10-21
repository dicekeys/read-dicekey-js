/// <reference types="emscripten" />
const DiceKeyImageProcessorModuleNotReallyAPromiseFn =
  require("./read-dicekey-js") as () => DiceKeyImageProcessorModuleNotReallyAPromise;

import {
  getWebAsmModulePromiseWithAugmentedTypes,
  TypedMemoryHelpersForEmscriptenModule,
} from "@dicekeys/webasm-module-memory-helper";

export enum MemoryAllocatedInDiceKeyImageProcessorModule { _ = 0 }
export type PtrAllocatedInDiceKeyImageProcessorModule = number & MemoryAllocatedInDiceKeyImageProcessorModule;
export type HasPtrAllocatedInDiceKeyImageProcessorModule = {byteOffset: PtrAllocatedInDiceKeyImageProcessorModule}


export declare class DiceKeyImageProcessor {
    constructor();
    //   .function("processJsImageData", &DiceKeyImageProcessor::processJsImageData)
    processRGBAImage: (width: number, height: number, data: Uint8ClampedArray | Uint8Array | Buffer) => boolean;
    //    .function("renderAugmentationOverlay", &DiceKeyImageProcessor::renderAugmentationOverlay)
    processRGBAImageAndRenderOverlay: (width: number, height: number, data: Uint8ClampedArray | Uint8Array | Buffer) => boolean;
    processAndAugmentRGBAImage: (width: number, height: number, data: Uint8ClampedArray | Uint8Array | Buffer) => boolean;
        // .function("diceKeyReadJson", &DiceKeyImageProcessor::jsonDiceKeyRead)
    diceKeyReadJson: () => string;
    // .function("isFinished", &DiceKeyImageProcessor::isFinished)  }
    isFinished: () => boolean;
    // .function("getFaceImage", &getFaceImage)
    //inline emscripten::val getFaceImage(
    //   DiceKeyImageProcessor& thisDiceKeyImageProcessor,
    //   int faceIndex =
    // )
    getFaceImage: (faceIndex: number) => Uint8Array;
    // All embind-generated objects are given a delete() method to destruct and clean up memory
    delete: () => void;
}

export interface DiceKeyImageProcessorModule extends EmscriptenModule {
    DiceKeyImageProcessor: new () => DiceKeyImageProcessor;
}

// Emscripten promises are kinda like promises... but it's important that we
// not get lulled into thinking they're actually promises.
// https://github.com/emscripten-core/emscripten/issues/5820
interface DiceKeyImageProcessorModuleNotReallyAPromise {
    then: (fn: (DiceKeyImageProcessor: DiceKeyImageProcessorModule) => any) => void
}


export type DiceKeyImageProcessorModuleWithHelpers = DiceKeyImageProcessorModule &
  TypedMemoryHelpersForEmscriptenModule<PtrAllocatedInDiceKeyImageProcessorModule>;

/**
 * Return a promise to a a web assembly module with our TypeScript helpers for allocating
 * memory within the web assembly memory space.
 */
export const DiceKeyImageProcessorModulePromise: Promise<DiceKeyImageProcessorModuleWithHelpers> =
  getWebAsmModulePromiseWithAugmentedTypes(DiceKeyImageProcessorModuleNotReallyAPromiseFn())
