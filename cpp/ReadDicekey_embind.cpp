#include <emscripten/bind.h>
#include "./binding-helpers.hpp"
#include "./read-dicekey/lib-read-keysqr/read-keysqr.hpp"

using namespace emscripten;

inline bool processRGBAImage (
	DiceKeyImageProcessor& thisDiceKeyImageProcessor,
	int width,
	int height,
	emscripten::val const &data
//	const std::vector<unsigned char>& dataAsVector
//	const std::string &dataFieldWhichIsUint8ClampedArrayInJsButEmbindTreatsAsStdString
) {
	// Ensure data vector stays in scope until end of function.
	const std::vector<uint32_t> dataVector = vectorFromJsTypedNumericArray<uint32_t>(data);
	return thisDiceKeyImageProcessor.processRGBAImage(
		width,
		height,
		dataVector.data()
	);
}

inline bool processRGBAImageAndRenderOverlay(	
	DiceKeyImageProcessor& thisDiceKeyImageProcessor,
	int width,
	int height,
	const emscripten::val& rgbaByteArrayInJsMemory
) {
	std::vector<uint32_t> rgbaByteArrayInCppMemory = vectorFromJsTypedNumericArray<uint32_t>(rgbaByteArrayInJsMemory);
	bool result = thisDiceKeyImageProcessor.processRGBAImage(
		width,
		height,
		rgbaByteArrayInCppMemory.data()
	);
	thisDiceKeyImageProcessor.renderAugmentationOverlay(width, height, rgbaByteArrayInCppMemory.data());
	writeVectorBackIntoJsTypedNumericArray(rgbaByteArrayInJsMemory, rgbaByteArrayInCppMemory);
	return result;
};

inline bool processAndAugmentRGBAImage(	
	DiceKeyImageProcessor& thisDiceKeyImageProcessor,
	int width,
	int height,
	const emscripten::val& rgbaByteArrayInJsMemory
) {
	std::vector<uint32_t> rgbaByteArrayInCppMemory = vectorFromJsTypedNumericArray<uint32_t>(rgbaByteArrayInJsMemory);
	bool result = thisDiceKeyImageProcessor.processRGBAImage(
		width,
		height,
		rgbaByteArrayInCppMemory.data()
	);
	thisDiceKeyImageProcessor.augmentRGBAImage(width, height, rgbaByteArrayInCppMemory.data());
	writeVectorBackIntoJsTypedNumericArray(rgbaByteArrayInJsMemory, rgbaByteArrayInCppMemory);
	return result;
};

// inline void renderAugmentationOverlay(	
// 	DiceKeyImageProcessor& thisDiceKeyImageProcessor,
// 	int width,
// 	int height,
// 	size_t rgbaArrayPtr
// ) {
// 	thisDiceKeyImageProcessor.renderAugmentationOverlay(width, height, (uint32_t*) rgbaArrayPtr);
// };


EMSCRIPTEN_BINDINGS(DiceKeyImageProcessor) {
  class_<DiceKeyImageProcessor>("DiceKeyImageProcessor")
    .constructor()
    .function("processRGBAImage", &processRGBAImage)
    .function("processRGBAImageAndRenderOverlay", &processRGBAImageAndRenderOverlay)
    .function("processAndAugmentRGBAImage", &processAndAugmentRGBAImage)
    .function("diceKeyReadJson", &DiceKeyImageProcessor::jsonKeySqrRead)
    .function("isFinished", &DiceKeyImageProcessor::isFinished)
    ;
}