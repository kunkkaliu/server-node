'use strict'

const userController = require('../controller/user-controller')

const userRouter = (router) => {
    router.post('/api/user/login', userController.login)
    router.post('/api/user/logout', userController.logout)
    router.post('/api/user/register', userController.register)
    router.get('/api/user/userinfo', userController.userinfo)
    router.post('/api/user/getcode', userController.getcode)
};

module.exports = userRouter
