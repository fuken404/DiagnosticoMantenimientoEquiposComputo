import mongoose from "mongoose";

const RuleSchema = new mongoose.Schema(
  {
    ruleId: { type: String, unique: true, required: true }, // F01..F25
    conditions: { type: [String], default: [] },
    weight: { type: Number, min: 0, max: 1, default: 0.7 },
    fault: { type: String, required: true },
    advice: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Rule", RuleSchema);
