'use strict'

const policyController = require('../controller/policy-controller')

const policyRouter = (router) => {
    router.get('/api/policy/list', policyController.list)
    router.get('/api/policy/export', policyController.export)
};

module.exports = policyRouter
