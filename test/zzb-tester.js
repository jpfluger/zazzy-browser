const { JSDOM } = require('jsdom')

if (typeof global.document === 'undefined') {
  const dom = new JSDOM('<!doctype html><html><body></body></html>')

  global.window = dom.window
  global.document = dom.window.document
  global.HTMLElement = dom.window.HTMLElement
  global.HTMLFormElement = dom.window.HTMLFormElement
  global.FormData = dom.window.FormData
  global.CustomEvent = dom.window.CustomEvent
  global.Node = dom.window.Node

  // Let globalThis use window values where needed
  global.navigator = dom.window.navigator
  global.getComputedStyle = dom.window.getComputedStyle
}

// 🧪 Mock matchMedia (for hasUIHover and similar responsive features)
if (typeof global.window.matchMedia !== 'function') {
  global.window.matchMedia = function () {
    return {
      matches: false, // simulate 'no hover' devices
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    }
  }
}

if (typeof global.localStorage === 'undefined') {
  const storageMock = (() => {
    let store = {};
    return {
      getItem(key) {
        return store[key] || null;
      },
      setItem(key, value) {
        store[key] = value.toString();
      },
      removeItem(key) {
        delete store[key];
      },
      clear() {
        store = {};
      }
    };
  })();
  global.localStorage = storageMock;
}

const _types   = require('../src/types.js').types
const _uuid    = require('../src/uuid.js').uuid
const _strings = require('../src/strings.js').strings
const _rob     = require('../src/rob.js').rob
const _perms   = require('../src/perms.js').perms
const _ajax    = require('../src/ajax.js').ajax
const _dialogs = require('../src/dialogs.js').dialogs
const _dom     = require('../src/dom.js').dom
const _time    = require('../src/time.js').time
const _zaction = require('../src/zaction.js').zaction
const _zui     = require('../src/zui.js').zui

const fetch = require('node-fetch')

if (!globalThis.fetch) {
  globalThis.fetch = fetch
}

// Designed to work with a Node.js server.
// Uses only zzb features not dependent on jQuery/BootstrapDialog.
// `name`: name of the global cache object to use.
exports.zzbLoader = function (options) {
  options = new _types().merge({ name: 'zzb', overwriteCached: false }, options)

  // Return cached zzb instance unless overwrite is forced
  if (global[options.name] && !options.overwriteCached) {
    return global[options.name]
  }

  const _zzb = function () {}

  _zzb.prototype.types   = new _types()
  _zzb.prototype.uuid    = new _uuid()
  _zzb.prototype.strings = new _strings()
  _zzb.prototype.rob     = new _rob()
  _zzb.prototype.perms   = new _perms()
  _zzb.prototype.ajax    = new _ajax()
  _zzb.prototype.dialogs = new _dialogs()
  _zzb.prototype.dom     = new _dom()
  _zzb.prototype.time    = new _time()
  _zzb.prototype.zaction = new _zaction()
  _zzb.prototype.zui     = new _zui()

  global.zzb = new _zzb()

  // Allow plugin injection
  if (options.plugins && Array.isArray(options.plugins)) {
    options.plugins.forEach(function (plugin) {
      global.zzb[plugin.name] = new plugin.class()
    })
  }

  // Rehydrate overwritten global instance
  if (global[options.name] && options.overwriteCached) {
    global[options.name].types   = new _types()
    global[options.name].uuid    = new _uuid()
    global[options.name].strings = new _strings()
    global[options.name].rob     = new _rob()
    global[options.name].perms   = new _perms()
    global[options.name].ajax    = new _ajax()
    global[options.name].dialogs = new _dialogs()
    global[options.name].dom     = new _dom()
    global[options.name].time    = new _time()
    global[options.name].zaction = new _zaction()
    global[options.name].zui     = new _zui()
  } else {
    global[options.name] = global.zzb
  }

  // Optional: plugin injection into custom zzb object
  if (options.plugins && Array.isArray(options.plugins)) {
    options.plugins.forEach(function (plugin) {
      if (plugin.addToNonZZB) {
        global[options.name][plugin.name] = new plugin.class()
      }
    })
  }

  return global[options.name]
}

// const _types = require('../src/types.js').types
// const _uuid = require('../src/uuid.js').uuid
// const _strings = require('../src/strings.js').strings
// const _rob = require('../src/rob.js').rob
// const _perms = require('../src/perms.js').perms
// const _ajax = require('../src/ajax.js').ajax
// const _dialogs = require('../src/dialogs.js').dialogs
//
// const fetch = require('node-fetch')
//
// if (!globalThis.fetch) {
//   globalThis.fetch = fetch
// }
//
// // designed to work with a nodejs server
// // Uses only those zzb features not dependent on jquery/BootstrapDialog
// // name
// //   the name of the global cache object to use
// exports.zzbLoader = function (options) {
//
//   options = new _types().merge({ name: 'zzb', overwriteCached: false }, options)
//
//   // has it already been loaded yet?
//   if (global[options.name] && !options.overwriteCached) {
//     return global[options.name]
//   }
//
//   const _zzb = function () {}
//   _zzb.prototype.types = new _types()
//   _zzb.prototype.uuid = new _uuid()
//   _zzb.prototype.strings = new _strings()
//   _zzb.prototype.rob = new _rob()
//   _zzb.prototype.perms = new _perms()
//   _zzb.prototype.dialogs = new _dialogs()
//   _zzb.prototype.ajax = new _ajax()
//
//   // always gets a copy b/c referenced libs depends on it
//   global.zzb = new _zzb()
//
//   if (options.plugins && Array.isArray(options.plugins)) {
//     options.plugins.forEach(function (plugin) {
//       global.zzb[plugin.name] = new plugin.class()
//     })
//   }
//
//   if (global[options.name] && options.overwriteCached) {
//     // global[options.name].zzNode = _zzNode
//     global[options.name].types = new _types()
//     global[options.name].uuid = new _uuid()
//     global[options.name].strings = new _strings()
//     global[options.name].rob = new _rob()
//     global[options.name].perms = new _perms()
//   } else {
//     global[options.name] = global.zzb
//   }
//
//   if (options.plugins && Array.isArray(options.plugins)) {
//     options.plugins.forEach(function (plugin) {
//       if (plugin.addToNonZZB) {
//         global[options.name][plugin.name] = new plugin.class()
//       }
//     })
//   }
//
//   return global[options.name]
// }

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
