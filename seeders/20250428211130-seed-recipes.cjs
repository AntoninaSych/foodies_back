'use strict';

const recipesDataRaw = require('../db/source/recipes.json');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

let insertedIds = [];

async function downloadImage(url, filename) {
  const localDirPath = path.resolve(__dirname, '../public/images');
  const filePath = path.join(localDirPath, filename);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  // Ensure the images directory exists
  if (!fs.existsSync(localDirPath)) {
    fs.mkdirSync(localDirPath, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    writer.on('finish', () => resolve(`images/${filename}`));
    writer.on('error', reject);
  });
}

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

    const recipesData = [];
    for (const recipe of recipesDataRaw) {
      const id = uuidv4();
      insertedIds.push(id);

      let areaId = null;
      if (recipe.area) {
        const areaNameLower = recipe.area.toLowerCase().trim();
        areaId = areaMap[areaNameLower] || null;
      }

      let localThumbPath = null;
      if (recipe.thumb) {
        try {
          const fileName = path.basename(new URL(recipe.thumb).pathname);
          localThumbPath = await downloadImage(recipe.thumb, fileName);
        } catch (err) {
          console.warn(`⚠️ Failed to download image: ${recipe.thumb}`, err.message);
        }
      }

      recipesData.push({
        id,
        title: recipe.title,
        description: recipe.description || null,
        instructions: recipe.instructions || null,
        thumb: localThumbPath,
        time: recipe.time || null,
        areaId,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

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
