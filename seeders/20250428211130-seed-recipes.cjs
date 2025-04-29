'use strict';

const recipesDataRaw = require('../db/source/recipes.json');
const usersIdMap = require('../db/source/usersIdMap.json');
const { v4: uuidv4 } = require('uuid');

let insertedIds = [];

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Сначала запрашиваем все areas из базы
    const areas = await queryInterface.sequelize.query(
        'SELECT id, name FROM areas',
        { type: Sequelize.QueryTypes.SELECT }
    );

    // 2. Строим карту areaName -> areaId
    const areaMap = {};
    areas.forEach(area => {
      areaMap[area.name.toLowerCase().trim()] = area.id;
    });

    // 3. Формируем данные рецептов
    const recipesData = recipesDataRaw.map(recipe => {
      const id = uuidv4();
      insertedIds.push(id);

      const ownerId = usersIdMap[recipe.owner?.$oid] || null;

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
        areaId, // ✅ Правильный areaId из существующих записей
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // 4. Вставляем рецепты
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
