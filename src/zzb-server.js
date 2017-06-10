var _ = require('lodash')

var _zzNode = require('./zzNode.js').zzNode
var _types = require('./types.js').types
var _uuid = require('./uuid.js').uuid
var _strings = require('./strings.js').strings

// designed to work with a nodejs server
// Uses only those zzb features not dependent on jquery/BootstrapDialog

// useGlobalCache
//   true: then use the name property to deterimine the global object to append required fields
//   false: return a new zzb object, not assigning it to the global cache
// name
//   the name of the global cache object to use

exports.zzbLoader = function(options) {
  options = _.merge({useGlobalCache: true, name: 'zzb'})

  var _zzb = function () {}
  _zzb.prototype.zzNode = _zzNode
  _zzb.prototype.types = new _types
  _zzb.prototype.uuid = new _uuid
  _zzb.prototype.strings = new _strings

  if (!options.useGlobalCache) {
    return new _zzb()
  }
  
  if (!global[options.name]) {
    global[options.name] = new _zzb()
    return global[options.name]
  }

  // use existing object
  global[options.name].zzNode = _zzNode
  global[options.name].types = new _types
  global[options.name].uuid = new _uuid
  global[options.name].strings = new _strings
}
