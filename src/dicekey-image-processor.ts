import DiceKeyImageProcessorModuleNotReallyAPromiseFn from "read-dicekey-js";
import {
  DiceKeyImageProcessorModule,
  PtrAllocatedInDiceKeyImageProcessorModule
} from "read-dicekey-js";
import {
  getWebAsmModulePromiseWithAugmentedTypes,
  TypedMemoryHelpersForEmscriptenModule,
} from "@dicekeys/webasm-module-memory-helper";

export {
  DiceKeyImageProcessor
} from "read-dicekey-js";

export type DiceKeyImageProcessorModuleWithHelpers = DiceKeyImageProcessorModule &
  TypedMemoryHelpersForEmscriptenModule<PtrAllocatedInDiceKeyImageProcessorModule>;

/**
 * Return a promise to a a web assembly module with our TypeScript helpers for allocating
 * memory within the web assembly memory space.
 */
export const DiceKeyImageProcessorModulePromise: Promise<DiceKeyImageProcessorModuleWithHelpers> =
  getWebAsmModulePromiseWithAugmentedTypes(DiceKeyImageProcessorModuleNotReallyAPromiseFn())



// import{ BaseEmscriptenModule, addTsMemoryToModule } from "./typed-webasm-module-memory-helpers";
// function neverRunThis_It_exists_purely_to_test_typings() {
//   const testThisModulesTypes = undefined as DiceKeyImageProcessorModuleWithHelpers;
//   enum SOME_OTHER_MODULE_PTR { _ = 0 };
//   const otherModule = undefined as BaseEmscriptenModule;
//   const augmentedOtherModule = addTsMemoryToModule<EmscriptenModule, SOME_OTHER_MODULE_PTR>(otherModule);

//   augmentedOtherModule.tsMemory.usingByteArray(100, (bufferWithInvaildType) => {
//     new testThisModulesTypes.DiceKeyImageProcessor().renderAugmentationOverlay(0, 0, bufferWithInvaildType.byteOffset);
//   });
// }
