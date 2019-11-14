'use strict'

const Koa = require('koa')
const session = require('koa-session2')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')
const passport = require('./passport')
const router = require('./routes/index');
const Logger = require('./middlewares/logger')
const koaLogger = require('./middlewares/koa-logger')
const koaError = require('./middlewares/koa-error')

const logger = Logger({
    formatter(level, group, message) {
        const date = new Date();
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} [${level}] ${group}: ${message}`
    }
})

// 初始化app
const app = new Koa()
app.context.logger = logger
app.proxy = true
app.keys = ['winter is coming']
app.on('error', (err, ctx = {}) => {
    const status = ctx.status || 500
    if (status == 200) return;
    const message = typeof err === 'object' ? err.message || err.msg : err
    logger.error('error', message)
})

// 初始化各种中间件
app.use(cors({
    credentials: true,
}))
app.use(session({
    key: 'SESSIONID',
    maxAge: 86400000,
    httpOnly: true,
    signed: true,
}, app))
app.use(bodyParser())
app.use(passport.initialize())
app.use(passport.session())
app.use(koaError(app))
app.use(koaLogger())

// 初始化路由
app.use(router.routes()).use(router.allowedMethods())

// 启动app
const port = parseInt(process.env.PORT) + parseInt(process.env.INSTANCE_ID) 
app.listen(port, _ => {
    logger.success('server', `App (pro) is going to be running on port ${port}.`)
})

// 捕获promise中未捕获的异常, try catch 对于 async await的promise是有效的，这里用不到了
// process.on('unhandledRejection', (reason, p) => {
//     logger.error('Unhandled Rejection', `position: ${p}, reason: ${reason}`)
// });
// app.listen(7001, _ => {
//     logger.success('server', 'App (pro) is going to be running on port 7001.');
// });
