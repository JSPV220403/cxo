const { DataTypes } = require('sequelize');
const { sequelize } = require('./db.js'); // Ensure this points to your Sequelize instance

const Attribute = sequelize.define('attributes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  topics: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  fontColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  type: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '0 - status 1 - priority, 2 - ticket type, 3 - customer type, 4 - source',
  },
  asset: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'attributes',
  timestamps: false,
  charset: 'utf8mb3',
  indexes: [
    {
      name: 'companyId',
      fields: ['company_id'],
      using: 'BTREE',
    },
  ],
});

sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

module.exports = Attribute;
