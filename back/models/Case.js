import mongoose from "mongoose";

const CaseSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: () => new Date() },
    selected: { type: [String], default: [] },
    results: [
      {
        ruleId: String,
        score: Number,
        matched: Number,
        total: Number,
        weight: Number
      }
    ],
    notes: { type: String, default: "" },
    user: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Case", CaseSchema);
