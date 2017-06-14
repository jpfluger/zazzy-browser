var _ = require('lodash')

var _zzNode = require('./zzNode.js')
var _types = require('./types.js').types
var _uuid = require('./uuid.js').uuid
var _strings = require('./strings.js').strings
var _rob = require('./rob.js').rob

// designed to work with a nodejs server
// Uses only those zzb features not dependent on jquery/BootstrapDialog

// name
//   the name of the global cache object to use

exports.zzbLoader = function(options) {
  options = _.merge({name: 'zzb', overwriteCached: false}, options)

  // has it already been loaded yet?
  if (global[options.name] && !options.overwriteCached) {
    return global[options.name]
  }

  var _zzb = function () {}
  _zzb.prototype.zzNode = _zzNode
  _zzb.prototype.types = new _types
  _zzb.prototype.uuid = new _uuid
  _zzb.prototype.strings = new _strings
  _zzb.prototype.rob = new _rob

  // always gets a copy b/c referenced libs depends on it
  global['zzb'] = new _zzb()

  if (global[options.name] && options.overwriteCached) {
    global[options.name].zzNode = _zzNode
    global[options.name].types = new _types
    global[options.name].uuid = new _uuid
    global[options.name].strings = new _strings
    global[options.name].rob = new _rob
  } else {
    global[options.name] = global['zzb']
  }

  return global[options.name]
}
