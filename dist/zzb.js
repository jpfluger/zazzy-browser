//! zzb.js
//! version: 1.3.13
//! author(s): Jaret Pfluger
//! license: MIT
//! https://github.com/jpfluger/zazzy-browser
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// client only
var $ = window.$

// client or server
// var _ = require('lodash')

// ---------------------------------------------------
// _ajax
// ---------------------------------------------------

function _ajax () {
  this.ajax = function (options) {
    options = _.merge({ SKIPREDIRECT: false, SKIPFLASH: false, NOFAILLOG: false, NOFAILFLASH: false, FAILFLASHMESSAGE: '' }, options)
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

          var noFinalResolve = false
          var rob = zzb.rob.newROB()

          if (!jqXHR.responseJSON) {
            // html or some other data type was returned
            rob.recs = [data]
          } else {
            // handle redirect
            if (options.SKIPREDIRECT !== true) {
              if (data.redirect && data.redirect.length > 0) {
                if (zzb.types.isFunction(options.onRedirect)) {
                  options.onRedirect(data, function (skipRedirect) {
                    if (!skipRedirect) {
                      window.location.href = data.redirect
                    }
                  })
                  return
                } else if (zzb.types.isNonEmptyString(data.message)) {
                  zzb.dialogs.showMessage({
                    className: 'zzb-dialog-flash-message zzb-dialog-flash-redirect',
                    dataBackdrop: 'static',
                    body: data.message,
                    onHide: function (ev) {
                      window.location.href = data.redirect
                    }
                  })
                } else {
                  window.location.href = data.redirect
                }
                return
              }
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
                data.errs = zzb.rob.sanitizeErrors(data.error)
                data.err = null
              } else if (data.errs) {
                data.errs = zzb.rob.sanitizeErrors(data.errs)
                data.err = null
              }
            }

            // Records are ALWAYS an array
            if (!data.ISROBRECS) {
              if (data.recs) {
                data.recs = zzb.rob.sanitizeRecords(data.recs)
              } else if (data.rec) {
                data.recs = zzb.rob.sanitizeRecords(data.rec)
                data.rec = null
              } else if (!Array.isArray(data.errs) || data.errs.length === 0) {
                // pass in self
                data.recs = zzb.rob.sanitizeRecords(data)
              }
            }

            if (data.paginate) {
              rob.paginate = data.paginate
            }

            rob.errs = data.errs
            rob.recs = data.recs
            rob.columns = data.columns

            rob.listErrs = zzb.rob.toListErrs(rob.errs)

            if (options.SKIPFLASH !== true) {
              if (zzb.types.isNonEmptyString(data.message)) {
                noFinalResolve = true
                zzb.dialogs.showMessage({
                  className: 'zzb-dialog-flash-message ' + zzb.strings.format('zzb-dialog-flash-status-{0}', rob.hasErrors() ? 'error' : 'okay'),
                  dataBackdrop: 'static',
                  body: data.message,
                  onHide: function (ev) {
                    resolve(rob)
                  }
                })
              }
            }

            // finish processing
            if (zzb.types.isFunction(options.onFinish)) {
              noFinalResolve = true
              options.onFinish(rob, function (noResolve) {
                if (noResolve === true) {
                  return
                }
                resolve(rob)
              })
            }
          }

          if (noFinalResolve !== true) {
            resolve(rob)
          }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          // if (jqXHR.responseJSON) {
          //  if (data.redirect) {
          //    return window.location.href = data.redirect
          //  }
          // }
          reject(errorThrown)
          if (options.NOFAILLOG === true && errorThrown) {
            console.log(errorThrown)
          }
          if (options.NOFAILFLASH !== true) {
            if (zzb.types.isNonEmptyString(options.FAILFLASHMESSAGE)) {
              zzb.ajax.showMessageFailedAction({ message: options.FAILFLASHMESSAGE })
            } else {
              zzb.ajax.showMessageFailedAction({ message: AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED_NETWORK })
            }
          }
        })
    })
  }
}

var AjaxMessage = function (options) {
}

AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED = 'Submission failed unexpectedly. '
AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED_NETWORK = 'Submission failed unexpectedly. This is likely a broken network connection and will resolve itself once reconnected.'
AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED_NETWORK_VERBOSE = 'Submission failed unexpectedly. This is likely a broken network connection and will resolve itself once reconnected. Either your network is down or our server is down'
AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED_WITHADMIN = 'Submission failed unexpectedly. Contact the administrator should the problem persist.'
AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED_NETWORK_WITHADMIN = 'Submission failed unexpectedly. This is likely a broken network connection and will resolve itself once reconnected. Contact the administrator should the problem persist.'

