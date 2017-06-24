//! zzb.js
//! version: 0.2.13
//! author(s): Jaret Pfluger
//! license: MIT
//! https://github.com/jpfluger/zazzy-browser
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// client only
var $ = window.$

// client or server
// var _ = require('lodash')

// ---------------------------------------------------
// _ajax
// ---------------------------------------------------

function _ajax () {
  this.ajax = function (options) {
    return new Promise(function (resolve, reject) {
      $.ajax(options)
        .done(function (data, textStatus, jqXHR) {
          // allow an escape
          if (options.RAWRETURN) {
            return resolve(data)
          }

          // should always have a status of some type returned
          if (!data) {
            return reject(new Error('Data returned is empty when at minimum a status is required'))
          }

          // ?
          // if (jqXHR.status != '200') {}

          var rob = zzb.rob.newROB()

          if (!jqXHR.responseJSON) {
            // html or some other data type was returned
            rob.recs = [data]
          } else {
            // always redirect, if present
            if (data.redirect && data.redirect.length > 0) {
              window.location.href = data.redirect
              return
            }

            // Errors are ALWAYS an ARRAY and in an expected ROB Error format
            // format:  [ {field: null, message: null, trace: null}]
            // server-side can instruct this function to ignore sanitizing by inspecting ISROBERRORS
            if (!data.ISROBERRORS) {
              if (data.err) {
                // an err should always be package as an array
                // this is b/c form submissions could reply with multiple errors for different fields
                data.errs = zzb.rob.sanitizeErrors(data.err)
                data.err = null
              } else if (data.error) {
                data.error = zzb.rob.sanitizeErrors(data.error)
                data.error = null
              } else if (data.errs) {
                data.errs = zzb.rob.sanitizeErrors(data.errs)
                data.err = null
              }
            }

            // Records are ALWAYS an array
            if (!data.ISROBRECS) {
              if (data.recs) {
                data.recs = zzb.rob.sanitizeRecords(data.rec)
              } else if (data.rec) {
                data.recs = zzb.rob.sanitizeRecords(data.rec)
                data.rec = null
              } else {
                // pass in self
                data.recs = zzb.rob.sanitizeRecords(data)
              }
            }

            rob.errs = data.errs
            rob.recs = data.recs
            rob.fields = data.fields
          }

          resolve(data)
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          // if (jqXHR.responseJSON) {
          //  if (data.redirect) {
          //    return window.location.href = data.redirect
          //  }
          // }
          reject(errorThrown)
          console.log(errorThrown)
        })
    })
  }
}

// sometimes a request is made for an html snippet but json is returned
// this is why dataType is commented out here b/c the calling function isn't certain what type of data will return
_ajax.prototype.get = function (options) {
  options.type = 'GET'
  options.contentType = 'application/json; charset=UTF-8'
  options.data = JSON.stringify(options.data)
  return this.ajax(options)
}

_ajax.prototype.getJSON = function (options) {
  options.type = 'GET'
  options.dataType = 'json'
  options.contentType = 'application/json; charset=UTF-8'
  options.data = JSON.stringify(options.data)
  return this.ajax(options)
}

_ajax.prototype.postJSON = function (options) {
  options.type = 'POST'
  options.dataType = 'json'
  options.contentType = 'application/json; charset=UTF-8'
  options.data = JSON.stringify(options.data)
  return this.ajax(options)
}

