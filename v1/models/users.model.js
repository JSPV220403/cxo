const { DataTypes } = require('sequelize');
const { sequelize } = require('./db.js');

const User = sequelize.define(
  "users",
  {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    companyId: {
      field: "company_id",
      type: DataTypes.INTEGER,
    },
    userId: {
      field: "user_id",
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userEmail: {
      field: "user_email",
      type: DataTypes.STRING,
    },
    userName: {
      field: "user_name",
      type: DataTypes.STRING,
    },
    userImage: {
      field: "user_image",
      type: DataTypes.STRING,
    },
    loginType: {
      field: "login_type",
      type: DataTypes.STRING,
    },
    createdAt: {
      field: "created_at",
      type: DataTypes.DATE,
    },
    device: {
      field: "device",
      type: DataTypes.STRING,
    },
    deviceToken: {
      field: "device_token",
      type: DataTypes.TEXT,
    },
    designation: {
      field: "designation",
      type: DataTypes.STRING,
    },
    tokenExpiration: {
      field: "token_expiration",
      type: DataTypes.DATE,
    },
    userType: {
      field: "user_type",
      type: DataTypes.INTEGER,
    },
    userStatus: {
      field: "user_status",
      type: DataTypes.INTEGER,
    },
    appVersion: {
      field: "app_version",
      type: DataTypes.STRING,
    },
    badgeCount: {
      field: "badge_count",
      type: DataTypes.INTEGER,
    },
    lastSeen: {
      field: "last_seen",
      type: DataTypes.DATE,
    },
    socketIdUpdatedTime: {
      field: "socket_id_updated_time",
      type: DataTypes.DATE,
    },
    socketId: {
      field: "socket_id",
      type: DataTypes.STRING,
    },
    onlineStatus: {
      field: "online_status",
      type: DataTypes.TINYINT,
    },
    listCron: {
      field: "list_cron",
      type: DataTypes.TINYINT,
    },
    webDeviceToken: {
      field: "web_device_token",
      type: DataTypes.TEXT,
    },
    mobileNo: {
      field: "mobile_no",
      type: DataTypes.TEXT,
    },
    userTimezone: {
      field: "user_timezone",
      type: DataTypes.TEXT,
    },
    helpDeskInvite: {
      field: "helpdesk_invite",
      type: DataTypes.TINYINT,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);
module.exports = User;
