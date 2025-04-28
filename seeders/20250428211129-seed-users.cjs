'use strict';

const users = require('../db/source/users.json');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const usersData = users.map(user => ({
      id: uuidv4(),
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('users', usersData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
