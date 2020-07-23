#pragma once

#include <emscripten/bind.h>
#include <vector>

template<typename T>
inline std::vector<T> vectorFromJsTypedNumericArray(const emscripten::val &typedArrayInJsHeap)
{
  const unsigned int length = typedArrayInJsHeap["length"].as<unsigned int>();
  const unsigned int bytesPerElement = typedArrayInJsHeap["BYTES_PER_ELEMENT"].as<unsigned int>();
  const unsigned int lengthInBytes = bytesPerElement * length;
  const emscripten::val heap = emscripten::val::module_property("HEAPU8");
  const emscripten::val memory = heap["buffer"];
  std::vector<T> vec(lengthInBytes / sizeof(T));
  const emscripten::val typeArrayInCppHeap = typedArrayInJsHeap["constructor"].new_(memory, reinterpret_cast<uintptr_t>(vec.data()), length);
  typeArrayInCppHeap.call<void>("set", typedArrayInJsHeap);
  return vec;
}

template<typename T>
inline void writeVectorBackIntoJsTypedNumericArray(const emscripten::val &typedArrayInJsHeap, const std::vector<T>& vec) {
  const emscripten::val heap = emscripten::val::module_property("HEAPU8");
  const emscripten::val memory = heap["buffer"];
  const emscripten::val typeArrayInCppHeap = typedArrayInJsHeap["constructor"].new_(memory, reinterpret_cast<uintptr_t>(vec.data()), vec.size() * sizeof(T));
  typedArrayInJsHeap.call<void>("set", typeArrayInCppHeap);
}

inline std::vector<unsigned char> byteVectorFromJsNumericArray(const emscripten::val &typedByteArrayInJsHeap) {
    return vectorFromJsTypedNumericArray<unsigned char>(typedByteArrayInJsHeap);
}

inline emscripten::val arrayToJavaScriptUint8Array(
  const unsigned char* dataPtr,
  const size_t length
) {
  emscripten::val bufferAsTypedMemoryView(emscripten::typed_memory_view(length, dataPtr));
  emscripten::val uint8Array = emscripten::val::global("Uint8Array").new_(length);
  uint8Array.call<void>("set", bufferAsTypedMemoryView);
  return uint8Array;
}

inline emscripten::val toJsUint8Array(const std::vector<unsigned char> byteVector) {
  return arrayToJavaScriptUint8Array(byteVector.data(), byteVector.size());
}
