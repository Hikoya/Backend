const {
  timingSlotNumberToTimingMapping,
} = require("../constants/slotNumberToTimingMapping");

const mapSlotsToTiming = (slot) => timingSlotNumberToTimingMapping[slot];

module.exports = { mapSlotsToTiming };
