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

  const _types = require('./types.js').types

  // ---------------------------------------------------
  // uuid
  // ---------------------------------------------------

  const _uuid = require('./uuid.js').uuid

  // ---------------------------------------------------
  // strings
  // ---------------------------------------------------

  const _strings = require('./strings.js').strings

  // ---------------------------------------------------
  // _dialogs
  // ---------------------------------------------------

  const _dom = require('./dom.js').dom

  // ---------------------------------------------------
  // _dialogs
  // ---------------------------------------------------

  const _dialogs = require('./dialogs.js').dialogs

  // ---------------------------------------------------
  // _perms (Permission Keys)
  // ---------------------------------------------------

  const _perms = require('./perms.js').perms

  // ---------------------------------------------------
  // _rob (Return Object)
  // ---------------------------------------------------

  const _rob = require('./rob.js').rob

  // ---------------------------------------------------
  // _ajax
  // ---------------------------------------------------

  const _ajax = require('./ajax.js').ajax

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

  return new _zzb()
}))
