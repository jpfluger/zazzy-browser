var _ = require('lodash')

var _zzNode = require('./zzNode.js').zzNode
var _types = require('./types.js').types
var _uuid = require('./uuid.js').uuid
var _strings = require('./strings.js').strings

// designed to work with a nodejs server
// Uses only those zzb features not dependent on jquery/BootstrapDialog

// name
//   the name of the global cache object to use

exports.zzbLoader = function(options) {
  options = _.merge({name: 'zzb', overwriteCached: false})

  // has it already been loaded yet?
  if (global[options.zzb] && !options.overwriteCached) {
    return global[options.zzb]
  }

  var _zzb = function () {}
  _zzb.prototype.zzNode = _zzNode
  _zzb.prototype.types = new _types
  _zzb.prototype.uuid = new _uuid
  _zzb.prototype.strings = new _strings

  // always gets a copy b/c referenced libs depends on it
  global['zzb'] = new _zzb()

  if (global[options.zzb] && options.overwriteCached) {
    global[options.name]
    global[options.name].prototype.zzNode = _zzNode
    global[options.name].prototype.types = new _types
    global[options.name].prototype.uuid = new _uuid
    global[options.name].prototype.strings = new _strings
  } else {
    global[options.name] = global['zzb']
  }

  return global[options.name]
}
