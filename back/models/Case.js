import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";

const Case = sequelize.define(
  "Case",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    },
    selected: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    results: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

Case.belongsTo(User, { foreignKey: "userId", as: "user" });

export default Case;
