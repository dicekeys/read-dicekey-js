#include <emscripten/bind.h>
#include "./read-dicekey/lib-read-keysqr/read-keysqr.hpp"

using namespace emscripten;

class DiceKeyImageProcessorJs : public DiceKeyImageProcessor {
public:
	inline bool processJsImageData (
		int width,
		int height,
		const std::string &dataFieldWhichIsUint8ClampedArrayInJsButEmbindTreatsAsStdString
	) {
		return processRGBAImage(
			width,
			height,
			width * 4,
			(const uint32_t*) dataFieldWhichIsUint8ClampedArrayInJsButEmbindTreatsAsStdString.data()
		);
	}

	inline void renderAugmentationOverlayJs(	
		int width,
		int height,
		size_t rgbaArrayPtr
	) {
		renderAugmentationOverlay(width, height, (uint32_t*) rgbaArrayPtr);
	};


};

EMSCRIPTEN_BINDINGS(DiceKeyImageProcessorJs) {
  class_<DiceKeyImageProcessorJs>("DiceKeyImageProcessor")
    .constructor()
    .function("processJsImageData", &DiceKeyImageProcessorJs::processJsImageData)
    .function("renderAugmentationOverlayJs", &DiceKeyImageProcessorJs::renderAugmentationOverlayJs, allow_raw_pointers())
    .function("diceKeyReadJson", &DiceKeyImageProcessorJs::jsonKeySqrRead)
    .function("isFinished", &DiceKeyImageProcessorJs::isFinished)
    ;
}