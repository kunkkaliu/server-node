'use strict'

const Sequelize = require('sequelize')
const sequelize = require('../db')

const CodeModel = sequelize.define('code_model', {
    code: { type: Sequelize.STRING(8), primaryKey: true },
    status: Sequelize.INTEGER(1),
    created_at: { type: 'TIMESTAMP', defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: 'TIMESTAMP', defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), onUpdate: 'SET DEFAULT' },
}, {
    timestamps: true,
    tableName: 'authcode',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
})

module.exports = CodeModel