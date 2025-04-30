'use strict';

const ingredients = require('../db/source/ingredients.json');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const ingredientsData = ingredients.map(ingredient => ({
      id: uuidv4(),
      name: ingredient.name,
      thumb: ingredient.thumb,
      desc: ingredient.desc,
    }));

    await queryInterface.bulkInsert('ingredients', ingredientsData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ingredients', null, {});
  }
};
