// client only
var $ = require('jQuery')

// client or server
var _ = require('lodash')

// ---------------------------------------------------
// _forms
// ---------------------------------------------------

var _forms = function () {}

_forms.prototype.findForm = function (id) {
  var $form
  if (zzb.types.isString(id)) {
    if (id.length > 0 && id[0] === '.') {
      // assume a class
      $form = $(id)
    } else {
      // assume an id... but it may need to be escaped by '#'
      $form = $(zzb.types.escapeJqueryId(id))
    }
  } else {
    $form = $(id).closest('form')
  }
  return $form
}

_forms.prototype.displayUIErrors = function (options, callback) {
  options = _.merge({
    selector: null,
    $form: null,
    selectorField: '.zzb-form-field',
    attrFieldname: 'zzb-fieldname',
    selectorValidateMessage: '.zzb-form-field-validate-message',
    isTooltip: false, // requires a "parent" DOM object with relative positioning
    addIsValidCSS: false,
    selectorDisplaySystemMessage: '.zzb-form-display-system-message',
    // these three things lead to the same value of "listErrs"
    listErrs: null,
    errs: null,
    rob: null,
    // callbacks
    fnSystemErrorContent: null, // function(listContent)
    fnDialogSystemErrors: null, // if this is used, then the inline selectorDisplaySystemMessage will not be used
    fnDialogErrors: null,
    fnDialogSuccess: null
  }, options)

  if (zzb.types.isNonEmptyString(options.selector)) {
    if ($(options.selector).length > 0) {
      options.$form = $(options.selector)
    }
  }

  if ((options.$form === null) || (options.$form.length === 0)) {
    // eslint-disable-next-line standard/no-callback-literal
    return callback && callback(false, new Error('could not select the form'))
  }

  var list = null

  if (options.listErrs) {
    list = options.listErrs
  } else if (options.rob && options.rob.listErrs) {
    list = options.rob.listErrs
  } else if (options.errs) {
    list = zzb.rob.toListErrs(options.errs)
  } else {
    // eslint-disable-next-line standard/no-callback-literal
    return callback && callback(false, new Error('could not find the list of errors'))
  }

  var runCallback = function () {
    // we are successful when we don't have errors
    // eslint-disable-next-line standard/no-callback-literal
    callback && callback(!list.hasErrors(), null)
  }

  var cssValid = 'is-valid '
  var cssInvalid = 'is-invalid'

  var cssMessageValid = 'valid-feedback'
  var cssMessageInvalid = 'invalid-feedback'

  if (options.isTooltip) {
    cssMessageValid = 'valid-tooltip'
    cssMessageInvalid = 'invalid-tooltip'
  }

  // no errors! :) ... but we need to show is-valid css, removing the invalids
  var hasFieldErrors = list.hasFieldErrors()

  // reset form... no validation errors
  options.$form.find(options.selectorField).each(function (index, field) {
    var $field = $(field)
    var fieldname = $field.attr(options.attrFieldname)
    var errField = null

    if (zzb.types.isNonEmptyString(fieldname)) {
      if (hasFieldErrors) {
        _.each(list.fields, function (err) {
          if (err.field === fieldname) {
            errField = err
            return false
          }
        })
      }

      var $message = options.$form.find(options.selectorValidateMessage + '[' + options.attrFieldname + "='" + fieldname + "']")

      if ($message && $message.length > 0) {
        if (errField) {
          $message.html(errField.message)
          $message.addClass(cssMessageInvalid)
          $message.removeClass(cssMessageValid)
        } else {
          $message.addClass(cssMessageValid)
          $message.removeClass(cssMessageInvalid)
        }
      }
    }

    if (errField) {
      $field.addClass(cssInvalid)
      $field.removeClass(cssValid)
    } else {
      if (options.addIsValidCSS) {
        $field.addClass(cssValid)
      }
      $field.removeClass(cssInvalid)
    }
  })

  // --------------------------------------
  // System Messages

  // via dialog
  if (list.hasSystemErrors()) {
    if (options.fnDialogSystemErrors && zzb.types.isFunction(options.fnDialogSystemErrors)) {
      options.fnDialogSystemErrors(zzb.rob.renderListErrs({ errs: list.system, format: 'html-list' }), function () {
        runCallback()
      })
      return // exit
    }
  }

  // via inline
  if (zzb.types.isNonEmptyString(options.selectorDisplaySystemMessage)) {
    var $sysDisplay = options.$form.find(options.selectorDisplaySystemMessage)
    if ($sysDisplay && $sysDisplay.length > 0) {
      $sysDisplay.hide()
      $sysDisplay.html('')

      if (list.hasSystemErrors()) {
        var messages = zzb.rob.renderListErrs({ errs: list.system, format: 'html-list' })
        if (zzb.types.isNonEmptyString(messages)) {
          if (options.fnSystemErrorContent && zzb.types.isFunction(options.fnSystemErrorContent)) {
            messages = options.fnSystemErrorContent(messages)
          } else {
            messages = '<ul>' + messages + '</ul>'
          }
          $sysDisplay.html(messages)
          $sysDisplay.removeClass(cssMessageValid)
          $sysDisplay.addClass(cssMessageInvalid)
          $sysDisplay.show()
        }
      }
    }
  }

  if (list.hasErrors()) {
    if (options.fnDialogErrors && zzb.types.isFunction(options.fnDialogErrors)) {
      options.fnDialogErrors(function () {
        runCallback()
      })
    } else {
      runCallback()
    }
  } else if (options.fnDialogSuccess && zzb.types.isFunction(options.fnDialogSuccess)) {
    options.fnDialogSuccess(function () {
      runCallback()
    })
  } else {
    runCallback()
  }
}

exports.forms = _forms
