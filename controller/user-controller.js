'use strict'

const crypto = require('crypto');
const passport = require('../passport')
const BaseController = require('./base-controller')
const UserModel = require('../models/user')
const CodeModel = require('../models/code')
const request = require('request-promise')
const mcache = require('../core/cache')

class UserController extends BaseController {
    constructor() {
        super()
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.register = this.register.bind(this)
        this.userinfo = this.userinfo.bind(this)
        this.getcode = this.getcode.bind(this)
    }

    getSignature(params) {
        let signature = ''
        const pkeys = Object.keys(params).sort();
        for(let i = 0; i < pkeys.length; i++) {
            signature += `${pkeys[i]}${params[pkeys[i]]}`
        }
        signature += 'xxxxxxx'
        signature = crypto.createHash('md5').update(signature).digest('hex')
        return signature
    }

    async login(ctx, next) {
        let { token, authenticate } = ctx.request.body;
        ctx.assert(token, 200, '请点击滑块进行验证!')
        ctx.assert(authenticate, 200, '请点击滑块进行验证!')

        // 二次校验
        const params = {
            captchaId: 'xxxxxxx',
            secretId: 'xxxxxxx',
            token,
            authenticate,
            version: '1.0',
            timestamp: new Date().getTime(),
            nonce: Math.floor(Math.random() * 99999) + 1,
        }
        let signature = this.getSignature(params)
        let res = await request({
            method: 'POST',
            uri: 'https://captcha.yunpian.com/v1/api/authenticate',
            form: {
                ...params,
                signature,
            },
            json: true,
        })
        if (!res || res.code != 0) {
            this._error(ctx, '请重新点击滑块进行验证!')
            return
        }
        const self = this;
        return passport.authenticate('local', function (err, user, info, status) {
            if (user) {
                self._success(ctx, {
                    username: user.username
                })
                return ctx.login(user)
            } else {
                self._error(ctx, info)
            }
        })(ctx, next)
    }

    logout(ctx, next) {
        ctx.logout();
        this._success(ctx);
    }

    userinfo(ctx, next) {
        if (ctx.isAuthenticated()) {
            this._success(ctx, {
                username: ctx.state.user.username
            })
        } else {
            this._notLogin(ctx)
        }
    }

    async register(ctx, next) {
        let { username, password, code, phone, vercode, email = '', token, authenticate } = ctx.request.body;
        ctx.assert(username, 200, '用户名不能为空!')
        ctx.assert(password, 200, '密码不能为空!')
        ctx.assert(code, 200, '授权码不能为空!')
        ctx.assert(phone, 200, '手机号不能为空!')
        ctx.assert(vercode, 200, '验证码不能为空!')
        ctx.assert(token, 200, '请点击滑块进行验证!')
        ctx.assert(authenticate, 200, '请点击滑块进行验证!')

        // 二次校验
        const params = {
            captchaId: 'xxxxxxx',
            secretId: 'xxxxxx',
            token,
            authenticate,
            version: '1.0',
            timestamp: new Date().getTime(),
            nonce: Math.floor(Math.random() * 99999) + 1,
        }
        let signature = this.getSignature(params)
        let res = await request({
            method: 'POST',
            uri: 'https://captcha.yunpian.com/v1/api/authenticate',
            form: {
                ...params,
                signature,
            },
            json: true,
        })
        if (!res || res.code != 0) {
            this._error(ctx, '请重新点击滑块进行验证!')
            return
        }

        if (!/^1[345678]\d{9}$/.test(phone)) {
            this._error(ctx, '手机号码不合法!')
            return
        }
        const mcode = mcache.peek(phone)
        if (!mcode || mcode != vercode) {
            this._error(ctx, '验证码不正确!')
            return;
        }
        let user = await UserModel.findOne({
            where: { username }
        });
        if (user) {
            this._error(ctx, '用户名已存在!')
            return;
        }
        let authcode = await CodeModel.findOne({
            where: { code }
        });
        if (!authcode) {
            this._error(ctx, '授权码无效!')
            return;
        }
        if (authcode && authcode.status == 1) {
            this._error(ctx, '授权码已使用!')
            return;
        }
        password = crypto.createHash('md5').update(password).digest('hex');
        user = await this._add(ctx, { model: UserModel, render: false, username, password, code, phone, email });
        await this._update(ctx, { model: CodeModel, render: false, where: { code }, code, status: 1 })
        ctx.login(user);
        this._success(ctx);
    }

    makeCode() {
        let code = ''
        for (let i = 0; i < 6; i++) {
            code += `${Math.floor(Math.random() * 10)}`
        }
        return code
    }

    async getcode(ctx, next) {
        const { phone } = ctx.request.body;
        ctx.assert(phone, 200, '手机号不能为空!')
        const code = this.makeCode()
        let res = await request({
            method: 'POST',
            uri: 'https://sms.yunpian.com/v2/sms/single_send.json',
            form: {
                apikey: 'xxxxxx',
                mobile: phone,
                text: `您的验证码是${code}`,
            },
            json: true,
            headers: {
                'Accept': 'application/json;charset=utf-8',
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            }
        })
        if (!res || res.code != 0) {
            this._error(ctx, '获取验证码失败，请稍后重试!')
            return
        }
        mcache.set(phone, code)
        this._success(ctx)
    }
}

const userController = new UserController()

module.exports = userController