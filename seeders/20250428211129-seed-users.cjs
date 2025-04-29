'use strict';

const users = require('../db/source/users.json');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface) {
    const idMap = {}; // сопоставление старого Mongo id -> нового UUID
    const usersData = users.map(user => {
      const newId = uuidv4();
      idMap[user._id.$oid] = newId;
      return {
        id: newId,
        name: user.name,
        avatar: user.avatar || null,
        email: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    const mapPath = path.join(__dirname, '../db/source/usersIdMap.json');
    fs.writeFileSync(mapPath, JSON.stringify(idMap, null, 2));

    await queryInterface.bulkInsert('users', usersData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