exports.ajax = _ajax

},{}],2:[function(require,module,exports){
// client only
var BootstrapDialog = window.BootstrapDialog

// client or server
var _ = window._

// ---------------------------------------------------
// _dialogs
// ---------------------------------------------------

/*
 BootstrapDialog.TYPE_DEFAULT,
 BootstrapDialog.TYPE_INFO,
 BootstrapDialog.TYPE_PRIMARY,
 BootstrapDialog.TYPE_SUCCESS,
 BootstrapDialog.TYPE_WARNING,
 BootstrapDialog.TYPE_DANGER
 */

var _dialogs = function () {}

_dialogs.prototype.showMessage = function (options) {
  options = _.merge({
    type: BootstrapDialog.TYPE_DEFAULT,
    title: '',
    message: '',
    buttonCloseName: 'Ok',
    onShown: null
  }, options)

  BootstrapDialog.show({
    type: options.type,
    title: options.title,
    message: options.message,
    onshown: options.onShown,
    buttons: [{
      label: options.buttonCloseName,
      action: function (dialogRef) {
        dialogRef.close()
      }
    }]
  })
}

_dialogs.prototype.showMessageChoice = function (options) {
  options = _.merge({
    type: BootstrapDialog.TYPE_DEFAULT,
    title: '',
    message: '',
    cssClass: '',
    buttonLeftName: 'Cancel',
    buttonRightName: 'Accept',
    buttonLeftCssClass: '',
    buttonRightCssClass: '',
    buttonLeftIcon: '',
    buttonRightIcon: '',
    onShown: null,
    onButtonLeftClick: null,
    onButtonRightClick: null,
    noButtons: false,
    buttons: []
  }, options)

  if (!options.noButtons) {
    options.buttons = [{
      label: options.buttonLeftName,
      cssClass: options.buttonLeftCssClass,
      icon: options.buttonLeftIcon,
      action: function (dialogRef) {
        if (!options.onButtonLeftClick) {
          dialogRef.close()
        } else {
          options.onButtonLeftClick(function (err) {
            if (!err) {
              dialogRef.close()
            }
          })
        }
      }
    },
    {
      label: options.buttonRightName,
      cssClass: options.buttonRightCssClass,
      icon: options.buttonRightIcon,
      action: function (dialogRef) {
        if (!options.onButtonRightClick) {
          dialogRef.close()
        } else {
          options.onButtonRightClick(function (err) {
            if (!err) {
              dialogRef.close()
            }
          })
        }
      }
    }]
  }

  BootstrapDialog.show({
    type: options.type,
    title: options.title,
    message: options.message,
    cssClass: options.cssClass,
    onshown: options.onShown,
    buttons: options.buttons
  })
}

_dialogs.prototype.handleError = function (options) {
  // this.dialogs.handleError({log: 'failed to retrieve login dialog form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the login form. Please check your connection settings and try again.'})
  options = _.merge({log: null, title: '', message: null, errs: null}, options)

  if (options.log) {
    console.log(options.log)
  }

  if (options.errs) {
    if (Array.isArray(options.errs) && options.errs.length > 0 && options.errs[0]) {
      var arrHtml = []

      _.each(options.errs, function (err, index) {
        if (err.message && zzb.types.isNonEmptyString(err.message)) {
          arrHtml.push(zzb.strings.format('<div>{0}</div>', err.message))
        }
      })

      if (arrHtml.length > 0) {
        if (!options.message) {
          options.message = ''
        }

        if (options.errIntro) {
          options.message += ' ' + options.errIntro
        }

        // this allows for a custom message to be prefixed, like: <strong>Error!</strong>
        options.message += ' ' + arrHtml.join('')
      }
    }
  }

  if (options.message) {
    this.showMessage({type: BootstrapDialog.TYPE_DANGER,
      title: options.title,
      message: options.message})
  }
}

exports.dialogs = _dialogs

},{}],3:[function(require,module,exports){
// client only
var $ = window.$

// client or server
var _ = window._

// ---------------------------------------------------
// _forms
// ---------------------------------------------------

var _forms = function () {}

var renderHtml_Popover = function (errs, options) {
  var arrHtml = []
  var arrPopOver = []

  // assume success
  if (!errs || errs.length === 0 || !errs[0]) {
    if (options.hideWhenNoError) {
      return {html: null, contentPopOver: null}
    } else {
      errs = [{type: 'success', message: null}]
    }
  }

  _.each(errs, function (err, index) {
    if (!err.field) {
      err.field = '_system'
    }

    if (err.field === '_system') {
      arrHtml.push(zzb.strings.format('<div>{0}</div>', err.message))
    } else {
      var typeFormat = options.typeFormats.error

      if (err.type && options.typeFormats[err.type]) {
        typeFormat = options.typeFormats[err.type]
      }

      // only once
      if (index === 0) {
        arrHtml.push(zzb.strings.format('<span class="glyphicon {0} {1}"></span>', typeFormat.glyph, typeFormat.textClass))
      }

      if (err.message && zzb.types.isNonEmptyString(err.message)) {
        arrPopOver.push(err.message)
      }
    }
  })

  return {html: arrHtml.join(' '), contentPopOver: arrPopOver.join('  ')}
}

var afterHtmlAdded_Popover = function (reho) {
  if (reho.$elem && reho.$elem.length > 0) {
    if (reho && reho.contentPopOver && zzb.types.isNonEmptyString(reho.contentPopOver)) {
      reho.$elem.popover({
        trigger: 'hover',
        animation: false,
        content: reho.contentPopOver
      })
    }
  }
}

_forms.prototype.displayUIErrors = function (options, callback) {
  options = _.merge({selector: null,
    $form: null,
    selectorField: '.zzb-form-field',
    attrFieldname: 'zzb-fieldname',
    // selectorLabel: '.zzb-form-field-label', // not used
    // selectorValue: '.zzb-form-field-value', // not used
    selectorError: '.zzb-form-field-error',
    errs: null,
    err: null,
    hideWhenNoError: false, // this always shows the 'success' checkmark
    typeFormats: {
      error: {glyph: 'glyphicon-remove', textClass: 'text-danger', bgClass: null},
      warning: {glyph: 'glyphicon-warning', textClass: 'text-warning', bgClass: null},
      success: {glyph: 'glyphicon-ok', textClass: 'text-success', bgClass: null},
      default: null
    },
    renderErrorHtml: renderHtml_Popover,
    afterHtmlAdded: afterHtmlAdded_Popover,
    handleSystemErrors: null
  }, options)

  var success = false

  if (options.renderErrorHtml) {
    if (options.$form) {
      options.selector = null // not required
    } else if (options.selector) {
      options.$form = $('selector')
    }

    if (!options.$form || options.$form.length === 0) {
      return callback && callback(success)
    }

    if (options.err && !Array.isArray(options.err)) {
      options.errs = [zzb.rob.createError(options.err)]
      options.err = null
    } else if (options.errs && !Array.isArray(options.errs)) {
      options.errs = [zzb.rob.createError(options.errs)]
      options.err = null
    }

    var eo = zzb.rob.toObject(options.errs)

    var handledSystem = false

    // errors have pre-existing placeholders that are hidden
    options.$form.find(options.selectorError).each(function (index, elemErr) {
      var $elemErr = $(elemErr)

      // what's the associated fieldname?
      var $parent = $elemErr.closest(options.selectorField)

      if ($parent.length === 0) {
        console.log('discovered an error field but could not determine the field to which it belongs (eg zzb-form-field)')
        return true
      }

      var fieldname = $parent.attr(options.attrFieldname)

      if (zzb.types.isEmptyString(fieldname)) {
        console.log('discovered an error field and its parent field (eg zzb-form-field) but the fieldname attribute is empty (eg zzb-fieldname="")')
        return true
      }

      if (fieldname === '_system') {
        handledSystem = true
      }

      // get a reho (returned error html object)
      var reho = options.renderErrorHtml(eo[fieldname], options)

      $elemErr.html(reho.html)

      if (reho.html && zzb.types.isNonEmptyString(reho.html)) {
        $elemErr.removeClass('hidden')
      } else {
        $elemErr.addClass('hidden')
      }

      reho.fieldname = fieldname
      reho.$elem = $elemErr

      options.afterHtmlAdded && options.afterHtmlAdded(reho)
    })
  }

  if (!handledSystem && eo['_system']) {
    if (eo['_system'].length > 0 && eo['_system'][0]) {
      if (options.handleSystemErrors) {
        options.handleSystemErrors(eo['_system'], options)
      } else {
        zzb.dialogs.handleError({errs: eo['_system']})
      }
    }
  }

  callback && callback(success)
}

exports.forms = _forms

},{}],4:[function(require,module,exports){
// client or server
var _ = window._

// ---------------------------------------------------
// rob (Return Object)
// ---------------------------------------------------

var _rob = function () {}

_rob.prototype.newROB = function (options) {
  return _.merge({
    errs: null,
    recs: [],
    fields: [],
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
      } else if (err.field) {
        arrSystem.push(getField(err))
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

},{}],5:[function(require,module,exports){
// client only
var $ = window.$

// client or server
var _ = window._

// ---------------------------------------------------
// _status
//
// Gets status info (eg user, page roles)
// Various site designs set permission-based UI elements (1) on the server only, (2) on the client-only or (3) mix of both.
// This function helps a page obtain status info, if using #2 or #3
// It optionally returns a specific role and page that a user may access
// ---------------------------------------------------

// example status (aka zzbStatus)
//   {user: {isLoggedIn: false, username: null, roles: {}}, page: {path: '/'}

var _status = function () {
  this.zzbStatus = null
}

// The status can be embedded in sessionStorage or an attribute otherwise tries an ajax call.
_status.prototype.get = function (options, callback) {
  options = _.merge({path: window.location.path, role: null})

  var setSelf = (options.path === window.location.path && !options.role)

  if (setSelf) {
    if (this.zzbStatus) {
      return callback && callback(null, this.zzbStatus)
    }

    var tmpStatus = null

    // Try local storage first (if top-level page supports it) -> this function will delete it, if found
    if (typeof Storage !== 'undefined' && sessionStorage.zzbStatus) {
      try {
        // using sessionStorage (not localStorage)
        tmpStatus = JSON.parse(sessionStorage.getItem('zzbStatus'))
      } catch (err) {
        console.log('unable to parse zzbStatus from sessionStorage: ' + err)
      }

      sessionStorage.setItem('zzbStatus', null)

      if (tmpStatus) {
        this.zzbStatus = tmpStatus
        return callback && callback(null, this.zzbStatus)
      }
    }

    // status might be embedded in an attribute
    if ($('#zzbStatus').length > 0 && zzb.types.isNonEmptyString($('#zzbStatus').attr('status'))) {
      try {
        tmpStatus = JSON.parse($('#zzbStatus').attr('status'))
      } catch (err) {
        console.log('unable to parse zzbStatus from embedded attribute in #zzbStatus: ' + err)
      }
      if (tmpStatus) {
        this.zzbStatus = tmpStatus
        return callback && callback(null, this.zzbStatus)
      }
    }
  }

  // not in session storage? (best) try a server-side call to '/zzb/status'
  // REQUIRES (callback)
  // if err then returns defaults where isLoggedIn = false
  tmpStatus = {user: {isLoggedIn: false, username: null}, page: {path: window.location.pathname}}
  // remember newbies that inside .then() that "this" refrences the .then() function, so using "that" is a workaround
  var that = this

  zzb.ajax.postJSON({
    url: '/zzb/status',
    data: options
  })
  .then(function (rob) {
    if (rob.errs) {
      callback && callback(rob.errs, tmpStatus)
    } else {
      if (setSelf) {
        that.zzbStatus = rob.one()
      }
      callback && callback(null, rob.one())
    }
  })
  .catch(function (err) {
    console.log('failed to retrieve zzbStatus: using defaults')
    callback && callback(zzb.types.sanitizeErrors(err), tmpStatus)
  })
}

exports.status = _status

},{}],6:[function(require,module,exports){
// client or server
var _ = window._

// ---------------------------------------------------
// strings
// ---------------------------------------------------

var _strings = function () {}

//  ValueError :: String -> Error
var formatValueError = function (message) {
  var err = new Error(message)
  err.name = 'ValueError'
  return err
}

//  defaultTo :: a,a? -> a
var formatDefaultTo = function (x, y) {
  return y == null ? x : y
}

var formatLookup = function (obj, path) {
  if (!/^\d+$/.test(path[0])) {
    path = ['0'].concat(path)
  }
  for (var idx = 0; idx < path.length; idx += 1) {
    var key = path[idx]
    obj = typeof obj[key] === 'function' ? obj[key]() : obj[key]
  }
  return obj
}

// https://github.com/davidchambers/string-format
// create :: Object -> String,*... -> String
// zzb.strings.format('{0}, you have {1} mushroom{2}', 'Piggy', 2, 's')
// zzb.strings.format('{0}, you have {1} mushroom{2}', ['Piggy', 2, 's'])
// zzb.strings.format('{name}, you have {number} mushroom{ending}', {name: 'Piggy', number: 2, ending: 's'})
var formatString = function (transformers) {
  return function (template) {
    var args = Array.prototype.slice.call(arguments, 1)
    var idx = 0
    var state = 'UNDEFINED'

    if (Array.isArray(args) && args.length > 0 && Array.isArray(args[0])) {
      var tmpArr = args[0].map(function (s) {
        return s
      })
      args = tmpArr
    }

    return template.replace(
      /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
      function (match, literal, key, xf) {
        if (literal != null) {
          return literal
        }
        if (key.length > 0) {
          if (state === 'IMPLICIT') {
            throw formatValueError('cannot switch from ' +
              'implicit to explicit numbering')
          }
          state = 'EXPLICIT'
        } else {
          if (state === 'EXPLICIT') {
            throw formatValueError('cannot switch from ' +
              'explicit to implicit numbering')
          }
          state = 'IMPLICIT'
          key = String(idx)
          idx += 1
        }
        var value = formatDefaultTo('', formatLookup(args, key.split('.')))

        if (xf == null) {
          return value
        } else if (Object.prototype.hasOwnProperty.call(transformers, xf)) {
          return transformers[xf](value)
        } else {
          throw formatValueError('no transformer named "' + xf + '"')
        }
      }
    )
  }
}

_strings.prototype.format = formatString({})

/**
 * zzb.strings.formatEmpty
 *
 * Usage:
 *   zzb.strings.formatEmpty('{a} is dead, but {{b}} is alive! {a} {c}', {a: 'ASP', b: 'FLEXIBLE NODEJS'})
 *   zzb.strings.formatEmpty('{0} is dead, but {{1}} is alive! {0} {2}', 'ASP', 'FLEXIBLE NODEJS')
 * Produces:
 *   ASP is dead, but {FLEXIBLE NODEJS} is alive! ASP
 *
 * Formats a string using words within curly brace delimiters. Escape braces by doubling-up: "{{0}}" --> {some-param}
 * Matches with an invalid object or array key are replaced by an empty string
 * @param template
 * @param options
 * @returns {String} a merging of object with the supplied template
**/
_strings.prototype.formatEmpty = function (template) {
  var args = Array.prototype.slice.call(arguments, 1)
  if (Array.isArray(args)) {
    return template.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] !== 'undefined'
        ? args[number]
        : '' // match
    })
  } else {
    return template.replace(/{((?:(?=([^{}]+|{{[^}]*}}))\2)*)}/g, function (match, key) {
      // console.log(match + '  ' + key)
      return (args.length > 0 && args[0][key]) ? args[0][key] : '' // match
    })
  }
}

/**
 * zzb.strings.appendIfMoreThan
 *
 * Usage:
 *  zzb.strings.appendIfMoreThan('some string', '...', 3)
 * Produces
 *  som...
 *
 * Appends the supplied characters to the string if the character count of the string
 * is greater than the ifMoreCharCount parameter
 * @param str
 * @param charsToAppend
 * @param ifMoreCharCount
 * @returns {String}
 */
_strings.prototype.appendIfMoreThan = function (str, charsToAppend, ifMoreCharCount) {
  return ((str && (str.length > ifMoreCharCount)) ? str.substring(0, ifMoreCharCount) + charsToAppend : str)
}

/**
 * zzb.strings.joinArrToCommas
 *
 * Usage:
 *  zzb.strings.joinArrToCommas(['a','b','c'])
 * Produces
 *  a, b, c
 *
 * Usage:
 *  zzb.strings.joinArrToCommas([{name:'a',{name:'b'},{name:'c'}], 'name')
 * Produces
 *  a, b, c
 *
 * @param arr
 * @returns {String}
 */
_strings.prototype.joinArrToCommas = function (arr, fieldName) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return ''
  }
  return arr.map(arr, function (obj, idx) {
    var comma = ''
    if (idx < (arr.index - 1)) {
      comma = ''
    }
    if (fieldName) {
      return obj[fieldName] + comma
    } else {
      return obj + comma
    }
  }).join('')
}

