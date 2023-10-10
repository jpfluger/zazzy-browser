const _types = require('../src/types.js').types
const _uuid = require('../src/uuid.js').uuid
const _strings = require('../src/strings.js').strings
const _rob = require('../src/rob.js').rob
const _perms = require('../src/perms.js').perms
const _ajax = require('../src/ajax.js').ajax
const _dialogs = require('../src/dialogs.js').dialogs

const fetch = require('node-fetch')

if (!globalThis.fetch) {
  globalThis.fetch = fetch
}

// designed to work with a nodejs server
// Uses only those zzb features not dependent on jquery/BootstrapDialog
// name
//   the name of the global cache object to use
exports.zzbLoader = function (options) {

  options = new _types().merge({ name: 'zzb', overwriteCached: false }, options)

  // has it already been loaded yet?
  if (global[options.name] && !options.overwriteCached) {
    return global[options.name]
  }

  const _zzb = function () {}
  _zzb.prototype.types = new _types()
  _zzb.prototype.uuid = new _uuid()
  _zzb.prototype.strings = new _strings()
  _zzb.prototype.rob = new _rob()
  _zzb.prototype.perms = new _perms()
  _zzb.prototype.dialogs = new _dialogs()
  _zzb.prototype.ajax = new _ajax()

  // always gets a copy b/c referenced libs depends on it
  global.zzb = new _zzb()

  if (options.plugins && Array.isArray(options.plugins)) {
    options.plugins.forEach(function (plugin) {
      global.zzb[plugin.name] = new plugin.class()
    })
  }

  if (global[options.name] && options.overwriteCached) {
    // global[options.name].zzNode = _zzNode
    global[options.name].types = new _types()
    global[options.name].uuid = new _uuid()
    global[options.name].strings = new _strings()
    global[options.name].rob = new _rob()
    global[options.name].perms = new _perms()
  } else {
    global[options.name] = global.zzb
  }

  if (options.plugins && Array.isArray(options.plugins)) {
    options.plugins.forEach(function (plugin) {
      if (plugin.addToNonZZB) {
        global[options.name][plugin.name] = new plugin.class()
      }
    })
  }

  return global[options.name]
}

const _zzbServer = function () {

  const express = require('express')
  const cors = require('cors')

  this.app = express()

  // Access-Control-Allow-Origin: https://amazing.site
  this.app.use(cors({ origin: '*', optionsSuccesStatus: 200 }))

  this.app.get('/', function (req, res) {
    res.status(200).send('ok')
  })

  this.app.get('/ping', function (req, res) {
    res.status(200).send('pong')
  })

  this.app.get('/ping-json', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({ recs: ['pong'] })
  })

  this.app.post('/ping', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({ recs: ['pong'] })
  })

  this.app.get('/ping-as-err', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({ err: 'pong' })
  })

  this.app.get('/ping-as-errs-string', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({ errs: 'pong' })
  })

  this.app.get('/ping-as-errs-array', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({ errs: ['pong'] })
  })

  this.app.get('/force-redirect-with-flash', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({ redirect: '/', message: 'pong-flash-message' })
  })

  this.app.get('/force-flash-message', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({ message: 'pong-flash-message' })
  })

  this.server = this.app.listen(16080, function () {})
}

_zzbServer.prototype.getApp = function () {
  return this.app
}

_zzbServer.prototype.getServer = function () {
  return this.server
}

_zzbServer.prototype.stop = function () {
  if (this.server) {
    this.server.close()
  }
}

exports.zzbServer = _zzbServer
