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

    const areaMap = {};
    areas.forEach(area => {
      areaMap[area.name.toLowerCase().trim()] = area.id;
    });

    const recipesData = recipesDataRaw.map(recipe => {
      const id = uuidv4();
      insertedIds.push(id);

      let areaId = null;
      if (recipe.area) {
        const areaNameLower = recipe.area.toLowerCase().trim();
        areaId = areaMap[areaNameLower] || null;
      }

      return {
        id,
        title: recipe.title,
        description: recipe.description || null,
        instructions: recipe.instructions || null,
        thumb: recipe.thumb || null,
        time: recipe.time || null,
        areaId,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

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
