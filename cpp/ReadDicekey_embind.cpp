#include <emscripten/bind.h>
#include "./read-dicekey/lib-read-keysqr/read-keysqr.hpp"

using namespace emscripten;

template<typename T>
std::vector<T> vectorFromJsTypedNumericArray(const val &typedArray)
{
  const unsigned int length = typedArray["length"].as<unsigned int>();
  const unsigned int bytesPerElement = typedArray["BYTES_PER_ELEMENT"].as<unsigned int>();
  const unsigned int lengthInBytes = bytesPerElement * length;
  const val heap = val::module_property("HEAPU8");
  const val memory = heap["buffer"];
  std::vector<T> vec(lengthInBytes / sizeof(T));
  const val memoryView = typedArray["constructor"].new_(memory, reinterpret_cast<uintptr_t>(vec.data()), lengthInBytes);
  memoryView.call<void>("set", typedArray);
  return vec;
}

inline bool processImageData (
	DiceKeyImageProcessor& thisDiceKeyImageProcessor,
	int width,
	int height,
	emscripten::val const &data
//	const std::vector<unsigned char>& dataAsVector
//	const std::string &dataFieldWhichIsUint8ClampedArrayInJsButEmbindTreatsAsStdString
) {
	return thisDiceKeyImageProcessor.processRGBAImage(
		width,
		height,
		vectorFromJsTypedNumericArray<uint32_t>(data).data()
//		(const uint32_t*)dataAsVector.data()
//		(const uint32_t*) dataFieldWhichIsUint8ClampedArrayInJsButEmbindTreatsAsStdString.data()
	);
}


inline void renderAugmentationOverlay(	
	DiceKeyImageProcessor& thisDiceKeyImageProcessor,
	int width,
	int height,
	size_t rgbaArrayPtr
) {
	thisDiceKeyImageProcessor.renderAugmentationOverlay(width, height, (uint32_t*) rgbaArrayPtr);
};

inline void augmentRGBAImage(	
	DiceKeyImageProcessor& thisDiceKeyImageProcessor,
	int width,
	int height,
	size_t rgbaArrayPtr
) {
	thisDiceKeyImageProcessor.augmentRGBAImage(width, height, (uint32_t*) rgbaArrayPtr);
};


EMSCRIPTEN_BINDINGS(DiceKeyImageProcessor) {
  class_<DiceKeyImageProcessor>("DiceKeyImageProcessor")
    .constructor()
    .function("processImageData", &processImageData)
    .function("renderAugmentationOverlay", &renderAugmentationOverlay) //, allow_raw_pointers())
    .function("augmentRGBAImage", &augmentRGBAImage) //, allow_raw_pointers())
    .function("diceKeyReadJson", &DiceKeyImageProcessor::jsonKeySqrRead)
    .function("isFinished", &DiceKeyImageProcessor::isFinished)
    ;
}