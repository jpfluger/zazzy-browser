// ---------------------------------------------------
// rob (Return Object)
// ---------------------------------------------------

const _rob = function () {}

_rob.prototype.newROB = function (options) {
  return zzb.types.merge({
    message: null,
    messageType: null,
    errs: null,
    recs: [],
    columns: [],
    paginate: {
      page: 0,
      limit: 0,
      count: 0
    },
    hasErrors: function () {
      return (this.errs && Array.isArray(this.errs) && this.errs.length > 0)
    },
    hasColumns: function () {
      return (this.columns && Array.isArray(this.columns) && this.columns.length > 0)
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
      let hit = null
      this.recs.forEach(function (rec) {
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
    return { _system: [errs] }
  }
  let eo = {}
  errs.forEach(function (err) {
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
  options = zzb.types.merge({ type: 'error', message: null, field: '_system', stack: null, isErr: true, title: null }, options)

  if (options.isErr) {
    if (options.type === 'warn') {
      options.type = 'warning'
    } else if (options.type === 'err') {
      options.type = 'error'
    } else if (options.type === 'crit') {
      options.type = 'critical'
    } else if (options.type === 'emerg') {
      options.type = 'emergency'
    }
    // no "else" statement to default to a value (eg "error")
    // this keeps the the available types loosely open
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
const createError = function (options1, options2) {
  if (!options1) {
    return mergeErrorDefaults()
  }
  if (zzb.types.isStringNotEmpty(options1)) {
    return mergeErrorDefaults(zzb.types.merge({ message: options1 }, options2))
  } else if (!Array.isArray(options1) && zzb.types.isObject(options1)) {
    return mergeErrorDefaults(options1)
  }

  throw new Error('bad input in createError - unrecognized err datatype')
}

_rob.prototype.createError = createError

// Sanitizes ROB error(s), which could be in the format of a string, array or object
// Returns null or an array of errors
_rob.prototype.sanitizeErrors = function (errs) {
  let newErrs = null
  if (!errs) {
    return newErrs
  }

  if (!Array.isArray(errs)) {
    newErrs = [createError(errs)]
  } else if (errs.length > 0) {
    newErrs = []
    errs.forEach(function (err) {
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

_rob.prototype.toListErrs = function (errs) {
  return zzb.rob.toList(errs)
}

_rob.prototype.toList = function (items) {
  let arrFields = []
  let arrSystem = []

  let arrSystemMessages = []
  let arrFieldMessages = []

  if (items && Array.isArray(items) && items.length > 0) {
    items.forEach(function (item) {
      if (item.isErr === true) {
        if (item.system === '_system') {
          arrSystem.push(item)
        } else if (zzb.types.isStringNotEmpty(item.field)) {
          if (item.field === '_system') {
            arrSystem.push(item)
          } else {
            arrFields.push(item)
          }
        } else {
          arrSystem.push(item)
        }
      } else {
        if (item.system === '_system') {
          arrSystemMessages.push(item)
        } else if (zzb.types.isStringNotEmpty(item.field)) {
          if (item.field === '_system') {
            arrSystemMessages.push(item)
          } else {
            arrFieldMessages.push(item)
          }
        } else {
          arrSystemMessages.push(item)
        }
      }
    })
  }

  return {
    system: arrSystem,
    fields: arrFields,

    systemMessages: arrSystemMessages,
    fieldMessages: arrFieldMessages,

    hasErrors: function () {
      return (this.hasSystemErrors() || this.hasFieldErrors())
    },
    hasSystemErrors: function () {
      return (this.system && this.system.length > 0)
    },
    hasFieldErrors: function () {
      return (this.fields && this.fields.length > 0)
    },
    combinedErrors: function () {
      return this.system.concat(this.fields)
    },
    hasMessages: function () {
      return (this.hasSystemMessages() || this.hasFieldMessages())
    },
    hasSystemMessages: function () {
      return (this.systemMessages && this.systemMessages.length > 0)
    },
    hasFieldMessages: function () {
      return (this.fieldMessages && this.fieldMessages.length > 0)
    },
    combinedMessages: function () {
      return this.systemMessages.concat(this.fieldMessages)
    },
    getByFieldName: function (isMessages, name) {
      if (name === '_system') {
        return (isMessages) ? this.systemMessages : this.system
      }
      let arr = []
      if (!name) {
        return arr
      }
      let iterate = (isMessages) ? this.fieldMessages : this.fields
      iterate.forEach(function(item) {
        if (item.field === name) {
          item.isMessage = isMessages
          arr.push(item)
        }
      })
      return arr
    },
    getErrsByName: function (name) {
      return this.getByFieldName(false, name)
    },
    getMessagesByName: function (name) {
      return this.getByFieldName(true, name)
    },
    getAnyByName: function (name) {
      let arrE = this.getErrsByName(name)
      let arrM = this.getMessagesByName(name)
      return arrE.concat(arrM)
    },
  }
}

_rob.prototype.renderListErrs = function (options) {
  return zzb.rob.renderList(options)
}

_rob.prototype.renderList = function (options) {
  options = zzb.types.merge({ targets: [], format: 'text', defaultTitle: '', template: null, htmlWrapList: '<ul class="zzb-rob-{0}">{1}</ul>'}, options)
  let arr = []
  // backwards-compatible
  if (options.errs && zzb.types.isArrayHasRecords(options.errs)) {
    options.targets = options.errs
  }
  if (zzb.types.isArrayHasRecords(options.targets)) {
    let isMulti = (options.targets.length > 1)
    options.targets.forEach(function (target) {
      let title = ''
      if (zzb.types.isStringNotEmpty(options.defaultTitle)) {
        title = options.defaultTitle
      } else if (zzb.types.isStringNotEmpty(target.field)) {
        title = target.field
      }

      if (options.template) {
        arr.push(zzb.strings.format(options.template, title, target.message))
      } else {
        if (!target.type) {
          target.type = (target.isMessage) ? 'message' : 'unknown'
        }
        if (isMulti) {

        }
        if (!isMulti && options.format === 'html') {
          arr.push(zzb.strings.format('<div class="zzb-rob-list-item-{0}">{1}</div>', target.type, target.message))
        } else if (options.format === 'html' || options.format === 'html-list') {
          arr.push(zzb.strings.format('<li class="zzb-rob-list-item-{0}">{1}</li>', target.type, target.message))
        } else if (options.format === 'html-list-label') {
          arr.push(zzb.strings.format('<li class="zzb-rob-list-item-{0}"><span>{1}:</span> {2}</li>', target.type, title, target.message))
        } else if (options.format === 'label') {
          arr.push(zzb.strings.format('{0}: {1}', title, target.message))
        } else if (options.format === 'text-punctuated') {
          arr.push(zzb.strings.toFirstCapitalEndPeriod(target.message) + ' ')
        } else { // text
          arr.push(zzb.strings.format(target.message))
        }
      }
    })
    let doHtmlWrap = ((isMulti && options.format === 'html') || options.format === 'html-list' || options.format === 'html-list-label')
    if (doHtmlWrap && options.htmlWrapList) {
      return zzb.strings.format(options.htmlWrapList, options.format, arr.join(''))
    }
  }

  return arr.join('')
}

exports.rob = _rob
