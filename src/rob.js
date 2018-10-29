// client or server
var _ = require('lodash')

// ---------------------------------------------------
// rob (Return Object)
// ---------------------------------------------------

var _rob = function () {}

_rob.prototype.newROB = function (options) {
  return _.merge({
    errs: null,
    recs: [],
    fields: [],
    paginate: {
      page: 0,
      limit: 0,
      count: 0
    },
    hasErrors: function () {
      return (this.errs && Array.isArray(this.errs) && this.errs.length > 0)
    },
    hasFields: function () {
      return (this.fields && Array.isArray(this.fields) && this.fields.length > 0)
    },
    hasRecords: function () {
      return (this.recs && Array.isArray(this.recs) && this.recs.length > 0)
    },
    isEmpty: function () {
      return !this.hasRecords() || (this.hasRecords() && this.first() === null)
    },
    first: function () {
      return (this.recs && Array.isArray(this.recs) && this.recs.length > 0 ? this.recs[0] : null)
    },
    find: function (key, value) {
      var hit = null
      _.each(this.recs, function (rec) {
        if (rec && zzb.types.isObject(rec) && !Array.isArray(rec) && rec[key] === value) {
          hit = rec
          return false
        }
      })
      return hit
    },
    length: function () {
      return (this.recs && Array.isArray(this.recs) ? this.recs.length : 0)
    }
  }, options)
}

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

// Originally we created ROBErrorType but...
// (a) the stack is wrong when invoked by outside functions and (b) we wanted to control if the stack shows or not
function mergeErrorDefaults (options) {
  // '_system' is a reserved word
  //   why not use null? b/c when converting from array to an object of errors by field, we need a valid string
  // why we have isErr?
  //   server-side supports logger { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }
  //   of which numbers 0 to 3 are errors and > 4 are not
  options = _.merge({type: 'error', message: null, field: '_system', stack: null, isErr: true}, options)

  if (options.isErr) {
    switch (options.type) {
      case 'warning':
      case 'notice':
      case 'info':
      case 'debug':
        options.isErr = false
        break
      default:
        options.isErr = true
        break
    }
  }

  return options
}

// Creates a single ROB error object from an object (eg existing error) or from a string
// options1 could be a string or object, whereas options2 expects an object
var createError = function (options1, options2) {
  if (!options1) {
    return mergeErrorDefaults()
  }
  if (zzb.types.isNonEmptyString(options1)) {
    return mergeErrorDefaults(_.merge({message: options1}, options2))
  } else if (!Array.isArray(options1) && zzb.types.isObject(options1)) {
    return mergeErrorDefaults(options1)
  }

  throw new Error('bad input in createError - unrecognized err datatype')
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

_rob.prototype.toListErrs = function (errs, defaultFormat, fieldsTemplate, systemTemplate) {
  var arrFields = []
  var arrSystem = []

  defaultFormat = defaultFormat || 'text'

  function getSystem (err) {
    if (systemTemplate) {
      return zzb.strings.format(systemTemplate, err.message)
    } else {
      if (defaultFormat === 'html') {
        return zzb.strings.format('<li>{0}</li>', err.message)
      } else {
        return zzb.strings.format('System: {0}', err.message)
      }
    }
  }

  function getField (err) {
    var title = err.title
    if (!err.title) {
      title = err.field // _.capitalize(
    }
    if (fieldsTemplate) {
      return zzb.strings.format(fieldsTemplate, title, err.message)
    } else {
      if (defaultFormat === 'html') {
        return zzb.strings.format('<li><strong>{0}</strong>: {1}</li>', title, err.message)
      } else {
        return zzb.strings.format('{0}: {1}', title, err.message)
      }
    }
  }

  if (errs && Array.isArray(errs) && errs.length > 0) {
    _.each(errs, function (err) {
      if (err.system === '_system') {
        arrSystem.push(getSystem(err))
      } else if (zzb.types.isNonEmptyString(err.field)) {
        arrFields.push(getField(err))
      } else {
        arrSystem.push(getSystem(err))
      }
    })
  }

  return {
    system: arrSystem,
    fields: arrFields,
    hasSystemErrors: function () {
      return (this.system && this.system.length > 0)
    },
    hasFieldErrors: function () {
      return (this.fields && this.fields.length > 0)
    },
    combined: function () {
      return this.system.concat(this.fields)
    },
    hasErrors: function () {
      return (this.hasSystemErrors() && this.hasFieldErrors())
    }
  }
}

exports.rob = _rob
