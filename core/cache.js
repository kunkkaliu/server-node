'use strict'

const LRU = require('lru-cache')

const mcache = new LRU({
    max: 100 * 1024 * 1024,
    maxAge: 1000 * 60 * 5,
    length: function(n, key) { return n.length + key.length }
})

module.exports = mcache