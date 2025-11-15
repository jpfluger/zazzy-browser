// ---------------------------------------------------
// rob (Return Object)
// ---------------------------------------------------

const _rob = function () {}

// Define ROBType constants (mirroring Go's predefined types)
const ROBTYPE_DEBUG = 'debug';
const ROBTYPE_INFO = 'info';
const ROBTYPE_NOTICE = 'notice';
const ROBTYPE_WARNING = 'warning';
const ROBTYPE_ERROR = 'error';
const ROBTYPE_CRITICAL = 'critical';
const ROBTYPE_EMERGENCY = 'emergency';

// Function to normalize a ROBType string (similar to Go's NormalizeROBType)
function normalizeROBType(robType) {
  if (typeof robType !== 'string') {
    return ROBTYPE_ERROR; // Fallback for non-string inputs
  }

  robType = robType.trim().toLowerCase(); // Normalize case and trim whitespace

  switch (robType) {
    case 'emerg':
      return ROBTYPE_EMERGENCY;
    case 'crit':
      return ROBTYPE_CRITICAL;
    case 'err':
      return ROBTYPE_ERROR;
    case 'warn':
      return ROBTYPE_WARNING;
    case '':
      return ROBTYPE_DEBUG;
    default:
      // Check if it's already a valid type
      const validTypes = [
        ROBTYPE_EMERGENCY,
        ROBTYPE_CRITICAL,
        ROBTYPE_ERROR,
        ROBTYPE_WARNING,
        ROBTYPE_NOTICE,
        ROBTYPE_INFO,
        ROBTYPE_DEBUG
      ];
      if (validTypes.includes(robType)) {
        return robType;
      }
      return ROBTYPE_ERROR; // Fallback for unknown types
  }
}

// Function to validate a ROBType string (similar to Go's Validate)
// Returns null if valid, or an error message string if invalid
function validateROBType(robType) {
  if (typeof robType !== 'string' || robType.trim() === '') {
    return 'ROBType must be a non-empty string';
  }

  robType = robType.trim();

  for (let i = 0; i < robType.length; i++) {
    const char = robType[i];
    if (!/[a-zA-Z0-9\-_.]/.test(char)) {
      return `Invalid character '${char}'; ROBType allows A-Z, a-z, 0-9, -_.`;
    }
    if (i === 0 || i === robType.length - 1) {
      if (/[\-_.]/.test(char)) {
        return `Invalid character '${char}' at position ${i}; only alphas and numbers can begin or end the ROBType`;
      }
    }
  }

  return null; // Valid
}

// Creates a new ROB object with default properties and methods
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

// Normalizes a ROBType string to a standard value
_rob.prototype.normalizeROBType = normalizeROBType

// Validates if a ROBType string conforms to format rules; returns error message or null
_rob.prototype.validateROBType = validateROBType

// Checks if a given ROBType represents an error level
_rob.prototype.isError = function (robType) {
  const normalized = this.normalizeROBType(robType);
  switch (normalized) {
    case ROBTYPE_EMERGENCY:
    case ROBTYPE_CRITICAL:
    case ROBTYPE_ERROR:
      return true;
    default:
      return false;
  }
}

// Reduces an array of errors to an object grouped by field
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

// Merges default properties into an error object and normalizes its type
function mergeErrorDefaults (options) {
  // '_system' is a reserved word
  //   why not use null? b/c when converting from array to an object of errors by field, we need a valid string
  // why we have isErr?
  //   server-side supports logger { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }
  //   of which numbers 0 to 3 are errors and > 4 are not
  options = zzb.types.merge({ type: 'error', message: null, field: '_system', stack: null, isErr: true, title: null }, options)

  if (options.isErr) {
    // Use normalizeROBType for consistency
    options.type = normalizeROBType(options.type);

    // Optional: Validate and fallback if invalid
    const validationErr = validateROBType(options.type);
    if (validationErr) {
      console.warn(validationErr);
      options.type = ROBTYPE_ERROR;
    }

    switch (options.type) {
      case ROBTYPE_WARNING:
      case ROBTYPE_NOTICE:
      case ROBTYPE_INFO:
      case ROBTYPE_DEBUG:
        options.isErr = false
        break
      default:
        options.isErr = true
        break
    }
  }

  return options
}

// Creates a single ROB error object from a string or object input
_rob.prototype.createError = function (options1, options2) {
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

// Sanitizes input errors into a standardized array of error objects
_rob.prototype.sanitizeErrors = function (errs) {
  let newErrs = null
  if (!errs) {
    return newErrs
  }

  if (!Array.isArray(errs)) {
    newErrs = [this.createError(errs)]
  } else if (errs.length > 0) {
    newErrs = []
    errs.forEach(function (err) {
      // Skip invalid items (e.g., numbers, null) to avoid errors
      if (typeof err === 'string' || (typeof err === 'object' && err !== null)) {
        newErrs.push(this.createError(err))
      }
    }.bind(this))
  }

  return newErrs
}

// Sanitizes records into an array, ensuring consistency
_rob.prototype.sanitizeRecords = function (recs) {
  if (!recs) {
    return []
  }
  if (!Array.isArray(recs)) {
    return [recs]
  }
  return recs
}

// Converts an array of errors to a categorized list object (alias for toList)
_rob.prototype.toListErrs = function (errs) {
  return this.toList(errs)
}

// Converts an array of items (errors or messages) to a categorized list object
_rob.prototype.toList = function (items) {
  let arrFields = []
  let arrSystem = []

  let arrSystemMessages = []
  let arrFieldMessages = []

  if (items && Array.isArray(items) && items.length > 0) {
    items.forEach(function (item) {
      if (item.isErr === true) {
        if (item.field === '_system') {
          arrSystem.push(item)
        } else if (zzb.types.isStringNotEmpty(item.field)) {
          arrFields.push(item)
        } else {
          arrSystem.push(item)
        }
      } else {
        if (item.field === '_system') {
          arrSystemMessages.push(item)
        } else if (zzb.types.isStringNotEmpty(item.field)) {
          arrFieldMessages.push(item)
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

// Renders an array of errors as a formatted string (alias for renderList)
_rob.prototype.renderListErrs = function (options) {
  return this.renderList(options)
}

// Renders a list of items (errors or messages) in various formats (text, html, etc.)
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