'use strict';

const recipesDataRaw = require('../db/source/recipes.json');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [user] = await queryInterface.sequelize.query(
        'SELECT id FROM users LIMIT 1',
        { type: Sequelize.QueryTypes.SELECT }
    );

    if (!user) throw new Error('❌ No users found. Please seed users first.');

    const ownerId = user.id;

    const areas = await queryInterface.sequelize.query(
        'SELECT id, name FROM areas',
        { type: Sequelize.QueryTypes.SELECT }
    );
    const categories = await queryInterface.sequelize.query(
        'SELECT id, name FROM categories',
        { type: Sequelize.QueryTypes.SELECT }
    );

    const areaMap = Object.fromEntries(areas.map(a => [a.name.toLowerCase().trim(), a.id]));
    const categoryMap = Object.fromEntries(categories.map(c => [c.name.toLowerCase().trim(), c.id]));

    const recipesData = [];
    const recipesMap = [];

    for (const recipe of recipesDataRaw) {
      const id = uuidv4();
      const areaId = recipe.area ? areaMap[recipe.area.toLowerCase().trim()] || null : null;
      const categoryId = recipe.category ? categoryMap[recipe.category.toLowerCase().trim()] || null : null;

      if (!categoryId) {
        console.warn(`⚠️ Category not found: ${recipe.category}`);
        continue;
      }

      recipesMap.push({ title: recipe.title.trim(), newId: id });

      recipesData.push({
        id,
        title: recipe.title,
        description: recipe.description || null,
        instructions: recipe.instructions || null,
        thumb:recipe.thumb,
        time: recipe.time || null,
        areaId,
        categoryId,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('recipes', recipesData);


    fs.writeFileSync(
        path.join(tempDir, 'recipes-map.json'),
        JSON.stringify(recipesMap, null, 2)
    );

    console.log('📝 Saved temp/recipes-map.json');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('recipes', null, {});
  }
};
