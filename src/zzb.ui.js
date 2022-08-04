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
  // _dialogs
  // ---------------------------------------------------

  var _dom = require('./dom.js').dom

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
  // _zaction
  // ---------------------------------------------------

  var _zaction = require('./zaction.js').ajax

  // ---------------------------------------------------
  // _zui
  // ---------------------------------------------------

  var _zui = require('./zui.js').ajax

  // ---------------------------------------------------
  // zzb
  // ---------------------------------------------------

  function _zzb () {}

  // data type operations: supplements lodash and moment
  _zzb.prototype.types = new _types()
  // uuid functions
  _zzb.prototype.uuid = new _uuid()
  // string functions
  _zzb.prototype.strings = new _strings()
  // dom helpers
  _zzb.prototype.dom = new _dom()
  // dialog functions
  _zzb.prototype.dialogs = new _dialogs()
  // _perms
  _zzb.prototype.perms = new _perms() // {types: _types})
  // rob (==return object)
  _zzb.prototype.rob = new _rob() // {types: _types})
  // ajax helpers with promises
  _zzb.prototype.ajax = new _ajax() // {rob: _rob, types: _types})
  // ui action helpers linking elements to event listeners
  _zzb.prototype.zaction = new _zaction()
  // ui element extras
  _zzb.prototype.zui = new _zui()

  return new _zzb()
}))