_ajax.prototype.showMessageFailedAction = function (options) {
  options = _.merge({ err: null, number: null, message: AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED }, options)
  if (zzb.types.isNumber(options.number)) {
    options.number = ' (' + options.number + ')'
  }
  if (options.err) {
    console.log(options.err)
  }
  zzb.dialogs.showMessage({
    className: 'zzb-dialog-flash-message zzb-flash-invalid', // zzb-flash-valid
    dataBackdrop: 'static',
    body: options.message + options.number
  })
}

// Sometimes a request is made for an html snippet but json is returned. The function will error if the dataType i
// specified but in the wrong format. This function removes 'dataType' but you can do it manually by using {dataType: ''}
_ajax.prototype.get = function (options) {
  options = _.merge({ contentType: 'application/json; charset=UTF-8', data: {} }, options)
  options.type = 'GET'
  if (!zzb.types.isNonEmptyString(options.data)) {
    options.data = JSON.stringify(options.data)
  }
  return this.ajax(options)
}

// Sometimes a request is made for an html snippet but json is returned. The function will error if the dataType i
// specified but in the wrong format. To have jquery "guess", then override datatype in this way: {dataType: ''}
_ajax.prototype.getJSON = function (options) {
  options = _.merge({ dataType: 'json', contentType: 'application/json; charset=UTF-8', data: {} }, options)
  options.type = 'GET'
  if (!zzb.types.isNonEmptyString(options.data)) {
    options.data = JSON.stringify(options.data)
  }
  return this.ajax(options)
}

// Sometimes a request is made for an html snippet but json is returned. The function will error if the dataType i
// specified but in the wrong format. To have jquery "guess", then override datatype in this way: {dataType: ''}
_ajax.prototype.postJSON = function (options) {
  options = _.merge({ dataType: 'json', contentType: 'application/json; charset=UTF-8', data: {} }, options)
  options.type = 'POST'
  if (!zzb.types.isNonEmptyString(options.data)) {
    options.data = JSON.stringify(options.data)
  }
  return this.ajax(options)
}

