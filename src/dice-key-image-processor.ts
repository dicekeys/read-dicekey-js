import DiceKeyImageProcessorModuleHalfPromiseFn from "read-dicekey-js";
import {DiceKeyImageProcessorModule, DiceKeyImageProcessor} from "read-dicekey-js";
const diceKeyImageProcessorModuleAsync: () => Promise<DiceKeyImageProcessorModule> =
    () => new Promise<DiceKeyImageProcessorModule>( function(resolveModule, reject) {
        try {
            DiceKeyImageProcessorModuleHalfPromiseFn().then( module => {
                console.log("Preparing to resolve");
                // https://github.com/emscripten-core/emscripten/issues/5820
                // to not infinite loop, we need to delete the "then".
                delete (module as unknown as {then: any})['then'];
                resolveModule(module);
            });
        } catch (e) {
            reject(e);
        }
    });

const diceKeyImageProcessorModulePromise = diceKeyImageProcessorModuleAsync();
export {DiceKeyImageProcessor};
export const getDiceKeyImageProcessorAsync: () => Promise<DiceKeyImageProcessor> =
    async () =>
        new (await diceKeyImageProcessorModulePromise).DiceKeyImageProcessor();