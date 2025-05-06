'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const host = process.env.DB_HOST || 'localhost';
const port = process.env.PORT || 3000;
module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = {
      id: uuidv4(),
      name: 'Foodies Admin',
      email: 'admin@foodies.com',
      password: hashedPassword,
      avatarURL: `http://${host}:${port}/public/images/avatars/admin.jpeg`,
      token: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert('users', [user], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@foodies.com' }, {});
  }
};
