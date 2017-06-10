// client or server
var _ = require('lodash')

// ---------------------------------------------------
// rob (Return Object)
// ---------------------------------------------------

var _rob = function() {}

// reduce the error array to an object
_rob.prototype.toObject = function (errs) {
  if (!errs || !Array.isArray(errs)) {
    return {'_system': [errs]}
  }
  var eo = {}
  _.each(errs, function (err) {
    if (err) {
      if (!err.field) {
        err.field = '_system'
      }
      if (!eo[err.field]) {
        eo[err.field] = []
      }
      eo[err.field].push(err)
    }
  })
  return eo
}

// Creates a single ROB error object from an error, which could be in the format of a string, array or object
var createError = function (err) {
  var newErr = {type: 'error', message: null, field: null, trace: null}
  
  if (!err) {
    return newErr
  }

  if (typeof err === 'string') {
    if (zzb.types.isNonEmptyString(err)) {
      newErr.message = err
    }
  }
  else if (Array.isArray(err)) {
    console.log('bad intput in createError - cannot create an error object from an array')
    return newErr
  }
  // assume object
  else if (zzb.types.isObject(err)) { // err instanceof Error || !Array.isArray(err)) {
    // at minimum, always has this
    newErr.message = err.message
    // optional
    newErr.field = err.field || '_system'
    newErr.type = err.type || 'error'
    newErr.trace = err.trace || null
  }
  return newErr
}

_rob.prototype.createError = createError

// Sanitizes ROB error(s), which could be in the format of a string, array or object
// Returns null or an array of errors
_rob.prototype.sanitizeErrors = function (errs) {
  var newErrs = null
  if (!errs) {
    return newErrs
  }
  
  if (!Array.isArray(errs)) {
    newErrs = [createError(errs)]
  } else if (errs.length > 0) {
    newErrs = []
    _.each(errs, function (err) {
      newErrs.push(createError(err))
    })
  }

  return newErrs
}

// always returns an array, even if null
_rob.prototype.sanitizeRecords = function (recs) {
  if (!recs) {
    return []
  }
  if (!Array.isArray(recs)) {
    return [recs]
  } 
  return recs
}

exports.rob = _rob
