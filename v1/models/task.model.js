const { DataTypes } = require('sequelize');
const { sequelize } = require('./db.js'); // Ensure this points to your Sequelize instance

const Task = sequelize.define('tasks', {
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
  list_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  parent_user_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  title: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  remainder: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tag: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  stage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  priority: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  schedule: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  internal_status: {
    type: DataTypes.STRING(50),
    defaultValue: '',
  },
  assigned_to: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sub_task_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_collaborators: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_attachment: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_comment: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_sub_task_complete: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  cron_run: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  delete: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
  },
  reminder_notify_sent: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
  },
  elastic_cron_run: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  duration_interval: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  duartion_frequency: {
    type: DataTypes.STRING(20),
    defaultValue: '',
  },
  recurring_task_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  kanban_order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  previous_kanban_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  description_encrypt_data_key: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  encrypt_run: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  recent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'tasks',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci',
  indexes: [
    {
      name: 'idx_tasks_1',
      fields: ['id', 'company_id', 'delete', 'internal_status', 'assigned_to', 'parent_id', 'project_id'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_2',
      fields: ['project_id', 'company_id', 'delete', 'id', 'assigned_to'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_3',
      fields: ['cron_run', 'delete'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_4',
      fields: ['parent_id', 'parent_user_id'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_5',
      fields: ['kanban_order_index', 'previous_kanban_index'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_6',
      fields: ['list_id', 'project_id', 'company_id', 'delete', 'assigned_to', 'id', 'internal_status', 'completed_at'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_7',
      fields: ['parent_id', 'company_id', 'delete', 'recurring_task_id', 'project_id'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_8',
      fields: ['id', 'company_id', 'delete', 'user_id', 'assigned_to', 'assigned_by', 'parent_user_id', 'project_id', 'list_id', 'recent_at'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_9',
      fields: ['company_id', 'list_id', 'delete'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_10',
      fields: ['company_id', 'delete', 'parent_id', 'due_date', 'internal_status', 'project_id', 'id'],
      using: 'BTREE',
    },
    {
      name: 'idx_tasks_11',
      fields: ['company_id', 'delete', 'parent_id', 'internal_status', 'project_id', 'id'],
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
  
module.exports = Task;
