// models/associations.js
import Area from './Area.js';
import Recipe from './Recipe.js';
import User from './User.js';


Recipe.belongsTo(Area, { foreignKey: 'areaId', as: 'area' });
Recipe.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Area.hasMany(Recipe, { foreignKey: 'areaId', as: 'recipes' });
User.hasMany(Recipe, { foreignKey: 'ownerId', as: 'recipes' });

export { Area, Recipe, User };
