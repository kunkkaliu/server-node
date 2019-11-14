'use strict'

const Sequelize = require('sequelize')
const sequelize = require('../db')

const UserModel = sequelize.define('user_model', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    username: Sequelize.STRING(30),
    password: Sequelize.STRING(32),
    code: Sequelize.STRING(8),
    phone: Sequelize.STRING(11),
    email: Sequelize.STRING(50),
    created_at: { type: 'TIMESTAMP', defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: 'TIMESTAMP', defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), onUpdate: 'SET DEFAULT' },
}, {
        timestamps: true,
        tableName: 'user',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    })

module.exports = UserModel