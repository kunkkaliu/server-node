'use strict'

const koaError = (app) => {
    return async (ctx, next) => {
        try {
            await next()
        } catch (err) {
            ctx.status = err.status || 500
            app.emit('error', err, ctx)
            ctx.body = {
                code: -1,
                message: err.message || 'Internal Server Error'
            }
        }
    }
}

module.exports = koaError