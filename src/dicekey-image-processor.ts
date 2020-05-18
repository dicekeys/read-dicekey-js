import DiceKeyImageProcessorModuleHalfPromiseFn from "read-dicekey-js";
import {
  DiceKeyImageProcessorModule,
  PtrAllocatedInDiceKeyImageProcessorModule
} from "read-dicekey-js";
import {
  addTsMemoryToModule,
  TypedMemoryHelpersForEmscriptenModule,
} from "./typed-webasm-module-memory-helpers";



export {DiceKeyImageProcessor} from "read-dicekey-js";
export type DiceKeyImageProcessorModuleWithHelpers = DiceKeyImageProcessorModule & TypedMemoryHelpersForEmscriptenModule<PtrAllocatedInDiceKeyImageProcessorModule>;

export const DiceKeyImageProcessorModulePromise: Promise<DiceKeyImageProcessorModuleWithHelpers> = (
  async () =>
    new Promise<DiceKeyImageProcessorModuleWithHelpers>(
      (resolveModule, reject) => {
        try {
          DiceKeyImageProcessorModuleHalfPromiseFn().then( module => {
            // https://github.com/emscripten-core/emscripten/issues/5820
            // to not infinite loop, we need to delete the "then".
            delete (module as unknown as {then: any})['then'];
            resolveModule(addTsMemoryToModule(module));
          });
        } catch (e) {
            reject(e);
        }
      }
    )
  )();


// import{ BaseEmscriptenModule } from "./typed-webasm-module-memory-helpers";
// function neverRunThis_It_exists_purely_to_test_typings() {
//   const testThisModulesTypes = undefined as DiceKeyImageProcessorModuleWithHelpers;
//   enum SOME_OTHER_MODULE_PTR { _ = 0 };
//   const otherModule = undefined as BaseEmscriptenModule;
//   const augmentedOtherModule = addTsMemoryToModule<EmscriptenModule, SOME_OTHER_MODULE_PTR>(otherModule);

//   augmentedOtherModule.tsMemory.usingByteArray(100, (bufferWithInvaildType) => {
//     new testThisModulesTypes.DiceKeyImageProcessor().renderAugmentationOverlay(0, 0, bufferWithInvaildType.byteOffset);
//   });
// }
