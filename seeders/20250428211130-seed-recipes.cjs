'use strict';

const recipesDataRaw = require('../db/source/recipes.json');
const { v4: uuidv4 } = require('uuid');

let insertedIds = [];

module.exports = {
  async up(queryInterface, Sequelize) {
    const [user] = await queryInterface.sequelize.query(
        'SELECT id FROM users LIMIT 1',
        { type: Sequelize.QueryTypes.SELECT }
    );

    if (!user) {
      throw new Error('❌ No users found. Please seed the users table first.');
    }

    const ownerId = user.id;

    const areas = await queryInterface.sequelize.query(
        'SELECT id, name FROM areas',
        { type: Sequelize.QueryTypes.SELECT }
    );

    const categories = await queryInterface.sequelize.query(
        'SELECT id, name FROM categories',
        { type: Sequelize.QueryTypes.SELECT }
    );

    const areaMap = {};
    areas.forEach(area => {
      areaMap[area.name.toLowerCase().trim()] = area.id;
    });

    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.name.toLowerCase().trim()] = category.id;
    });

    const recipesData = [];

    for (const recipe of recipesDataRaw) {
      const id = uuidv4();

      const areaId = recipe.area
          ? areaMap[recipe.area.toLowerCase().trim()] || null
          : null;

      const categoryId = recipe.category
          ? categoryMap[recipe.category.toLowerCase().trim()] || null
          : null;

      if (!categoryId) {
        console.warn(`⚠️ Category "${recipe.category}" not found. Skipping recipe "${recipe.title}"`);
        continue;
      }

      insertedIds.push(id);
      recipesData.push({
        id,
        title: recipe.title,
        description: recipe.description || null,
        instructions: recipe.instructions || null,
        thumb: recipe.thumb || null,
        time: recipe.time || null,
        areaId,
        categoryId,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (recipesData.length === 0) {
      console.warn('⚠️ No valid recipes to insert.');
      return;
    }

    await queryInterface.bulkInsert('recipes', recipesData, {});
  },

  async down(queryInterface) {
    if (insertedIds.length) {
      await queryInterface.bulkDelete('recipes', {
        id: insertedIds,
      });
    }
  }
};
