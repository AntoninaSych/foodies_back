import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const RecipeIngredient = sequelize.define('RecipeIngredient', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    measure: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
    tableName: 'recipe_ingredients',
});

export default RecipeIngredient;
