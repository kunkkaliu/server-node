'use strict'

const DEFAULT_SIZE = 20

class BaseController {
    async _list(ctx, params) {
        const { model, render, noPage, where } = params
        const wheres = where || JSON.parse(decodeURI(ctx.query.where || '{}'))
        const size = parseInt(ctx.query.size || DEFAULT_SIZE)
        const page = parseInt(ctx.query.page || 1)
        const offset = (page - 1) * size

        const options = noPage ? { where: wheres } : { where: wheres, offset, limit: size }
        const result = await model.findAndCountAll(options)
        if (render) this._success(ctx, result)
        else return result
    }

    async _add(ctx, params) {
        const { model, where, render, ...data } = params
        const result = await model.create({ ...data })
        if (render) this._success(ctx, result)
        else return result
    }

    async _update(ctx, params) {
        const { model, render, where, ...data } = params
        const result = await model.update({ ...data }, { where })
        if (render) this._success(ctx, result)
        else return result
    }

    _success(ctx, data) {
        ctx.body = {
            code: 0,
            message: 'success',
            data,
        }
    }

    _error(ctx, msg) {
        msg = msg || 'error'
        ctx.body = {
            code: -1,
            message: msg,
        }
    }

    _notLogin(ctx, msg) {
        msg = msg || '用户未登陆!'
        ctx.status = 401;
        ctx.body = {
            code: 0,
            message: msg,
        }
    }

    _notFound(ctx, msg) {
        msg = msg || 'not found'
        ctx.thorw(404, msg)
    }
}

module.exports = BaseController
