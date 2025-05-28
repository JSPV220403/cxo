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
    logging: true,                       
    timezone: '+00:00',                   
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,  
      },
    },
  }
);

// Test database connection
const testSequelizeConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, testSequelizeConnection };
