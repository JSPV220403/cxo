const { DataTypes } = require('sequelize');
const { sequelize } = require('./db.js'); // Make sure this points to your Sequelize instance

const Ticket = sequelize.define('tickets', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ticket_id: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  show_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  account_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  customer_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  customer_email: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  mobile_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ticket_type: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customer_type: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  source: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '0 - phone, 1 - in person, 2 - email',
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  reference_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  assign_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_activity: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  task_status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  due_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'tickets',
  timestamps: false,
  indexes: [
    {
      name: 'ticketId',
      fields: ['ticket_id'],
      using: 'BTREE',
    },
    {
      name: 'companyId',
      fields: ['company_id'],
      using: 'BTREE',
    },
  ],
});

sequelize.sync()
  .then(() => {
    console.log('Database & tables synced!');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

module.exports = Ticket;