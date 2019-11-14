'use strict'

const koaLogger = (options) => {
    return async (ctx, next) => {
        // ctx.logger = logger
        let startTime = new Date().getTime()
        await next()
        let useTime = new Date().getTime() - startTime
        let url = ctx.originalUrl || ctx.url
        if (useTime > 500) {
            ctx.logger.warn('access', `${ctx.method} ${url} use ${useTime}ms`)
        }
        ctx.logger.info('access', `${ctx.method} ${url} use ${useTime}ms`)
    }
}

module.exports = koaLogger