/**
 * zzb.strings.toPlural
 *
 * Usage:
 *  zzb.strings.toPlural('dog', 1, options)
 *  zzb.strings.toPlural('dog', 2, options)
 * Produces
 *  dog
 *  dogs
 *
 * Appends an s or user-defined suffix (options.suffix) to a word if the number is not 1 or -1
 * @param str
 * @param charsToAppend
 * @param ifMoreCharCount
 * @returns {String}
 */
_strings.prototype.toPlural = function (word, number, options) {
  options = _.merge({forcePlural: false, suffix: null}, options)

  if ((number === 1 || number === -1) && !options.forcePlural) {
    return word
  }

  if (options.suffix) {
    return word + options.suffix
  } else {
    return word + 's'
  }
}

exports.strings = _strings

},{}],7:[function(require,module,exports){
// client or server
// var _ = require('lodash')

// ---------------------------------------------------
// types
// ---------------------------------------------------

function _types () {}

_types.prototype.escapeJqueryId = function (id, prefix) {
  // ref: https://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
  prefix = (prefix == null ? '#' : prefix)
  return prefix + id.replace(/(:|\.|\[|\]|,)/g, '\\$1')
}

// http://stackoverflow.com/questions/23252173/get-html-escaped-text-from-textarea-with-jquery
_types.prototype.escapeHtml = function (unsafe) {
  if (!unsafe) {
    return ''
  } else {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}

_types.prototype.isArray = function (o) {
  return (o && (o !== undefined) && Object.prototype.toString.call(o) === '[object Array]')
}

_types.prototype.isArrayHasRecords = function (o) {
  return this.isArray(o) && o.length > 0
}

_types.prototype.isObject = function (o) {
  return (o && (typeof o === 'object'))
}

_types.prototype.isNumber = function (o) {
  return !isNaN(o - 0) && o !== null && o !== '' && o !== false
}

_types.prototype.isNonEmptyString = function (s) {
  return (s && (typeof s === 'string') && s.trim().length > 0)
}

_types.prototype.isEmptyString = function (s) {
  return (s && (typeof s === 'string') && s.trim().length === 0)
}

_types.prototype.isString = function (s) {
  return (s && (typeof s === 'string'))
}

_types.prototype.isFunction = function (fn) {
  var getType = {}
  return fn && getType.toString.call(fn) === '[object Function]'
}

/**
 * compare
 *
 * Takes two parameters. If x equals y, the function returns 0. If x is greater than y, the function returns 1. If x is less than y, the function returns -1.
 * Useful in sorting algorithms
 * ref: http://stackoverflow.com/questions/16426774/underscore-sortby-based-on-multiple-attributes
 */
_types.prototype.compare = function (x, y, isDesc) {
  if (x === y) {
    return 0
  }
  if (isDesc) {
    return x > y ? -1 : 1
  } else {
    return x > y ? 1 : -1
  }
}

exports.types = _types

},{}],8:[function(require,module,exports){
// client or server
var _ = window._

// ---------------------------------------------------
// _uib (UI Bootstrap)
// ---------------------------------------------------

var _uib = function () {}

/**
 * zzb.uib.createPanelGroup
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), classPanelGroup: '', innerHtml: ''}
 * @returns {String}
 */
_uib.prototype.createPanelGroup = function (options) {
  options = _.merge({id: zzb.uuid.newV4(), classPanelGroup: '', innerHtml: ''}, options)
  var template = '<div id="panelGroup_{id}" class="panel-group {classPanelGroup}">{innerHtml}</div>'
  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanelBody
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), classPanelBody: '', innerHtml: ''}
 * @returns {String}
 */
_uib.prototype.createPanelBody = function (options) {
  options = _.merge({id: zzb.uuid.newV4(), classPanelBody: '', innerHtml: ''}, options)
  var template = '<div id="panelBody_{id}" class="panel-body {classPanelBody}">{innerHtml}</div>'
  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanel
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), className: '', attributesExtra: '',
 *                                              classPanelHeading: '', name: '',
 *                                              classPanelBody: '', innerHtml: ''
 * @returns {String}
 */
_uib.prototype.createPanel = function (options) {
  options = _.merge({id: zzb.uuid.newV4(),
    className: '',
    attributesExtra: '',
    classPanelHeading: '',
    name: '',
    classPanelBody: '',
    innerHtml: ''
  }, options)

  var template = '<div id="panel_{id}" class="panel panel-default {className}" {attributesExtra}>' +
                  '<div class="panel-heading {classPanelHeading}>">' +
                    '{name}' +
                  '</div>' +
                  '<div id="panelBody_{id}" class="panel-body {classPanelBody}">' +
                    this.createPanelBody(options) + // '<div class="panel-body">{innerHtml}</div>'
                  '</div>' +
                '</div>'
  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanel
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), className: '', attributesExtra: '', name: '',
 *                                              classPanelBody: '', innerHtml: '',
 *                                              isPanelCollapsed: false}, classNamePanelCollapsed: '',
 *                                              titleHtmlExtra: '', titleHtmlExtraRight: ''}
 * @returns {String}
 */
