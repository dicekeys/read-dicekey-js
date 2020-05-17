import DiceKeyImageProcessorModuleHalfPromiseFn from "read-dicekey-js";
import {DiceKeyImageProcessorModule, PtrAllocatedInDiceKeyImageProcessorModule} from "read-dicekey-js";
import {ModuleWithMemoryHelpers} from "./memory-helpers";

export const DiceKeyImageProcessorModulePromise :
  Promise<ModuleWithMemoryHelpers<DiceKeyImageProcessorModule, PtrAllocatedInDiceKeyImageProcessorModule>>
= ( async () =>
  new Promise<ModuleWithMemoryHelpers<DiceKeyImageProcessorModule, PtrAllocatedInDiceKeyImageProcessorModule>>(
    (resolveModule, reject) => {
      try {
        DiceKeyImageProcessorModuleHalfPromiseFn().then( module => {
          // https://github.com/emscripten-core/emscripten/issues/5820
          // to not infinite loop, we need to delete the "then".
          delete (module as unknown as {then: any})['then'];
          resolveModule(new ModuleWithMemoryHelpers<DiceKeyImageProcessorModule, PtrAllocatedInDiceKeyImageProcessorModule>(module));
        });
      } catch (e) {
          reject(e);
      }
    }
  )
)();
