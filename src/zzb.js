if (typeof jQuery === 'undefined') {
  throw new Error('zazzy-browser\'s JavaScript requires jQuery. jQuery must be included before zazzy-browser\'s JavaScript.')
}

if (typeof _ === 'undefined') {
  throw new Error('zazzy-browser\'s JavaScript requires lodash. lodash must be included before zazzy-browser\'s JavaScript.')
}

(function (global, factory) {
  if (typeof window !== 'undefined') {
    window.zzb = factory()
  } else if (typeof global !== 'undefined') {
    global.zzb = factory()
  } else if (typeof define === 'function' && define.amd) {
    define(factory)
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    throw new Error('could not locate global cache object in which to create zzb')
  }
}(this, function () {
  'use strict'

  // ---------------------------------------------------
  // zzNode
  // ---------------------------------------------------
  var _zzNode = require('./zzNode.js')

  // ---------------------------------------------------
  // types
  // ---------------------------------------------------

  var _types = require('./types.js').types

  // ---------------------------------------------------
  // uuid
  // ---------------------------------------------------

  var _uuid = require('./uuid.js').uuid

  // ---------------------------------------------------
  // strings
  // ---------------------------------------------------

  var _strings = require('./strings.js').strings

  // ---------------------------------------------------
  // _uib
  // ---------------------------------------------------

  var _uib = require('./uib.js').uib

  // ---------------------------------------------------
  // _forms
  // ---------------------------------------------------

  var _forms = require('./forms.js').forms

  // ---------------------------------------------------
  // _dialogs
  // ---------------------------------------------------

  var _dialogs = require('./dialogs.js').dialogs

  // ---------------------------------------------------
  // _perms (Permission Keys)
  // ---------------------------------------------------

  var _perms = require('./perms.js').perms

  // ---------------------------------------------------
  // _rob (Return Object)
  // ---------------------------------------------------

  var _rob = require('./rob.js').rob

  // ---------------------------------------------------
  // _ajax
  // ---------------------------------------------------

  var _ajax = require('./ajax.js').ajax

  // ---------------------------------------------------
  // _status
  // ---------------------------------------------------

  var _status = require('./status.js').status

  // ---------------------------------------------------
  // zzb
  // ---------------------------------------------------

  function _zzb () {}

  // tree operations
  _zzb.prototype.zzNode = _zzNode
  // data type operations: supplements lodash and moment
  _zzb.prototype.types = new _types()
  // uuid functions
  _zzb.prototype.uuid = new _uuid()
  // string functions
  _zzb.prototype.strings = new _strings()
  // ui functions
  _zzb.prototype.uib = new _uib() // {string: _strings, uuid: _uuid})
  // form functions
  _zzb.prototype.forms = new _forms() // {types: _types, strings: _strings, uuid: _uuid, rob: _rob, dialogs: _dialogs})
  // dialog functions
  _zzb.prototype.dialogs = new _dialogs() // {strings: _strings, types: _types})
  // _perms
  _zzb.prototype.perms = new _perms() // {types: _types})
  // rob (==return object)
  _zzb.prototype.rob = new _rob() // {types: _types})
  // ajax helpers with promises
  _zzb.prototype.ajax = new _ajax() // {rob: _rob, types: _types})
  // gets status info (eg user, page, and role info)
  _zzb.prototype.status = new _status() // {types: _types, ajax: _ajax})

  return new _zzb()
}))
