'use strict';

const categories = require('../db/source/categories.json');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const categoriesData = categories.map(category => ({
      id: uuidv4(),
      name: category.name,
      thumb: category.thumb,
    }));

    await queryInterface.bulkInsert('categories', categoriesData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
