'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('testimonials', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      testimonial: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('testimonials');
  }
};