_uib.prototype.createPanelCollapsible = function (options) {
  options = _.merge({id: zzb.uuid.newV4(),
    className: '',
    attributesExtra: '',
    name: '',
    classPanelBody: '',
    innerHtml: '',
    isPanelCollapsed: false,
    classNamePanelCollapsed: '',
    titleHtmlExtra: '',
    titleHtmlExtraRight: ''
  }, options)

  if (options.isPanelCollapsed) {
    options._panelCollapsedClass1 = 'collapsed'
    options._panelCollapsedClass2 = ''
  } else {
    options._panelCollapsedClass1 = ''
    options._panelCollapsedClass2 = 'in'
  }

  var template = '<div id="panel_{id}" class="panel panel-default {className}" {attributesExtra}>' +
                  '<div class="panel-heading">' +
                    '<h4 class="panel-title">' +
                      '{titleHtmlExtra}<a data-toggle="collapse" data-target="#panelCollapse_{id}" href="#panelCollapse_{id}" class="{_panelCollapsedClass1}{classNamePanelCollapsed}">' +
                        '{name}' +
                      '</a> {titleHtmlExtraRight}' +
                    '</h4>' +
                  '</div>' +
                  '<div id="panelCollapse_{id}" class="panel-collapse collapse {_panelCollapsedClass2}">' +
                    this.createPanelBody(options) + // '<div class="panel-body">{innerHtml}</div>'
                  '</div>' +
                '</div>'

  // var test = _.formatObj(template, uie)
  // console.log(test)
  // return test
  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanelBegin
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), className: '', attributesExtra: '', name: '',
 *                                              classPanelBody: '', innerHtml: '',
 *                                              isPanelCollapsed: false}, classNamePanelCollapsed: '',
 *                                              titleHtmlExtra: '', titleHtmlExtraRight: ''}
 * @returns {String}
 */