exports.ajax = _ajax

},{}],2:[function(require,module,exports){
// css styling for modal uses bootstrap4-fs-modal
// https://github.com/keaukraine/bootstrap4-fs-modal

// client or server
var _ = window._

// ---------------------------------------------------
// BootstrapDialog
// refined port of https://github.com/nakupanda/bootstrap3-dialog (MIT LICENSE)
// ---------------------------------------------------

var ZazzyDialog = function (options) {
  this.defaultOptions = ZazzyDialog.getDialogDefaults(options)

  this.defaultOptions.onShow = typeof options.onShow === 'function' ? options.onShow : function () {}
  this.defaultOptions.onShown = typeof options.onShown === 'function' ? options.onShown : function () {}
  this.defaultOptions.onHide = typeof options.onHide === 'function' ? options.onHide : function () {}
  this.defaultOptions.onHidden = typeof options.onHidden === 'function' ? options.onHidden : function () {}
}

ZazzyDialog.getButtonDefaults = function (options) {
  var button = {
    id: null,
    type: ZazzyDialog.TYPE_NONE,
    label: '',
    className: '',
    action: null,
    isDismiss: false,
    isOutline: false
  }
  return (zzb.types.isObject(options) ? _.merge(button, options) : button)
}

ZazzyDialog.getDialogDefaults = function (options) {
  var dialog = {
    id: zzb.uuid.newV4(),
    type: ZazzyDialog.TYPE_NONE,
    className: '',
    extraAttributes: '',
    noFade: false,
    title: '',
    body: '',
    buttons: [],
    onShow: null,
    onShown: null,
    onHide: null,
    onHidden: null,
    doVerticalCenter: true,
    doAutoDestroy: true,
    underlay: {
      isOn: false,
      id: null,
      className: '',
      bg: '#838383',
      opacity: 0.5
    }
  }
  return (zzb.types.isObject(options) ? _.merge(dialog, options) : dialog)
}

ZazzyDialog.BUTTON_CLOSE = 'button-close'
ZazzyDialog.BUTTON_OK = 'button-ok'
ZazzyDialog.BUTTON_YES = 'button-yes'
ZazzyDialog.BUTTON_NO = 'button-no'
ZazzyDialog.BUTTON_CANCEL = 'button-cancel'

// standard is "btn-TYPE"; outline effect is "btn-outline-TYPE"
ZazzyDialog.TYPE_NONE = 'none'
ZazzyDialog.TYPE_PRIMARY = 'primary'
ZazzyDialog.TYPE_SECONDARY = 'secondary'
ZazzyDialog.TYPE_SUCCESS = 'success'
ZazzyDialog.TYPE_DANGER = 'danger'
ZazzyDialog.TYPE_WARNING = 'warning'
ZazzyDialog.TYPE_INFO = 'info'
ZazzyDialog.TYPE_LIGHT = 'light'
ZazzyDialog.TYPE_DARK = 'dark'
ZazzyDialog.TYPE_LINK = 'link'

ZazzyDialog.getButtonPreset = function (preset, order, max) {
  var button = ZazzyDialog.getButtonDefaults()
  button.isDismiss = true

  if (order === (max - 1)) {
    button.type = ZazzyDialog.TYPE_PRIMARY
  } else if (order === (max - 2)) {
    button.type = ZazzyDialog.TYPE_SECONDARY
  }

  switch (preset) {
    case 'button-close':
      button.label = 'Close'
      break
    case 'button-ok':
      button.label = 'Ok'
      break
    case 'button-accept':
      button.label = 'Accept'
      break
    case 'button-yes':
      button.label = 'Yes'
      break
    case 'button-no':
      button.label = 'No'
      break
    case 'button-cancel':
      button.label = 'Cancel'
      break
    default:
      button = null
  }

  return button
}

ZazzyDialog.validateType = function (type) {
  if (!type) {
    return ZazzyDialog.TYPE_NONE
  }

  switch (type) {
    case ZazzyDialog.TYPE_PRIMARY:
    case ZazzyDialog.TYPE_SECONDARY:
    case ZazzyDialog.TYPE_SUCCESS:
    case ZazzyDialog.TYPE_DANGER:
    case ZazzyDialog.TYPE_WARNING:
    case ZazzyDialog.TYPE_INFO:
    case ZazzyDialog.TYPE_LIGHT:
    case ZazzyDialog.TYPE_DARK:
    case ZazzyDialog.TYPE_LINK:
      return type
    default:
      return ZazzyDialog.TYPE_NONE
  }
}

ZazzyDialog.isTypeNone = function (type) {
  return ZazzyDialog.validateType(type) === ZazzyDialog.TYPE_NONE
}

ZazzyDialog.prototype.getId = function () {
  if (!(zzb.types.isNonEmptyString(this.defaultOptions.id))) {
    this.defaultOptions.id = zzb.uuid.newV4()
  }
  return this.defaultOptions.id
}

ZazzyDialog.prototype.getClassName = function () {
  if (!(zzb.types.isNonEmptyString(this.defaultOptions.className))) {
    this.defaultOptions.className = ''
  }
  return this.defaultOptions.className
}

ZazzyDialog.prototype.getTitle = function () {
  if (!(zzb.types.isNonEmptyString(this.defaultOptions.title))) {
    this.defaultOptions.title = ''
  }
  return this.defaultOptions.title
}

ZazzyDialog.prototype.getBody = function () {
  if (!(zzb.types.isNonEmptyString(this.defaultOptions.body))) {
    this.defaultOptions.body = ''
  }
  return this.defaultOptions.body
}

ZazzyDialog.prototype.create$Modal = function () {
  var options = _.merge({
    id: this.getId(),
    arialabel: 'arialabel' + this.getId(),
    className: this.getClassName(),
    title: this.getTitle(),
    body: this.getBody(),
    classVerticalCenter: (this.defaultOptions.doVerticalCenter ? ' modal-dialog-centered' : ''),
    classModalHeader: '',
    noHeaderCloseButton: false,
    noHeaderCloseButtonButton: ''
  }, this.defaultOptions)

  options.classFade = 'fade'
  if (zzb.types.isBoolean(options.noFade) && options.noFade === true) {
    options.classFade = ''
  }

  if (!ZazzyDialog.isTypeNone(this.defaultOptions.type)) {
    options.classModalHeader += ' alert-' + this.defaultOptions.type
  }

  if (zzb.types.isNonEmptyString(options.dataBackdrop)) {
    options.extraAttributes += ' data-backdrop="' + options.dataBackdrop + '"'
  }

  if (zzb.types.isBoolean(options.dataKeyboard)) {
    options.extraAttributes += ' data-keyboard="' + options.dataKeyboard + '"'
  }

  if (options.noHeaderCloseButton !== true) {
    options.noHeaderCloseButtonButton = '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
  }

  var template = '<div class="modal {classFade} modal-fullscreen {className}" {extraAttributes} id="{id}" tabindex="-1" role="dialog" aria-labelledby="{arialabel}" aria-hidden="true">' +
    '<div class="modal-dialog{classVerticalCenter}" role="document">' +
    '<div class="modal-content">' +
    '<div class="modal-header{classModalHeader}">' +
    '<h5 class="modal-title" id="{arialabel}">{title}</h5>' +
    '{noHeaderCloseButtonButton}' +
    '</div>' +
    '<div class="modal-body">{body}</div>' +
    '<div class="modal-footer">' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>'

  var $modal = $(zzb.strings.format(template, options))

  if (!(Array.isArray(this.defaultOptions.buttons))) {
    this.defaultOptions.buttons = []
  }

  var self = this
  var maxButtons = this.defaultOptions.buttons.length

  _.each(this.defaultOptions.buttons, function (button, ii) {
    if (zzb.types.isNonEmptyString(button)) {
      button = ZazzyDialog.getButtonPreset(button, ii, maxButtons)
    }

    if (!(zzb.types.isObject(button))) {
      return // continue
    }

    if (!(zzb.types.isNonEmptyString(button.id))) {
      button.id = 'button-' + ii + '-' + self.getId()
    }

    if (button.isDismiss) {
      if (!zzb.types.isFunction(button.action)) {
        button.action = function (dialog, ev) {
          dialog.close()
        }
      }
      $modal.find('.modal-header button.close').attr('aria-label', button.label)
    }

    if (!ZazzyDialog.isTypeNone(button.type)) {
      if (button.isOutline) {
        button.className += ' btn-outline-' + button.type
      } else {
        button.className += ' btn-' + button.type
      }
    }

    var $button = $(zzb.strings.format('<button id="{id}" type="button" class="btn {className}">{label}</button>', button))
    $button.data('button', button)

    // Button action (eg onClick)
    $button.on('click', { dialog: self, $button: $button, button: button }, function (event) {
      var dialog = event.data.dialog
      var $button = event.data.$button
      var button = $button.data('button')
      if (typeof button.action === 'function') {
        return button.action.call($button, dialog, event)
      }
    })

    if ($modal.find('.modal-footer > button').length > 0) {
      $button.insertAfter($modal.find('.modal-footer > button').last())
    } else {
      $modal.find('.modal-footer').append($button)
    }
  })

  return $modal
}

ZazzyDialog.prototype.open = function () {
  if (!this.$modal) {
    this.$modal = this.create$Modal()
    var self = this

    // https://getbootstrap.com/docs/4.0/components/modal/#events
    this.$modal.on('show.bs.modal', function (ev) {
      self.onShow(ev)
    })
    this.$modal.on('shown.bs.modal', function (ev) {
      self.onShown(ev)
    })
    this.$modal.on('hide.bs.modal', function (ev) {
      self.onHide(ev)
    })
    this.$modal.on('hidden.bs.modal', function (ev) {
      self.onHidden(ev)
    })
  }

  if (zzb.types.isObject(this.defaultOptions.underlay) && this.defaultOptions.underlay.isOn === true) {
    if (!zzb.types.isNonEmptyString(this.defaultOptions.underlay.id)) {
      this.defaultOptions.underlay.id = 'zzbModalUnderlay'
    }
    var $underlay = $underlay = $('#' + this.defaultOptions.underlay.id)
    if ($underlay.length === 0) {
      var underlayAttributes = []
      if (zzb.types.isNonEmptyString(this.defaultOptions.underlay.className)) {
        underlayAttributes.push(' class="' + this.defaultOptions.underlay.className + '"')
      } else {
        underlayAttributes.push(' style="')
        underlayAttributes.push('position:absolute;top:0;left:0;width:100%;height:100%;display:none;')
        if (zzb.types.isNonEmptyString(this.defaultOptions.underlay.bg)) {
          underlayAttributes.push('background-color:' + this.defaultOptions.underlay.bg + ';')
          if (zzb.types.isNumber(this.defaultOptions.underlay.opacity)) {
            underlayAttributes.push('opacity:' + this.defaultOptions.underlay.opacity + ';')
          }
        }
        underlayAttributes.push('"')
      }
      $('<div id="' + this.defaultOptions.underlay.id + '" ' + underlayAttributes.join('') + '></div>').appendTo('body')
      $underlay = $('#' + this.defaultOptions.underlay.id)
    }
    $underlay.show()
  }

  this.$modal.modal('show')
  this.$modal.appendTo('body')
}

ZazzyDialog.prototype.onShow = function (ev) {
  this.defaultOptions.onShow(ev, this, this.$modal)
}

ZazzyDialog.prototype.onShown = function (ev) {
  this.defaultOptions.onShown(ev, this, this.$modal)
}

ZazzyDialog.prototype.onHide = function (ev) {
  this.defaultOptions.onHide(ev, this, this.$modal)
}

ZazzyDialog.prototype.onHidden = function (ev) {
  this.defaultOptions.onHidden(ev, this, this.$modal)
  if (this.defaultOptions.doAutoDestroy) {
    this.$modal.remove()
  }
}

ZazzyDialog.prototype.close = function () {
  this.$modal.modal('hide')
  if (zzb.types.isObject(this.defaultOptions.underlay) && this.defaultOptions.underlay.isOn === true) {
    if (zzb.types.isNonEmptyString(this.defaultOptions.underlay.id)) {
      var $underlay = $underlay = $('#' + this.defaultOptions.underlay.id)
      if ($underlay.length > 0) {
        $underlay.hide()
      }
    }
  }
}

ZazzyDialog.prototype.destroy = function () {
  // delete dialog from the body
  this.$modal.modal('hide')
  this.$modal.modal('dispose')
  if ($('#' + this.getId()).length > 0) {
    $('#' + this.getId()).remove()
  }

  if (zzb.types.isObject(this.defaultOptions.underlay) && this.defaultOptions.underlay.isOn === true) {
    if (zzb.types.isNonEmptyString(this.defaultOptions.underlay.id)) {
      var $underlay = $underlay = $('#' + this.defaultOptions.underlay.id)
      if ($underlay.length > 0) {
        $underlay.remove()
      }
    }
  }

  this.$modal = null
}

// ---------------------------------------------------
// _dialogs
// ---------------------------------------------------

var _dialogs = function () {}

_dialogs.prototype.ZazzyDialog = ZazzyDialog

_dialogs.prototype.modal = function (options) {
  return new ZazzyDialog(options)
}

_dialogs.prototype.showMessage = function (options) {
  var dialog = zzb.dialogs.modal(_.merge({
    type: ZazzyDialog.TYPE_NONE,
    buttons: [ZazzyDialog.BUTTON_OK]
  }, options))

  dialog.open()
}

_dialogs.prototype.showMessageChoice = function (options) {
  var dialog = zzb.dialogs.modal(_.merge({
    type: ZazzyDialog.TYPE_NONE,
    buttons: [
      ZazzyDialog.BUTTON_CANCEL,
      ZazzyDialog.getButtonDefaults({
        type: ZazzyDialog.TYPE_PRIMARY,
        label: 'Accept',
        action: function (dialog, ev) {
          dialog.close()
        }
      })
    ]
  }, options))

  dialog.open()
}

_dialogs.prototype.handleError = function (options) {
  var template = '<div class="zzb-dialog-errors">{errors}</div>' +
    '<div class="zzb-dialog-message">{message}</div>'

  // this.dialogs.handleError({log: 'failed to retrieve login dialog form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the login form. Please check your connection settings and try again.'})
  options = _.merge({
    log: null,
    type: ZazzyDialog.TYPE_DANGER,
    title: '',
    body: template,
    message: '',
    errs: null,
    errors: '',
    buttons: [
      ZazzyDialog.getButtonDefaults({
        type: ZazzyDialog.TYPE_DANGER,
        label: 'Ok',
        action: function (dialog, ev) {
          dialog.close()
        }
      })
    ]
  }, options)

  if (options.log) {
    console.log(options.log)
  }

  if (!zzb.types.isNonEmptyString(options.errors)) {
    if (zzb.types.isArray(options.errs)) {
      var arrHtml = []

      _.each(options.errs, function (err, index) {
        if (err.message && zzb.types.isNonEmptyString(err.message)) {
          arrHtml.push(zzb.strings.format('<div class="zzb-dialog-error-item">{0}</div>', err.message))
        }
      })

      options.errors = arrHtml.join('\n')
    }
  }

  options.body = zzb.strings.format(options.body, options)
  this.showMessage(options)
}

exports.dialogs = _dialogs

},{}],3:[function(require,module,exports){
// client only
var $ = window.$

// client or server
var _ = window._

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
    // If true (default), show a small dialog with the system errors, formatted according to listSystemErrsFormatType.
    doFlashSystemErrors: true, // set to false if it is desired to trip selectorInlineSystemFieldname
    selectorInlineSystemFieldname: '_system', // override as appropriate, such as zzb-fieldname="_system-settings.primary"
    listSystemErrsFormatType: 'text-punctuated',

    // Optionally don't hide existing fields
    skipHideFields: false,
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
  var data = options.$form.serializeToJSON({
    parseFloat: {
      condition: '.zzb-number,.zzb-money'
    }
  })
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

},{}],4:[function(require,module,exports){
// client or server
var _ = window._

// ---------------------------------------------------
// perms (Permission Keys)
// ---------------------------------------------------

var _perms = function () {}

_perms.prototype.getPO = function (pos, key) {
  var po = pos[key]

  if (po) {
    return po
  }

  return this.getPermObject(key + ':')
}

_perms.prototype.getPermObjectFromPermkeys = function (permkeys) {
  var pos = {}
  var self = this

  if (Array.isArray(permkeys)) {
    _.each(permkeys, function (permkey) {
      var po = self.getPermObject(permkey)
      if (po.key) {
        pos[po.key] = po
      }
    })
  } else if (zzb.types.isObject(permkeys)) {
    _.forOwn(permkeys, function (perm, key) {
      if (!perm) {
        perm = ''
      }
      var po = null
      if (perm.indexOf(':') < 0) {
        po = self.getPermObject(key + ':' + perm)
      } else {
        po = self.getPermObject(perm)
      }
      if (po && po.key) {
        pos[po.key] = po
      }
    })
  }

  return pos
}

_perms.prototype.mergePermkey = function (permkey, merge) {
  if (!merge || !zzb.types.isNonEmptyString(merge)) {
    return permkey
  }

  if (!permkey || !zzb.types.isNonEmptyString(permkey)) {
    return merge
  }

  var split = null
  var po = {}
  var mo = {}

  if (permkey.indexOf(':') <= 0) {
    po.key = permkey.trim()
    po.perm = ''
  } else {
    split = permkey.split(':')
    po.key = split[0].trim()
    po.perm = split[1].trim().toUpperCase()
  }

  if (merge.indexOf(':') <= 0) {
    mo.key = merge.trim().toUpperCase()
    mo.perm = ''
  } else {
    split = merge.split(':')
    mo.key = split[0].trim()
    mo.perm = split[1].trim().toUpperCase()
  }

  if (po.key !== mo.key || po.perm === mo.perm || mo.perm.length === 0) {
    return permkey
  } else if (po.key.length === 0) {
    return merge
  }

  for (var mm = 0; mm < mo.perm.length; mm++) {
    if (po.perm.indexOf(mo.perm[mm]) < 0) {
      po.perm += mo.perm[mm]
    }
  }

  return po.key + ':' + po.perm
}

_perms.prototype.getPermObject = function (permkey, available, merge) {
  var po = { key: null, perm: null, attr: {}, toPermkey: function () { return this.key + ':' + this.perm } }

  if (merge || zzb.types.isNonEmptyString(merge)) {
    permkey = this.mergePermkey(permkey, merge)
  }

  if (!permkey || !zzb.types.isNonEmptyString(permkey)) {
    po.attr = this.getPermAttributes()
    return po
  }

  if (permkey.indexOf(':') <= 0) {
    po.key = permkey
    po.perm = ''
    po.attr = this.getPermAttributes()
    return po
  }

  var split = permkey.split(':')
  po.key = split[0]
  po.perm = split[1]

  po.perm = po.perm.trim().toUpperCase()

  if (po.perm.length > 0) {
    // remove any permissions from the default that are not available
    if (available && zzb.types.isNonEmptyString(available)) {
      available = available.trim().toUpperCase()
      for (var mm = po.perm.length - 1; mm >= 0; mm--) {
        if (available.indexOf(po.perm[mm]) < 0) {
          po.perm = po.perm.replace(po.perm[mm], '')
        }
      }
    }
  }

  po.attr = this.getPermAttributes(po.toPermkey(), available)

  return po
}

var reCRUDX = new RegExp('^[CRUDX]*$')

_perms.prototype.getPermAttributes = function (permkey) {
  // CRUDX
  var attr = { canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExecute: false }

  if (!permkey || !zzb.types.isNonEmptyString(permkey)) {
    return attr
  }

  if (permkey.indexOf(':') >= 0) {
    permkey = permkey.split(':')[1]
  }

  permkey = permkey.trim().toUpperCase()

  if (permkey.length === 0) {
    return attr
  }

  if (!reCRUDX.test(permkey)) {
    return attr
  }

  attr.canRead = permkey.indexOf('C') >= 0
  attr.canCreate = permkey.indexOf('R') >= 0
  attr.canUpdate = permkey.indexOf('U') >= 0
  attr.canDelete = permkey.indexOf('D') >= 0
  attr.canExecute = permkey.indexOf('X') >= 0

  return attr
}

_perms.prototype.hasMatch = function (permkey, target) {
  if (!permkey || !target) {
    return false
  }

  var po = permkey
  if (zzb.types.isNonEmptyString(permkey)) {
    po = this.getPermObject(permkey)
  }

  if (!zzb.types.isObject(po) || !po.key || !po.perm || po.perm.length === 0) {
    return false
  }

  var tp = null
  if (zzb.types.isNonEmptyString(target)) {
    tp = this.getPermObject(target)
  } else if (Array.isArray(target)) {
    var self = this
    _.each(target, function (item) {
      if (zzb.types.isNonEmptyString(item)) {
        item = self.getPermObject(item)
      }
      if (item.key === po.key) {
        tp = item
        return false
      }
    })
  } else {
    if (!zzb.types.isObject(target)) {
      return false
    }
    if (target.key) {
      tp = target
    } else {
      if (!target[po.key]) {
        return false
      } else {
        if (zzb.types.isNonEmptyString(target[po.key])) {
          tp = this.getPermObject(po.key + ':' + target[po.key])
        } else {
          tp = target[po.key]
        }
      }
    }
  }

  if (!tp || !tp.key || !tp.perm || !tp.perm.length === 0) {
    return false
  }

  for (var ii = 0; ii < tp.perm.length; ii++) {
    if (po.perm.indexOf(tp.perm[ii]) >= 0) {
      return true
    }
  }

  return false
}

exports.perms = _perms

},{}],5:[function(require,module,exports){
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
    return { _system: [errs] }
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
  options = _.merge({ type: 'error', message: null, field: '_system', stack: null, isErr: true, title: null }, options)

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
var createError = function (options1, options2) {
  if (!options1) {
    return mergeErrorDefaults()
  }
  if (zzb.types.isNonEmptyString(options1)) {
    return mergeErrorDefaults(_.merge({ message: options1 }, options2))
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

_rob.prototype.toListErrs = function (errs) {
  var arrFields = []
  var arrSystem = []

  var arrSystemMessages = []
  var arrFieldMessages = []

  if (errs && Array.isArray(errs) && errs.length > 0) {
    _.each(errs, function (err) {
      if (err.isErr === true) {
        if (err.system === '_system') {
          arrSystem.push(err)
        } else if (zzb.types.isNonEmptyString(err.field)) {
          if (err.field === '_system') {
            arrSystem.push(err)
          } else {
            arrFields.push(err)
          }
        } else {
          arrSystem.push(err)
        }
      } else {
        if (err.system === '_system') {
          arrSystemMessages.push(err)
        } else if (zzb.types.isNonEmptyString(err.field)) {
          if (err.field === '_system') {
            arrSystemMessages.push(err)
          } else {
            arrFieldMessages.push(err)
          }
        } else {
          arrSystemMessages.push(err)
        }
      }
    })
  }

  return {
    system: arrSystem,
    fields: arrFields,

    systemMessages: arrSystemMessages,
    fieldMessages: arrFieldMessages,

    hasSystemErrors: function () {
      return (this.system && this.system.length > 0)
    },
    hasFieldErrors: function () {
      return (this.fields && this.fields.length > 0)
    },
    combinedErrors: function () {
      return this.system.concat(this.fields)
    },
    hasErrors: function () {
      return (this.hasSystemErrors() || this.hasFieldErrors())
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
    hasMessages: function () {
      return (this.hasSystemMessages() || this.hasFieldMessages())
    }
  }
}

_rob.prototype.renderListErrs = function (options) {
  options = _.merge({ errs: [], format: 'text', defaultTitle: '', template: null }, options)
  var arr = []
  if (zzb.types.isArrayHasRecords(options.errs)) {
    _.each(options.errs, function (err) {
      var title = ''
      if (zzb.types.isNonEmptyString(options.defaultTitle)) {
        title = options.defaultTitle
      } else if (zzb.types.isNonEmptyString(err.field)) {
        title = err.field
      }

      if (options.template) {
        arr.push(zzb.strings.format(options.template, title, err.message))
      } else {
        if (options.format === 'html' || options.format === 'html-list') {
          arr.push(zzb.strings.format('<li class="zzb-rob-list-error-item">{0}</li>', err.message))
        } else if (options.format === 'html-list-label') {
          arr.push(zzb.strings.format('<li class="zzb-rob-list-error-item"><span>{0}:</span> {1}</li>', title, err.message))
        } else if (options.format === 'label') {
          arr.push(zzb.strings.format('{0}: {1}', title, err.message))
        } else if (options.format === 'text-punctuated') {
          arr.push(zzb.strings.toFirstCapitalEndPeriod(err.message) + ' ')
        } else { // text
          arr.push(zzb.strings.format(err.message))
        }
      }
    })
  }

  return arr.join('')
}

exports.rob = _rob

},{}],6:[function(require,module,exports){
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
  options = _.merge({ path: window.location.path, role: null })

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
  tmpStatus = { user: { isLoggedIn: false, username: null }, page: { path: window.location.pathname } }
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

},{}],7:[function(require,module,exports){
// client or server
var _ = window._

// ---------------------------------------------------
// strings
// ---------------------------------------------------

var _strings = function () {}

function ValueError (message) {
  var err = new Error(message)
  err.name = 'ValueError'
  return err
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
      function (match, literal, _key, xf) {
        if (literal != null) {
          return literal
        }
        var key = _key
        if (key.length > 0) {
          if (state === 'IMPLICIT') {
            throw ValueError('cannot switch from ' +
              'implicit to explicit numbering')
          }
          state = 'EXPLICIT'
        } else {
          if (state === 'EXPLICIT') {
            throw ValueError('cannot switch from ' +
              'explicit to implicit numbering')
          }
          state = 'IMPLICIT'
          key = String(idx)
          idx += 1
        }

        //  1.  Split the key into a lookup path.
        //  2.  If the first path component is not an index, prepend '0'.
        //  3.  Reduce the lookup path to a single result. If the lookup
        //      succeeds the result is a singleton array containing the
        //      value at the lookup path; otherwise the result is [].
        //  4.  Unwrap the result by reducing with '' as the default value.
        var path = key.split('.')
        var value = (/^\d+$/.test(path[0]) ? path : ['0'].concat(path))
          .reduce(function (maybe, key) {
            return maybe.reduce(function (_, x) {
              return x != null && key in Object(x) ? [typeof x[key] === 'function' ? x[key]() : x[key]] : []
            }, [])
          }, [args])
          .reduce(function (_, x) { return x }, '')

        if (xf == null) {
          return value
        } else if (Object.prototype.hasOwnProperty.call(transformers, xf)) {
          return transformers[xf](value)
        } else {
          throw ValueError('no transformer named "' + xf + '"')
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
  options = _.merge({ forcePlural: false, suffix: null }, options)

  if ((number === 1 || number === -1) && !options.forcePlural) {
    return word
  }

  if (options.suffix) {
    return word + options.suffix
  } else {
    return word + 's'
  }
}

_strings.prototype.toFirstCapitalEndPeriod = function (target) {
  if (zzb.types.isNonEmptyString(target)) {
    target = _.trim(target)
    target = _.capitalize(target)
    if (!_.endsWith(target, '.')) {
      target += '.'
    }
  }
  return target
}

var sizeUnitsFormatNameSingle = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
var sizeUnitsFormatNameDouble = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
var sizeUnitsFormatNameFull = ['Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte', 'Petabyte', 'Exabyte', 'Zettabyte', 'Yottabyte']
var sizeUnitsFormatNameEIC = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

// From https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/10420404
//      https://ux.stackexchange.com/questions/13815/files-size-units-kib-vs-kb-vs-kb
// We standardized the above, somewhat, with https://github.com/cloudfoundry/bytefmt
// Also only divisions are with 1024 and NOT 1000
_strings.prototype.sizeToHumanReadable = function (bytes, unitsFormat, noSizeUnitSeparation, dp) {
  if (!zzb.types.isNonEmptyString(unitsFormat)) {
    unitsFormat = 'single'
  }
  var unitSeperateSpace = ' '
  if (noSizeUnitSeparation === true) {
    unitSeperateSpace = ''
  }
  if (!dp) {
    dp = 1
  }

  var thresh = 1024 // si ? 1000 : 1024

  var units
  var unitsBytes = 'B'
  switch (unitsFormat.toLowerCase()) {
    case 'full':
      units = sizeUnitsFormatNameFull
      unitsBytes = 'Bytes'
      break
    case 'double':
      units = sizeUnitsFormatNameDouble
      break
    case 'eic':
      units = sizeUnitsFormatNameEIC
      break
    default: // single
      units = sizeUnitsFormatNameSingle
      break
  }

  if (Math.abs(bytes) < thresh) {
    return bytes + unitSeperateSpace + unitsBytes
  }

  // var units = si
  //   ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  //   : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  var u = -1
  // var r = 10 ** dp
  var r = Math.pow(dp, 10)

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  var valFixed = bytes.toFixed(dp) + ''
  valFixed = _.trimEnd(valFixed, '.00')
  valFixed = _.trimEnd(valFixed, '.0')

  return valFixed + unitSeperateSpace + units[u]
}

// https://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
_strings.prototype.millisecondsTimeToHumanReadable = function (milliseconds) {
  var temp = milliseconds / 1000
  var years = Math.floor(temp / 31536000)
  var days = Math.floor((temp %= 31536000) / 86400)
  var hours = Math.floor((temp %= 86400) / 3600)
  var minutes = Math.floor((temp %= 3600) / 60)
  var seconds = temp % 60

  if (days || hours || seconds || minutes) {
    return (years ? years + 'y ' : '') +
      (days ? days + 'd ' : '') +
      (hours ? hours + 'h ' : '') +
      (minutes ? minutes + 'm ' : '') +
      Number.parseFloat(seconds).toFixed(2) + 's'
  }

  return '< 1s'
}

exports.strings = _strings

},{}],8:[function(require,module,exports){
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

_types.prototype.isBoolean = function (b) {
  return (typeof b === 'boolean')
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

},{}],9:[function(require,module,exports){
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
  options = _.merge({ id: zzb.uuid.newV4(), classPanelGroup: '', innerHtml: '' }, options)
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
  options = _.merge({ id: zzb.uuid.newV4(), classPanelBody: '', innerHtml: '' }, options)
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
  options = _.merge({
    id: zzb.uuid.newV4(),
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
  options = _.merge({
    id: zzb.uuid.newV4(),
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
  options = _.merge({
    id: zzb.uuid.newV4(),
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
      child = this.nodeConstructor(this, data,
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

},{}],12:[function(require,module,exports){
if (typeof jQuery === 'undefined') {
  throw new Error('zazzy-browser\'s JavaScript requires jQuery. jQuery must be included before zazzy-browser\'s JavaScript.')
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
  // _perms (Permission Keys)
  // ---------------------------------------------------

  var _perms = require('./perms.js').perms

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
  // _perms
  _zzb.prototype.perms = new _perms() // {types: _types})
  // rob (==return object)
  _zzb.prototype.rob = new _rob() // {types: _types})
  // ajax helpers with promises
  _zzb.prototype.ajax = new _ajax() // {rob: _rob, types: _types})
  // gets status info (eg user, page, and role info)
  _zzb.prototype.status = new _status() // {types: _types, ajax: _ajax})

  return new _zzb()
}))

},{"./ajax.js":1,"./dialogs.js":2,"./forms.js":3,"./perms.js":4,"./rob.js":5,"./status.js":6,"./strings.js":7,"./types.js":8,"./uib.js":9,"./uuid.js":10,"./zzNode.js":11}]},{},[12]);
