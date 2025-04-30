import sequelize from '../db/sequelize.js';

import User from './User.js';
import Area from './Area.js';
import Category from './Category.js';
import Ingredient from './Ingredient.js';
import Recipe from './Recipe.js';
import Testimonial from './Testimonial.js';
import RecipeIngredient from './RecipeIngredient.js';
import Follow from "./follow.js";


User.hasMany(Recipe, { foreignKey: 'ownerId', as: 'recipes' }); // 🔥 ownerId
Recipe.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' }); // 🔥 ownerId

Area.hasMany(Recipe, { foreignKey: 'areaId', as: 'recipes' });  // 🔥 areaId
Recipe.belongsTo(Area, { foreignKey: 'areaId', as: 'area' });   // 🔥 areaId

Recipe.belongsToMany(Ingredient, { through: RecipeIngredient, foreignKey: 'recipeId', otherKey: 'ingredientId' });
Ingredient.belongsToMany(Recipe, { through: RecipeIngredient, foreignKey: 'ingredientId', otherKey: 'recipeId' });

User.belongsToMany(User, {
  through: Follow,
  as: "followings",
  foreignKey: "followerId",
  otherKey: "followingId",
});

User.belongsToMany(User, {
  through: Follow,
  as: "followers", // ті, хто слідкує за мною
  foreignKey: "followingId",
  otherKey: "followerId",
});

export {
  sequelize,
  User,
  Area,
  Category,
  Ingredient,
  Recipe,
  Testimonial,
  RecipeIngredient,
  Follow,
};
