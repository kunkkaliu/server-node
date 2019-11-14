'use strict'

const Router = require('koa-router')
const router = new Router();

const userRouter = require('./user')
const policyRouter = require('./policy')

userRouter(router)
policyRouter(router)

module.exports = router