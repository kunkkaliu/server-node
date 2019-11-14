'use strict'

const passport = require('koa-passport')
const crypto = require('crypto')
const UserModel = require('./models/user')

var LocalStrategy = require('passport-local').Strategy

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
    const user = await UserModel.findByPk(id)
    done(null, user)
})

passport.use(new LocalStrategy({}, async function(username, password, done) {
    const user = await UserModel.findOne({
        where: {
            username: username,
            password: crypto.createHash('md5').update(password).digest('hex'),
        }
    });
    if (!user) {
        return done(null, false, '账号或者密码错误!')
    } else {
        return done(null, user)
    }
}))

module.exports = passport