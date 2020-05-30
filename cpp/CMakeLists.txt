cmake_minimum_required(VERSION 3.15)
set( CMAKE_CXX_STANDARD 11 )

# For -s options, see https://github.com/emscripten-core/emscripten/blob/master/src/settings.js
# To turn on ES6 modules:
# -s var EXPORT_ES6=1;
# Export name
# -s EXPORT_NAME='Module'
# This sounds interesting: var EMIT_EMSCRIPTEN_METADATA = 0; and STANDALONE_WASM, see also https://v8.dev/blog/emscripten-standalone-wasm
# -g, emit white space in javascript (let someone else minimize it)
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++1z")

set(READ_DICEKEY_JS_PROJECT_NAME read-dicekey-js)
project(${READ_DICEKEY_JS_PROJECT_NAME}
    VERSION 0.10
    DESCRIPTION "Read DiceKeys using WebAssembly accessible to JavaScript"
    LANGUAGES CXX
)

add_subdirectory("read-dicekey")

# Gather all the source files
# Source Files
file(GLOB SRC_FILES
    "*.cpp"
    "*/*.cpp"
) 
file(GLOB HEADER_FILES
    "*.h"
    "*/*.h"
)
file(GLOB ALL_SRC_FILES
    "*.h"
    "*/*.h"
    "*.cpp"
    "*/*.cpp"
)

#source_group("Sources" FILES ${SRC_FILES})
#source_group("Headers" FILES ${HEADERS_FILES})

add_executable(${READ_DICEKEY_JS_PROJECT_NAME}
    ${ALL_SRC_FILES}
)


target_compile_options(${READ_DICEKEY_JS_PROJECT_NAME}
    PRIVATE
    -std=c++1z
    -Wall
    -Werror
    "SHELL:-s MODULARIZE=1"
    "SHELL:-s ASSERTIONS=2"
    "SHELL:-s DISABLE_EXCEPTION_CATCHING=2"
    "SHELL:-s EXCEPTION_DEBUG=1"
    -O3
    -g4
    --bind
)


# Copy built webassembly javascript code into /src
set_target_properties(
    ${READ_DICEKEY_JS_PROJECT_NAME}
    PROPERTIES
    ARCHIVE_OUTPUT_DIRECTORY "${PROJECT_SOURCE_DIR}/../src/"
    LIBRARY_OUTPUT_DIRECTORY "${PROJECT_SOURCE_DIR}/../src/"
    RUNTIME_OUTPUT_DIRECTORY "${PROJECT_SOURCE_DIR}/../src/"
)

# Compile WebAssembly in module, with permission to expand memory
target_link_options(
    ${READ_DICEKEY_JS_PROJECT_NAME} PUBLIC
    --bind
    "SHELL:-s MODULARIZE=1"
    "SHELL:-s ASSERTIONS=2"
    "SHELL:-s ALLOW_MEMORY_GROWTH=1"
    "SHELL:-s SINGLE_FILE=1"
    -g4
# Turn on after tooling has better ES6 module support, and change output name to .mjs
#   "SHELL:-s EXPORT_ES6=1"
#   "SHELL:-s USE_ES6_IMPORT_META=0"
)

# See https://docs.opencv.org/4.1.1/d0/d76/tutorial_arm_crosscompile_with_cmake.html

message("${READ_DICEKEY_JS_PROJECT_NAME}: Target OpenCV include dirs: ${OpenCV_INCLUDE_DIRS}")
target_include_directories( ${READ_DICEKEY_JS_PROJECT_NAME} PUBLIC
#        ${PROJECT_SOURCE_DIR}/lib-keysqr
        ${PROJECT_SOURCE_DIR}/lib-read-keysqr
        ${OpenCV_INCLUDE_DIRS}
)
message("OPENCV_INCLUDE_DIRS AT ${OpenCV_INCLUDE_DIRS}")


# Link OpenCV and lib-keysqr so that they're both accessible as part of this add_library
# (public)

target_link_libraries(${READ_DICEKEY_JS_PROJECT_NAME}
    PRIVATE
#    ${OpenCV_LIBS}
#    lib-keysqr
    lib-read-keysqr
)


# Use C++ 11
set_target_properties(${READ_DICEKEY_JS_PROJECT_NAME}  PROPERTIES
	CXX_STANDARD 11
)

