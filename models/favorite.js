"use strict";
import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Favorite = sequelize.define(
  "Favorite",
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    recipeId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "recipes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "favorites",
    timestamps: true,
  }
);

export default Favorite;
