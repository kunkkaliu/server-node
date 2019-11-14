'use strict'

const nodeExcel = require('excel-export');
const BaseController = require('./base-controller')
const PolicyModel = require('../models/policy')
const excelConfig = require('../config/excel')
const sequelize = require('../db')
const Sequelize = require('sequelize')

const { Op } = Sequelize

class PolicyController extends BaseController {
    constructor() {
        super()
        this.list = this.list.bind(this)
        this.export = this.export.bind(this)
    }

    async list(ctx, next) {
        if (ctx.isAuthenticated()) {
            let { beginDate, endDate } = ctx.query
            beginDate = beginDate || `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            endDate = endDate || `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            const where = {
                [Op.and]: [
                    sequelize.where(sequelize.fn('TO_DAYS', sequelize.col('s2')), '>=', sequelize.fn('TO_DAYS', beginDate)),
                    sequelize.where(sequelize.fn('TO_DAYS', sequelize.col('s2')), '<=', sequelize.fn('TO_DAYS', endDate)),
                ]
            }
            let data = await this._list(ctx, { model: PolicyModel, noPage: false, render: false, where, })
            let result = {
                total: data.count,
                list: (data && data.rows || []).map(item => ({
                    id: item.id,
                    s1: item.s1,
                })),
            }
            this._success(ctx, result)
        } else {
            this._notLogin(ctx)
        }
    }

    async export(ctx, next) {
        if (ctx.isAuthenticated()) {
            const { fields } = ctx.query;
            if (!fields) {
                this._error(ctx, '导出的字段不能为空!')
                return
            }
            let fieldArr = fields.split(',')
            let outFilename = "sheet.xml";
            var conf = {};
            conf.stylesXmlFile = outFilename;//输出文件名
            conf.name = "Sheet1";//表格名  

            // 设置表格列
            conf.cols = fieldArr.map(item => ({
                caption: excelConfig[item],
                type: 'string',
            }))

            // 查询数据
            let { beginDate, endDate } = ctx.query
            const date = new Date()
            beginDate = beginDate || `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            endDate = endDate || `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            const where = {
                [Op.and]: [
                    sequelize.where(sequelize.fn('TO_DAYS', sequelize.col('s2')), '>=', sequelize.fn('TO_DAYS', beginDate)),
                    sequelize.where(sequelize.fn('TO_DAYS', sequelize.col('s2')), '<=', sequelize.fn('TO_DAYS', endDate)),
                ]
            }
            let data = await this._list(ctx, { model: PolicyModel, noPage: true, render: false, where, })

            // 填充表格数据
            conf.rows = (data && data.rows || []).map(item => {
                return fieldArr.map(ff => item[ff]);
            })

            const result = nodeExcel.execute(conf);
            const resData = Buffer.from(result, 'binary');
            ctx.set('Content-Type', 'application/vnd.ms-excel');
            ctx.set("Content-Disposition", `attachment; filename=${encodeURIComponent('报表')}.xlsx`);
            ctx.body = resData;
        } else {
            this._notLogin(ctx)
        }
    }
}

const policyController = new PolicyController()

module.exports = policyController