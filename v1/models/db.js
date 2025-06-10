// db.js
const dotenv = require('dotenv');
dotenv.config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DB,          
  process.env.MYSQL_USERNAME,    
  process.env.MYSQL_PASSWORD,    
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,  
    dialect: 'mysql',                     
    logging: false,                       
    timezone: '+00:00',                   
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,  
      },
    },
    pool: {
      max: process.env?.CONNECTION_LIMIT ? parseInt(process.env?.CONNECTION_LIMIT) : 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  }
);

// Test database connection
const testSequelizeConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Databasessss connected successfully!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, testSequelizeConnection };
