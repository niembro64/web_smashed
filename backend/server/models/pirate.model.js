const mongoose = require("mongoose");

const minLength = 3;
const maxLength = 16;
const minNum = 0;
const maxNum = 6;
const defaultBool = false;

const PirateSchema = new mongoose.Schema(
  {
    pirateName: {
      type: String,
      required: [true, "Name is required"],
      minLength: [
        minLength,
        `Name must be at least ${minLength} characters`,
      ],
      maxLength: [
        maxLength,
        `Name can be at most ${maxLength} characters`,
      ],
    },
    imageUrl: {
      type: String,
      required: [true, "Image is required"],
      minLength: [
        minLength,
        `Image must be at least ${minLength} characters`,
      ],
    },
    numChests: {
      type: Number,
      required: [true, "# Treasure Chests is required"],
      min: [minNum, `# Treasure Chests must be at least ${minNum}`],
      max: [maxNum, `# Treasure Chests can be at most ${maxNum}`],
    },
    catchPhrase: {
      type: String,
      required: [true, "Catch phrase is required"],
      minLength: [
        minLength,
        `Catch Phrase must be at least ${minLength} characters`,
      ],
      maxLength: [
        maxLength,
        `Catch Phrase can be at most ${maxLength} characters`,
      ],
    },
    crewPosition: {
      type: String,
      required: [true, "Crew Position is required"],
      minLength: [
        minLength,
        `Crew Position must be at least ${minLength} characters`,
      ],
      maxLength: [
        maxLength,
        `Crew Position can be at most ${maxLength} characters`,
      ],
    },
    pegLeg: {
      type: Boolean,
      required: [true, "Peg-Leg is required"],
      default: defaultBool,
    },
    eyePatch: {
      type: Boolean,
      required: [true, "Eye-Patch is required"],
      default: defaultBool,
    },
    hookHand: {
      type: Boolean,
      required: [true, "Hook-Hand is required"],
      default: defaultBool,
    },
  },
  { timestamps: true }
);

const Pirate = mongoose.model("Pirate", PirateSchema);

module.exports = Pirate;

// ${minLength}
