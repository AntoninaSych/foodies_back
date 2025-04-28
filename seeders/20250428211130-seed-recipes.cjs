'use strict';

const recipes = require('../db/source/recipes.json');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const recipesData = recipes.map(recipe => ({
      id: uuidv4(),
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      thumb: recipe.thumb,
      time: recipe.time,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('recipes', recipesData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('recipes', null, {});
  }
};
