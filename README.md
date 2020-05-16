# read-dicekeys-js
Web assembly distribution of the DiceKeys reading algorithms


EMSDK is the emscripten SDK
```bash
setenv emsdk <path_to_emsdk>
```

```bash
cmake -G Ninja -D CMAKE_TOOLCHAIN_FILE=C:\Users\stuar\git\emsdk\upstream\emscripten\cmake\Modules\Platform\Emscripten.cmake  -S src -B build
```