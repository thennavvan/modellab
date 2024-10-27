


const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('demo', 'demo_owner', 'GPgY4d8XKwkS', {
  host: 'ep-ancient-queen-a5iqnapj.us-east-2.aws.neon.tech',
  dialect: 'postgres' // or 'mysql', 'sqlite', etc.
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

sequelize.sync();