_uib.prototype.createPanelCollapsibleBegin = function (options) {
  options = _.merge({id: zzb.uuid.newV4(),
    className: '',
    attributesExtra: '',
    name: '',
    classPanelBody: '',
    innerHtml: '',
    isPanelCollapsed: false,
    classNamePanelCollapsed: '',
    titleHtmlExtra: '',
    titleHtmlExtraRight: ''
  }, options)

  if (options.isPanelCollapsed) {
    options._panelCollapsedClass1 = 'collapsed'
    options._panelCollapsedClass2 = ''
  } else {
    options._panelCollapsedClass1 = ''
    options._panelCollapsedClass2 = 'in'
  }

  var template = '<div class="panel panel-default {className}" id="panel_{id}" {attributesExtra}>' +
                    '<div class="panel-heading">' +
                      '<h4 class="panel-title">' +
                        '{titleHtmlExtra}<a data-toggle="collapse" data-target="#panelCollapse_{id}" href="#panelCollapse_{id}" class="{_panelCollapsedClass1}{classNamePanelCollapsed}">' +
                        '{name}' +
                        '</a> {titleHtmlExtraRight}' +
                      '</h4>' +
                    '</div>' +
                    '<div id="panelCollapse_{id}" class="panel-collapse collapse {_panelCollapsedClass2}">' +
                  '<div class="panel-body" id="panelBody_{id}">'

  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanelEnd
 *
 * @returns {String}
 */
_uib.prototype.createPanelCollapsibleEnd = function () {
  return '</div></div></div>'
}

exports.uib = _uib

},{}],9:[function(require,module,exports){
// client or server
var _ = window._

// ---------------------------------------------------
// uuid
// ---------------------------------------------------

var _uuid = function () {}

/**
 * zzb.uuid.newV4
 *
 * Usage:
 *    zzb.uuid.newV4()
 * Produces:
 *    '9716498c-45df-47d2-8099-3f678446d776'
 *
 * Generates an RFC 4122 version 4 uuid
 * This is not a time-based approach, unlike uuid v1 - so don't let the use of _.now() fool you!
 * Use of _.now() has to do with collision avoidance.
 * @see http://stackoverflow.com/a/8809472
 * @returns {String} the generated uuid
 */
_uuid.prototype.newV4 = function () {
  var d = _.now()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + _.random(16)) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

/**
 * zzb.uuid.isV4
 *
 * Usage:
 *    zzb.uuid.isV4(zzb.uuid.newV4())
 * Produces:
 *    true|false
 *
 * Validates a version 4 uuid string
 * @param {String} uuid - the uuid under test
 * @returns {Boolean} true if the uuid under test is a valid uuid
 **/
_uuid.prototype.isV4 = function (uuid) {
  var re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return re.test(uuid)
}

/**
 * zzb.uuid.isValid
 *
 * Usage:
 *    zzb.uuid.isValid(zzb.uuid.newV4())
 * Produces:
 *    true|false
 *
 * Validates ANY version uuid string (eg v1 or v4)
 * @param {String} uuid - the uuid under test
 * @returns {Boolean} true if the uuid under test is a valid uuid
**/
_uuid.prototype.isValid = function (uuid) {
  var re = /^([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)$/i
  return re.test(uuid)
}

exports.uuid = _uuid

},{}],10:[function(require,module,exports){
// client or server
var _ = window._

// ---------------------------------------------------
// zzNode
//
// Create in-memory trees with search/sort functionality
// ---------------------------------------------------

function zzNodeConstructor (parent, data, pkField, parentField) {
  return new zzNode(parent, data, pkField, parentField)
}

function zzNode (parent, data, pkField, parentField) {
  // the parent object
  this.parent = parent

  // the data object from the server
  this.data = data

  // references to the parent-children
  this.pkField = pkField
  this.parentField = parentField

  // the fn used to create a new node
  this.nodeConstructor = zzNodeConstructor
  this.nodeItemConstructor = zzNodeConstructor

  // if this object changed, set the dirty bit
  this.isDirty = false

  if (!this.data[pkField]) {
    this.data[pkField] = null
  }

  if (!this.data[parentField]) {
    this.data[parentField] = null
  }

  if (!this.parent) {
    this.parent = null
  } else {
    if (this.parent.getId() !== this.data[parentField]) {
      this.data[parentField] = this.parent.getId()
      this.isDirty = true
    }
  }

  // any children go here
  this.children = []

  this.getData = function () {
    return this.data
  }

  this.getId = function () {
    return this.data[pkField]
  }

  this.getParent = function () {
    return this.parent
  }

  this.getRoot = function () {
    if (this.parent === null) {
      return this
    } else {
      return this.parent.getRoot()
    }
  }

  this.removeChild = function (targetId) {
    if (this.children.length > 0) {
      var index = _.findIndex(this.children, function (obj) { return obj.getId() === targetId })
      if (index > -1) {
        this.children.splice(index, 1)
      }
    }
  }

  this.addChild = function (data, newPKField, newParentField) {
    // already been added?
    var $this = this
    var child = _.find(this.children, function (ch) {
      return ch.getId() === data[$this.pkField]
    })
    // nope
    if (!child) {
      // instead of "new zzNode", using a generic constructor
      child = new this.nodeConstructor(this, data,
        newPKField || this.pkField,
        newParentField || this.parentField
      )
      this.children.push(child)
    }
    return child
  }

  this.findChild = function (targetId, doSearchItems) {
    var hit = null
    if (this.getId() === targetId) {
      hit = this
    } else {
      if (doSearchItems && this.items.length > 0) {
        _.each(this.items, function (item) {
          if (item.getId() === targetId) {
            hit = item
            return false
          }
        })
      }
      if (!hit && this.children.length > 0) {
        _.each(this.children, function (ch) {
          hit = ch.findChild(targetId, doSearchItems)
          if (hit) {
            return false
          }
        })
      }
    }
    return hit
  }

  // After much debate, decided to include an items array. It is similar to the children array
  // except that it contains objects tied to a parent tree and is not a parent object itself
  // (well, it could be but it would be self-contained within its own branch --> which may happen with "control" or "govDoc" if we allow for multi-parts to a doc or control)
  this.items = []
  // not the parent but the designated owning object
  this.itemOwner = null

  this.getItemOwner = function () {
    return this.itemOwner
  }

  this.addItem = function (data, newPKField, newParentField) {
    // already been added?
    var $this = this
    var item = _.find(this.items, function (it) {
      return it.getId() === data[$this.pkField]
    })
    // nope
    if (!item) {
      // instead of "new zzNode", using a generic constructor
      item = this.nodeItemConstructor(null, data, newPKField, newParentField)
      item.itemOwner = this
      this.items.push(item)
    }
    return item
  }

  this.removeItem = function (targetId) {
    if (this.items.length > 0) {
      var index = _.findIndex(this.items, function (obj) { return obj.getId() === targetId })
      if (index > -1) {
        this.items.splice(index, 1)
      }
    }
  }

  this.findItem = function (targetId) {
    var hit = null
    if (this.items.length > 0) {
      _.each(this.items, function (item) {
        if (item.getId() === targetId) {
          hit = item
          return false
        }
      })
    }
    if (!hit && this.children.length > 0) {
      _.each(this.children, function (ch) {
        hit = ch.findItem(targetId)
        if (hit) {
          return false
        }
      })
    }
    return hit
  }

  this.sortChildren = function (fn, noDeepSort) {
    if (!fn) {
      return
    }
    if (this.children.length > 0) {
      this.children.sort(fn)
      if (!noDeepSort) {
        _.each(this.children, function (child) {
          child.sortChildren(fn)
        })
      }
    }
  }

  this.sortItems = function (fn, fnChildren, noDeepSort) {
    if (!fn) {
      return
    }
    if (this.items.length > 0) {
      this.items.sort(fn)
      if (fnChildren) {
        _.each(this.items, function (item) {
          if (!noDeepSort) {
            item.sortChildren(fnChildren, noDeepSort)
          }
        })
      }
    }
  }

  this.getLevelDeep = function () {
    var level = 0
    if (this.parent) {
      level = 1
      level += this.parent.getLevelDeep()
    }
    return level
  }

  this.branchCallFunction = function (fn, startRootFirst, tryItemOwner) {
    if (!startRootFirst) {
      fn && fn(this)
    }
    if (this.parent) {
      this.parent.branchCallfunction(fn, startRootFirst, tryItemOwner)
    }
    if (tryItemOwner && this.itemOwner) {
      this.itemOwner.branchCallfunction(fn, startRootFirst, tryItemOwner)
    }
    if (startRootFirst) {
      fn && fn(this)
    }
  }

  this.branchCallFunctionChildren = function (fn, tryItems) {
    fn && fn(this)
    if (this.children.length > 0) {
      _.each(this.children, function (ch) {
        ch.branchCallFunctionChildren(fn, tryItems)
      })
    }
    if (tryItems && this.items.length > 0) {
      _.each(this.items, function (item) {
        item.branchCallFunctionChildren(fn, tryItems)
      })
    }
  }
}

module.exports.zzNode = zzNode

},{}],11:[function(require,module,exports){
if (typeof jQuery === 'undefined') {
  throw new Error('zazzy-browser\'s JavaScript requires jQuery. jQuery must be included before zazzy-browser\'s JavaScript.')
}

if (typeof BootstrapDialog === 'undefined') {
  throw new Error('zazzy-browser\'s JavaScript requires BootstrapDialog. BootstrapDialog must be included before zazzy-browser\'s JavaScript.')
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
  // rob (==return object)
  _zzb.prototype.rob = new _rob() // {types: _types})
  // ajax helpers with promises
  _zzb.prototype.ajax = new _ajax() // {rob: _rob, types: _types})
  // gets status info (eg user, page, and role info)
  _zzb.prototype.status = new _status() // {types: _types, ajax: _ajax})

  return new _zzb()
}))

},{"./ajax.js":1,"./dialogs.js":2,"./forms.js":3,"./rob.js":4,"./status.js":5,"./strings.js":6,"./types.js":7,"./uib.js":8,"./uuid.js":9,"./zzNode.js":10}]},{},[11]);
