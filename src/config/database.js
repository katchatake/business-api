const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const initModels = require('../models/init-models');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: (msg) => logger.debug(msg), // Usa el logger para los logs de Sequelize
  }
);

// Inicializar modelos
const models = initModels(sequelize);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    // Termina el proceso si no se puede conectar a la DB
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, models };
