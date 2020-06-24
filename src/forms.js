// client only
var $ = require('jQuery')

// client or server
var _ = require('lodash')

// client only
// used as part of $form.serializeToJSON()
// var serializeToJSON = require('lodash')

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
    // The $form object is a jquery element
    $form: null,
    // $form is not valid, then find the $form by the selector
    selector: null,
    attrFormFieldname: 'name', // this is the standard "name" attribute
    selectorField: '.zzb-field', // changed from "zzb-form-field" --> "zzb-field"
    attrFieldname: 'zzb-fieldname',
    selectorValidateMessage: '.zzb-field-validate', // changed from "zzb-form-field-validate-message" --> "zzb-field-validate"

    // Optionally check for a sub-element where the actual message should display
    selectorValidateMessageContent: '.zzb-field-validate-content',

    isTooltip: false, // requires a "parent" DOM object with relative positioning
    addClassFieldIsValid: false, // optional
    addClassFieldIsInvalid: false, // optional
    selectorInlineSystemFieldname: '._system', // override as appropriate, such as zzb-fieldname="_system-settings.primary"
    listSystemErrsFormatType: 'text-punctuated',

    // Optionally don't hide existing fields
    skipHideFields: false,
    // If true (default), show a small dialog with the system errors, formatted according to listSystemErrsFormatType.
    doFlashSystemErrors: true,
    // these three things lead to the same value of "listErrs"
    listErrs: null,
    errs: null,
    rob: null,
    // callbacks
    fnSystemErrorContent: null, // function(listContent)
    fnDialogSystemErrors: null, // if this is used, then both doFlashSystemErrors and inline selectorInlineSystemFieldname are not used
    fnDialogErrors: null,
    fnDialogSuccess: null
  }, options)

  // If a $form object was not passed in, then find by the selector.
  if (!zzb.types.isObject(options.$form) || options.$form.length === 0) {
    if (zzb.types.isNonEmptyString(options.selector)) {
      if ($(options.selector).length > 0) {
        options.$form = $(options.selector)
      }
    }
  }

  if (!zzb.types.isObject(options.$form) || options.$form.length === 0) {
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

  options.$form.removeClass('was-validated')

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

  // hide current fields... this may have been run prior to this function
  if (options.skipHideFields !== true) {
    zzb.forms.hideValidateFields(options)
  }

  // set form fields with validation results
  options.$form.find(options.selectorField).each(function (index, field) {
    var $field = $(field)
    var fieldname = $field.attr(options.attrFormFieldname)
    var errField = null

    if (!zzb.types.isNonEmptyString(fieldname)) {
      return // jquery equivelant to "continue"
    }

    if (zzb.types.isNonEmptyString(fieldname)) {
      if (hasFieldErrors) {
        _.each(list.fields, function (err) {
          if (err.field === fieldname) {
            errField = err
            return false // lodash equivelant to "break"
          }
        })
      }

      var $message = options.$form.find(options.selectorValidateMessage + '[' + options.attrFieldname + "='" + fieldname + "']")
      if (zzb.types.isObject($message) && $message.length > 0) {
        var $content = $message.find(options.selectorValidateMessageContent)
        if (!zzb.types.isObject($content) || $content.length === 0) {
          $content = $message
        }

        $message.addClass('d-none')
        hideValidateTargetCSS($content, false)

        if (errField) {
          $content.html(zzb.strings.toFirstCapitalEndPeriod(errField.message))
          if (errField.isErr === false) { // in this way undefined | null | true will travel the "else" path
            $content.addClass(cssMessageValid)
          } else {
            $content.addClass(cssMessageInvalid)
          }
          $content.show()
          $message.removeClass('d-none')
        }
      }
    }

    hideValidateTargetCSS($field, true)

    // add the valid class to the field elem (eg input)
    if (errField) {
      if (options.addClassFieldIsInvalid) {
        $field.addClass(cssInvalid)
      }
    } else {
      if (options.addClassFieldIsValid) {
        $field.addClass(cssValid)
      }
    }
  })

  // --------------------------------------
  // System Messages

  if (list.hasSystemErrors()) {
    var messages = ''
    // via custom dialog
    if (options.fnDialogSystemErrors && zzb.types.isFunction(options.fnDialogSystemErrors)) {
      options.fnDialogSystemErrors(zzb.rob.renderListErrs({ errs: list.system, format: options.listSystemErrsFormatType }), function () {
        runCallback()
      })
      return // exit
    } else if (zzb.types.isNonEmptyString(options.selectorInlineSystemFieldname)) {
      // via inline
      var $sysDisplay = options.$form.find(options.selectorValidateMessage + '[' + options.attrFieldname + "='" + options.selectorInlineSystemFieldname + "']")
      if (zzb.types.isObject($sysDisplay) && $sysDisplay.length > 0) {
        var $content = $sysDisplay.find(options.selectorValidateMessageContent)
        if (!zzb.types.isObject($content) || $content.length === 0) {
          $content = $sysDisplay
        }

        $sysDisplay.addClass('d-none')
        hideValidateTargetCSS($content, false)

        messages = zzb.rob.renderListErrs({ errs: list.system, format: options.listSystemErrsFormatType })
        if (zzb.types.isNonEmptyString(messages)) {
          if (options.fnSystemErrorContent && zzb.types.isFunction(options.fnSystemErrorContent)) {
            messages = options.fnSystemErrorContent(messages)
          } // else {
          //   messages = '<ul>' + messages + '</ul>'
          // }
          $content.html(messages)
          $content.addClass(cssMessageInvalid)
          $content.show()
          $sysDisplay.removeClass('d-none')
        }
      }
    } else if (options.doFlashSystemErrors !== false) {
      // this is the default unless doFlashSystemErrors is explicitly set to false
      // via small dialog box
      messages = zzb.rob.renderListErrs({ errs: list.system, format: options.listSystemErrsFormatType })
      if (zzb.types.isNonEmptyString(messages)) {
        if (options.fnSystemErrorContent && zzb.types.isFunction(options.fnSystemErrorContent)) {
          messages = options.fnSystemErrorContent(messages)
        }
        zzb.dialogs.showMessage({
          className: 'zzb-dialog-flash-message zzb-flash-invalid', // zzb-flash-valid
          dataBackdrop: 'static',
          body: messages,
          onHide: function () {
            runCallback()
          }
        })
      }
      return // exit
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

// This function removes validation css classes from the target elem
function hideValidateTargetCSS ($target, isField) {
  if (zzb.types.isObject($target) && $target.length > 0) {
    if (isField === true) {
      $target.removeClass('is-valid')
      $target.removeClass('is-invalid')
    } else {
      $target.removeClass('valid-feedback')
      $target.removeClass('invalid-feedback')
      $target.removeClass('valid-tooltip')
      $target.removeClass('invalid-tooltip')
    }
  }
}

_forms.prototype.hideValidateFields = function (options) {
  options = _.merge({
    $form: null,
    selectorField: '.zzb-field', // changed from "zzb-form-field" --> "zzb-field"
    selectorValidateMessage: '.zzb-field-validate', // changed from "zzb-form-field-validate-message" --> "zzb-field-validate"
    selectorValidateMessageContent: '.zzb-field-validate-content'
  }, options)

  if (!zzb.types.isObject(options)) {
    throw new Error('displayFormSubmitResults: options not defined')
  }
  // ---------------------------------
  // check the fields (eg input fields)
  // ---------------------------------
  var $target = null
  if (!zzb.types.isObject(options.$form) || options.$form.length === 0) {
    $target = $(options.selectorField)
  } else {
    $target = options.$form.find(options.selectorField)
  }
  if (zzb.types.isObject($target) && $target.length > 0) {
    $target.each(function () {
      hideValidateTargetCSS($(this), true)
    })
  }
  // ---------------------------------
  // first check the validation elements
  // ---------------------------------
  if (!zzb.types.isObject(options.$form) || options.$form.length === 0) {
    $target = $(options.selectorValidateMessage)
  } else {
    $target = options.$form.find(options.selectorValidateMessage)
  }
  if (zzb.types.isObject($target) && $target.length > 0) {
    $target.each(function () {
      $(this).addClass('d-none')
      var $sub = $(this).find(options.selectorValidateMessageContent)
      if (!zzb.types.isObject($sub) || $sub.length === 0) {
        $sub = $(this)
      }
      hideValidateTargetCSS($sub, false)
    })
  }
}

_forms.prototype.serializeFormData = function (options) {
  options = _.merge({
    formSelector: null,
    $form: null,
    action: null
  }, options)

  options.$form = zzb.forms.findForm(options.$form)
  if (!zzb.types.isObject(options.$form) || options.$form.length === 0) {
    options.$form = zzb.forms.findForm(options.formSelector)
    if (!zzb.types.isObject(options.$form) || options.$form.length === 0) {
      throw new Error('serializeFormData: $form not found')
    }
  }

  // using https://github.com/marioizquierdo/jquery.serializeJSON
  // Requires the type be on the checkbox (eg name-of-field:bool)
  // var data = $form.serializeJSON({parseBooleans: true, parseNumbers: true})
  // using https://github.com/raphaelm22/jquery.serializeToJSON
  // Does not require the type, but output is a hierarchy with parent-child relationships
  var data = options.$form.serializeToJSON()
  // using https://github.com/rc1021/serialize-json
  // Does not require the type, but output is a hierarchy with parent-child relationships - doesn't convert string to bool by default
  // var data = $form.serializeJson()

  if (zzb.types.isNonEmptyString(options.action)) {
    data.submit = options.action
  }

  options.data = data

  return options
}

_forms.prototype.submitForm = function (options, callback) {
  if (!zzb.types.isObject(options)) {
    throw new Error('submitForm: options param not defined')
  }
  if (zzb.types.isObject(options.$form) && options.$form.length > 0 && !zzb.types.isNonEmptyString(options.url)) {
    options.url = options.$form.attr('action')
  }
  if (!zzb.types.isNonEmptyString(options.url)) {
    throw new Error('submitForm: options.url is unknown')
  }
  if (!zzb.types.isObject(options.data)) {
    throw new Error('submitForm: options.data not defined')
  }

  // hide any fields showing error/success validations
  zzb.forms.hideValidateFields(options)

  zzb.ajax.postJSON({ url: options.url, data: options.data })
    .then(function (rob) {
      // Only errors returned at this level b/c underlying function does...
      // 1. handle redirect (can skip with SKIPREDIRECT: true
      //                     OR override with a custom function onRedirect: function(data, callback){}
      //                     where the callback has optional param "skipRedirect")
      // 2. show flash message (can skip with SKIPFLASH: true)
      options.rob = rob
      if (!rob.hasErrors()) {
        zzb.forms.hideValidateFields(options)
        callback && callback(options)
      } else {
        zzb.forms.displayUIErrors(options, function () {
          callback && callback(options)
        })
      }
    }).catch(function (err) {
      zzb.dialogs.handleError({
        log: 'failed to post login form: ' + err,
        title: 'Unknown error',
        message: 'An unknown communications error occurred while retrieving the login form. Please check your connection settings and try again.'
      })
    })
}

_forms.prototype.flashSystemErrors = function (options, callback) {
  options = _.merge({ listSystemErrsFormatType: 'text-punctuated', rob: null }, options)
  if (!options.rob || !options.rob.listErrs || !options.rob.listErrs.hasSystemErrors()) {
    callback && callback(options.rob)
  } else {
    var messages = zzb.rob.renderListErrs({ errs: options.rob.listErrs.system, format: options.listSystemErrsFormatType })
    if (zzb.types.isNonEmptyString(messages)) {
      zzb.dialogs.showMessage({
        className: 'zzb-dialog-flash-message zzb-dialog-flash-status-error',
        dataBackdrop: 'static',
        body: messages,
        onHide: function () {
          callback && callback(options.rob)
        }
      })
    }
  }
}

exports.forms = _forms
