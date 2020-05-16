# read-dicekeys-js
Web assembly distribution of the DiceKeys reading algorithms


EMSDK is the emscripten SDK
```bash
setenv emsdk <path_to_emsdk>
```

```bash
cmake -G Ninja -DCMAKE_TOOLCHAIN_FILE=C:\Users\stuar\git\emsdk\upstream\emscripten\cmake\Modules\Platform\Emscripten.cmake -S cpp -B build
cd build; ninja; cd ..

```