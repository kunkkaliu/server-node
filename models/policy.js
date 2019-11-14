'use strict'

const Sequelize = require('sequelize')
const sequelize = require('../db')

const PolicyModel = sequelize.define('policy_model', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    s1: Sequelize.STRING,
    s2: {
        type: Sequelize.DATE,
        get() {
            const date = new Date(this.getDataValue('s2'))
            return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
        },
    },
    created_at: { type: 'TIMESTAMP', defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: 'TIMESTAMP', defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), onUpdate: 'SET DEFAULT' },
}, {
        timestamps: true,
        tableName: 'policy',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    })

module.exports = PolicyModel