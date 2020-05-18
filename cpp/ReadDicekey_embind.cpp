#include <emscripten/bind.h>
#include "./read-dicekey/lib-read-keysqr/read-keysqr.hpp"

using namespace emscripten;

inline bool processImageData (
	DiceKeyImageProcessor& thisDiceKeyImageProcessor,
	int width,
	int height,
	const std::string &dataFieldWhichIsUint8ClampedArrayInJsButEmbindTreatsAsStdString
) {
	return thisDiceKeyImageProcessor.processRGBAImage(
		width,
		height,
		width * 4,
		(const uint32_t*) dataFieldWhichIsUint8ClampedArrayInJsButEmbindTreatsAsStdString.data()
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


EMSCRIPTEN_BINDINGS(DiceKeyImageProcessor) {
  class_<DiceKeyImageProcessor>("DiceKeyImageProcessor")
    .constructor()
    .function("processImageData", &processImageData)
    .function("renderAugmentationOverlay", &renderAugmentationOverlay) //, allow_raw_pointers())
    .function("diceKeyReadJson", &DiceKeyImageProcessor::jsonKeySqrRead)
    .function("isFinished", &DiceKeyImageProcessor::isFinished)
    ;
}