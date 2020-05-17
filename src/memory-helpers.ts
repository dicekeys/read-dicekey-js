
/// <reference types="emscripten" />

type HasPtr<PTR_TYPE extends number> = {byteOffset: PTR_TYPE}
type Uint8ArrayWithPtrType<PTR_TYPE extends number> = Uint8Array & HasPtr<PTR_TYPE>

export class ModuleWithMemoryHelpers<MODULE_TYPE extends EmscriptenModule, PTR_TYPE extends number>{

    constructor(webasmModule: MODULE_TYPE) {
        this.webasmModule = webasmModule;
    }

    public readonly webasmModule: MODULE_TYPE

    public allocateU8 : (size: number) => Uint8ArrayWithPtrType<PTR_TYPE> =
        (size: number) => {
            const ptr = this.webasmModule._malloc(size);
            return this.webasmModule.HEAPU8.subarray(ptr, ptr + size) as Uint8ArrayWithPtrType<PTR_TYPE>;
        }

    public freeU8 = (array: Uint8ArrayWithPtrType<PTR_TYPE>) => {
        this.webasmModule._free(array.byteOffset);
    }

    public usingTemporaryByteArray = (
        arrayLengthInbytes: number,
        callback: (arrayCopiedIntoCppAccessibleBlock: Uint8ArrayWithPtrType<PTR_TYPE>) => unknown   
    ) => {
        var array = this.allocateU8(arrayLengthInbytes);
        try {
            callback(array);
        } finally {
            this.freeU8(array);
        }
    }

    public usingTemporaryCopyOfArray = (
        fromArray: Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array,
        callback: (arrayCopiedIntoCppAccessibleBlock: Uint8ArrayWithPtrType<PTR_TYPE>) => any   
    ) => this.usingTemporaryByteArray(fromArray.length * fromArray.BYTES_PER_ELEMENT, (newArray) => {
        newArray.set(fromArray);
        callback(newArray);
    });

};
