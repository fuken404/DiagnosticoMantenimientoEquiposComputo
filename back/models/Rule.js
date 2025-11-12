import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Rule = sequelize.define(
  "Rule",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ruleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    conditions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    weight: {
      type: DataTypes.FLOAT,
      defaultValue: 0.7,
      validate: {
        min: 0,
        max: 1,
      },
    },
    fault: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    advice: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

export default Rule;
