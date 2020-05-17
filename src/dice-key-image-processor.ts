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

// async function _arrayToHeap(typedArray: Uint8ClampedArray) {
//     var numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
//     const Module = await diceKeyImageProcessorModulePromise;
//     const ptr = Module._malloc(numBytes);
//     const heapBytes = Module.HEAPU8.subarray(ptr, ptr + numBytes);
//     heapBytes.set(typedArray);
//     return heapBytes;
// }
    
// // Free the malloced data. No GC works on this heap. 
// // Alas, no dtors in JS either :-(
// async function _freeArray(heapBytes: Uint8Array) {
//     const Module = await diceKeyImageProcessorModulePromise;
//     Module._free(heapBytes.byteOffset);
// }


async function copyArrayIntoCppMemory(
    arrayToCopy: Uint8ClampedArray,
    callback: (arrayCopiedIntoCppAccessibleBlock: Uint8Array) => any   
) {
    var numBytes = arrayToCopy.length * arrayToCopy.BYTES_PER_ELEMENT;
    const Module = await diceKeyImageProcessorModulePromise;
    const ptr = Module._malloc(numBytes);
    const heapBytes = Module.HEAPU8.subarray(ptr, ptr + numBytes);
    heapBytes.set(arrayToCopy);
    callback(heapBytes);
    Module._free(heapBytes.byteOffset);
}