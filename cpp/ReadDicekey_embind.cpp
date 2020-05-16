#include <emscripten/bind.h>
#include "./read-dicekey/lib-read-keysqr/read-keysqr.hpp"

using namespace emscripten;



EMSCRIPTEN_BINDINGS(DiceKeyImageProcessor) {
  class_<DiceKeyImageProcessor>("DiceKeyImageProcessor")
    .constructor()
    .function("processJsImageData", &DiceKeyImageProcessor::processJsImageData)
//    .function("renderAugmentationOverlay", &DiceKeyImageProcessor::renderAugmentationOverlay)
    .function("diceKeyReadJson", &DiceKeyImageProcessor::jsonKeySqrRead)
    .function("isFinished", &DiceKeyImageProcessor::isFinished)
    ;
}