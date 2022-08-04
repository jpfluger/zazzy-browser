//! zzb.js v2.4.1 (https://github.com/jpfluger/zazzy-browser)
//! MIT License; Copyright 2017-2021 Jaret Pfluger
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 546:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// _ajax
// ---------------------------------------------------

function _ajax () {}

_ajax.prototype.ajax = function (options) {
  return this.request(options, options.callback)
}

_ajax.prototype.request = function(options, callback) {
  if (!zzb.types.isFunction(callback)) {
    callback = function(){} // no-op
  }
  options = zzb.types.merge({url: null, method:'GET', body: null, expectType:'text', headers:{},
                RAWRETURN: false, SKIPREDIRECT: false, SKIPFLASH: false, SHOWCATCHMESSAGE: false, NOCATCHLOG: false, NOCATCHFLASH: false, CATCHFLASHMESSAGE: '' }, options)
  if (!zzb.types.isStringNotEmpty(options.url)) {
    return callback(null, new Error('No url defined to fetch request.'))
  }
  if (!zzb.types.isStringNotEmpty(options.method)) {
    return callback(null, new Error('No url method defined to fetch request.'))
  }
  fetch(options.url, {
    method: options.method,
    body: options.body,
    headers: options.headers
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Remote service returned unexpected status ' + response.status + '.')
      } else {
        switch (options.expectType) {
          case 'json':
            return response.json()
          case 'text':
            return response.text()
          case 'blob':
            return response.blob()
          default:
            throw new Error('Unknown content received from remote service.')
        }
      }
    })
    .then(function (data) {

      var objReturn = {request: options, data: data}

      // allow an escape
      if (objReturn.request.RAWRETURN === true) {
        return callback(objReturn, null)
      }

      var noFinalResolve = false
      var rob = zzb.rob.newROB()

      if (objReturn.request.expectType !== 'json') {
        // html or some other data type was returned
        rob.recs = [objReturn.data]
      } else {
        // handle redirect
        if (objReturn.request.SKIPREDIRECT !== true) {
          if (zzb.types.isStringNotEmpty(data.redirect)) {
            if (zzb.types.isFunction(objReturn.request.onRedirect)) {
              objReturn.request.onRedirect(data, function (skipRedirect) {
                if (!skipRedirect) {
                  window.location.href = data.redirect
                }
              })
              return
            } else if (zzb.types.isStringNotEmpty(data.message)) {
              zzb.dialogs.showMessage({
                type: zzb.types.isNonEmptyString(data.messageType) ? data.messageType : null,
                classDialog: 'zzb-dialog-flash-message zzb-dialog-flash-redirect' + zzb.strings.mergeElseEmpty(' zzb-dialog-flash-status-{0}', data.messageType),
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

        // Obsolete? Depends on the paginate paradigm to be useful.
        if (data.paginate) {
          rob.paginate = data.paginate
        }

        rob.errs = data.errs
        rob.recs = data.recs
        rob.columns = data.columns

        rob.listErrs = zzb.rob.toList(rob.errs)

        if (options.SKIPFLASH !== true) {
          if (zzb.types.isStringNotEmpty(data.message)) {
            noFinalResolve = true
            zzb.dialogs.showMessage({
              type: zzb.types.isNonEmptyString(data.messageType) ? data.messageType : null,
              classDialog: 'zzb-dialog-flash-message' + zzb.strings.mergeElseEmpty(' zzb-dialog-flash-status-{0}', data.messageType, rob.hasErrors() ? 'error' : 'okay'),
              dataBackdrop: 'static',
              body: data.message,
              onHide: function (ev) {
                objReturn.rob = rob
                callback(objReturn, null);
              }
            })
          }
        }

        // finish processing
        if (zzb.types.isFunction(objReturn.request.onFinish)) {
          noFinalResolve = true
          objReturn.request.onFinish(rob, function (noResolve) {
            if (noResolve === true) {
              return
            }
            objReturn.rob = rob
            callback(objReturn, null);
          })
        }
      }

      if (noFinalResolve === true) {
        return
      }

      objReturn.rob = rob

      try {
        callback(objReturn, null);
      } catch (err) {
        // Unexpected handler error. Without it, ugliness javascript err message could be displayed.
        // The admin needs to ask the user to open the debug console to look at the log.
        console.log(AjaxMessage.APPEND_FAILED_HANDLER_UNEXPECTED, 'error:', err)
        throw new Error(AjaxMessage.APPEND_FAILED_HANDLER_UNEXPECTED)
      }
    })
    .catch(function (err) {

      let errMessage = ''
      if (err && zzb.types.isStringNotEmpty(err.message)) {
        if (options.NOCATCHLOG !== true) {
          // Prevent double-logging.
          if (AjaxMessage.APPEND_FAILED_HANDLER_UNEXPECTED !== err.message) {
            console.log(err.message)
          }
        }
        if (options.SHOWCATCHMESSAGE !== true) {
          errMessage = err.message
        }
      }

      // UI Dialog to display the error
      if (options.NOCATCHFLASH !== true) {
        let divErr = ''
        if (zzb.types.isStringNotEmpty(errMessage)) {
          divErr = zzb.strings.format(' <span class="zzb-dialog-error-catch">{0}</span>', errMessage)
        }
        if (zzb.types.isStringNotEmpty(options.CATCHFLASHMESSAGE)) {
          zzb.ajax.showMessageFailedAction({ message: options.CATCHFLASHMESSAGE + divErr })
        } else {
          zzb.ajax.showMessageFailedAction({ message: AjaxMessage.MSG_FAILED_REQUEST_UNEXPECTED + divErr })
        }
      }

      callback(null, new Error(errMessage))
    })
}

_ajax.prototype.get = function(options, callback) {
  options.method = 'GET'
  zzb.ajax.request(options, callback)
}

_ajax.prototype.post = function (options, callback) {
  options.method = 'POST'
  zzb.ajax.request(options, callback)
}

_ajax.prototype.getBLOB = function (options, callback) {
  options.method = 'GET'
  options.expectType = 'blob'
  zzb.ajax.request(options, callback)
}

_ajax.prototype.getTEXT = function (options, callback) {
  options.method = 'GET'
  options.expectType = 'text'
  zzb.ajax.request(options, callback)
}

_ajax.prototype.getJSON = function (options, callback) {
  options.method = 'GET'
  options.expectType = 'json'
  zzb.ajax.request(options, callback)
}

// Sometimes a request is made for a html snippet but json is returned. The function will error if the dataType is
// specified but in the wrong format. To have jquery "guess", then override expectType in this way: {expectType: 'text'}
_ajax.prototype.postJSON = function (options, callback) {
  options.method = 'POST'
  if (!zzb.types.isStringNotEmpty(options.expectType)) {
    options.expectType = 'json'
  }
  options.headers = {
    'Content-Type': 'application/json'
  }
  if (!zzb.types.isStringNotEmpty(options.body)) {
    options.body = JSON.stringify(options.body)
  } else {
    options.body = '{}'
  }
  zzb.ajax.request(options, callback)
}

var AjaxMessage = function (options) {}

// Default message is AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED
// If options.SHOWCATCHMESSAGE is true, then the following is appended to it: + '<div class="zzb-dialog-error-catch">Error: ' + caught err.message + '</div>'
// These can be overwritten with your own defaults.
AjaxMessage.MSG_FAILED_REQUEST_UNEXPECTED = 'Communications with remote service failed unexpectedly.'
AjaxMessage.APPEND_FAILED_HANDLER_UNEXPECTED = 'Report this to the remote service administrator.'

_ajax.prototype.showMessageFailedAction = function (options) {
  options = zzb.types.merge({ err: null, number: null, message: AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED }, options)
  if (zzb.types.isNumber(options.number)) {
    options.number = ' (' + options.number + ')'
  } else {
    options.number = ''
  }
  if (options.err) {
    console.log(options.err)
  }
  zzb.dialogs.showMessage({
    classDialog: 'zzb-dialog-flash-message zzb-flash-invalid', // zzb-flash-valid
    dataBackdrop: 'static',
    body: options.message + options.number
  })
}

exports.h = _ajax


/***/ }),

/***/ 772:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// BootstrapDialog
// Quick & Easy: https://getbootstrap.com/docs/5.1/components/modal
// Transition from jquery to vanilla-js: https://gist.github.com/joyrexus/7307312
// Non-bootstrap compatible: https://engineertodeveloper.com/create-a-modal-using-vanilla-javascript/
// ---------------------------------------------------

class ZazzyDialog {
  constructor(options) {

    this.defaultOptions = ZazzyDialog.getDialogDefaults(options)

    this.defaultOptions.onShow = typeof options.onShow === 'function' ? options.onShow : function () {}
    this.defaultOptions.onShown = typeof options.onShown === 'function' ? options.onShown : function () {}
    this.defaultOptions.onHide = typeof options.onHide === 'function' ? options.onHide : function () {}
    this.defaultOptions.onHidden = typeof options.onHidden === 'function' ? options.onHidden : function () {}

    this.isBootstrap = (this.defaultOptions.forceNoBootstrap === true ? false : window.bootstrap != undefined)

    this.modal = null
    if (zzb.types.isStringNotEmpty(this.defaultOptions.id)) {
      this.modal = document.getElementById(this.defaultOptions.id)
    }

    if (!this.modal) {
      this.modal = this.createModal()
    }

    // Cleanup duplications
    this.defaultOptions.htmlDialog = ''
    this.defaultOptions.body = ''

    if (this.isBootstrap) {
      this.bsModal = new bootstrap.Modal(this.modal, {})
    } else {
      this.closeModal = this.modal.querySelectorAll('[data-bs-dismiss]');

      this.closeModal.forEach(item => {
        item.addEventListener("click", (e) => {
          this.close();
        });
      })
    }

    var self = this
    this.modal.addEventListener('show.bs.modal', function (ev) {
      if (self.defaultOptions.onShow && zzb.types.isFunction(self.defaultOptions.onShow)) {
        self.defaultOptions.onShow(ev)
      }
    })
    this.modal.addEventListener('shown.bs.modal', function (ev) {
      if (self.defaultOptions.hasAutoBackdrop) {
        let backdrop = self.modal.nextElementSibling
        if (backdrop && backdrop.classList.contains('modal-backdrop')) {
          self.modal.style.zIndex = '2055'
          backdrop.style.zIndex = '2050'
        }
      }
      if (self.defaultOptions.onShown && zzb.types.isFunction(self.defaultOptions.onShown)) {
        self.defaultOptions.onShown(ev)
      }
    })
    this.modal.addEventListener('hide.bs.modal', function (ev) {
      if (self.defaultOptions.onHide && zzb.types.isFunction(self.defaultOptions.onHide)) {
        self.defaultOptions.onHide(ev)
      }
    })
    this.modal.addEventListener('hidden.bs.modal', function (ev) {
      if (self.defaultOptions.onHidden && zzb.types.isFunction(self.defaultOptions.onHidden)) {
        self.defaultOptions.onHidden(ev)
      }
      if (self.defaultOptions.doAutoDestroy) {
        if (self.bsModal) {
          self.bsModal.dispose() // removes stored data on DOM
          self.modal.remove() // removes from DOM completely
        }
      }
    })

    this.target = document.getElementById(options.target)
    if (this.target) {
      this.target.addEventListener("click", (e) => {
        this.open()
      })
    }
  }

  open() {
    if (this.bsModal) {
      this.bsModal.show();
    } else {
      this.modal.classList.add('show-modal');
      setTimeout(() => {
        this.animateIn();
      }, 10);
    }
  }
  close() {
    if (this.bsModal) {
      this.bsModal.hide()
    } else {
      this.animateOut();
      setTimeout(() => {
        this.modal.classList.remove('show-modal');
      }, 250);
    }
  }
  animateIn() {
    this.modal.classList.add('animate-modal');
  }
  animateOut() {
    this.modal.classList.remove('animate-modal');
  }
  destroy() {
    if (this.bsModal) {
      this.bsModal.hide()
      if (!this.defaultOptions.doAutoDestroy) {
        this.bsModal.dispose() // removes stored data on DOM
        this.modal.remove() // removes from DOM completely
      }
    }
  }

  static BUTTON_CLOSE = 'button-close'
  static BUTTON_OK = 'button-ok'
  static BUTTON_YES = 'button-yes'
  static BUTTON_NO = 'button-no'
  static BUTTON_CANCEL = 'button-cancel'

  // standard is "btn-TYPE"; outline effect is "btn-outline-TYPE"
  static TYPE_NONE = 'none'
  static TYPE_PRIMARY = 'primary'
  static TYPE_SECONDARY = 'secondary'
  static TYPE_SUCCESS = 'success'
  static TYPE_DANGER = 'danger'
  static TYPE_WARNING = 'warning'
  static TYPE_INFO = 'info'
  static TYPE_LIGHT = 'light'
  static TYPE_DARK = 'dark'
  static TYPE_LINK = 'link'

  static getDialogDefaults(options) {
    var dialog = {
      // contains the full html, including id, title, body and buttons already formatted
      htmlDialog: '',
      // The remainder builds the htmlDialog
      id: zzb.uuid.newV4(),
      type: ZazzyDialog.TYPE_NONE,
      classDialog: '',
      classBackdrop: '',
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
      forceNoBootstrap: false,
      hasAutoBackdrop: false
      // underlay: {
      //   isOn: false,
      //   id: null,
      //   className: '',
      //   bg: '#838383',
      //   opacity: 0.5
      // }
    }
    return (zzb.types.isObject(options) ? zzb.types.merge(dialog, options) : dialog)
  }

  static getButtonDefaults(options) {
    var button = {
      id: null,
      type: ZazzyDialog.TYPE_NONE,
      label: '',
      className: '',
      action: null,
      isDismiss: false,
      isOutline: false,
      ztrigger: null // Feature for zactions that links the button with an element, such as those inside body-content (eg hidden html buttons)
    }
    return (zzb.types.isObject(options) ? zzb.types.merge(button, options) : button)
  }

  static getButtonPreset(preset, order, max) {
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

    if (button && button.label) {
      button.ztrigger = button.label.toLowerCase()
    }

    return button
  }

  static validateType(type) {
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

  static isTypeNone(type) {
    return ZazzyDialog.validateType(type) === ZazzyDialog.TYPE_NONE
  }

  getId() {
    if (!(zzb.types.isStringNotEmpty(this.defaultOptions.id))) {
      this.defaultOptions.id = zzb.uuid.newV4()
    }
    return this.defaultOptions.id
  }

  getClassBackdrop() {
    if (!(zzb.types.isStringNotEmpty(this.defaultOptions.classBackdrop))) {
      this.defaultOptions.classBackdrop = ''
    }
    return this.defaultOptions.classBackdrop
  }

  getClassDialog() {
    if (!(zzb.types.isStringNotEmpty(this.defaultOptions.classDialog))) {
      this.defaultOptions.classDialog = ''
    }
    return this.defaultOptions.classDialog
  }

  getTitle() {
    if (!(zzb.types.isStringNotEmpty(this.defaultOptions.title))) {
      this.defaultOptions.title = ''
    }
    return this.defaultOptions.title
  }

  getBody() {
    if (!(zzb.types.isStringNotEmpty(this.defaultOptions.body))) {
      this.defaultOptions.body = ''
    }
    return this.defaultOptions.body
  }

  createModal() {

    // Add htmlDialog only when htmlDialog is not empty
    if (this.defaultOptions.htmlDialog && !zzb.types.isStringNotEmpty(this.defaultOptions.htmlDialog)) {
      document.body.insertAdjacentHTML('beforeend', htmlModal)
      return document.getElementById(this.getId())
    }

    var options = zzb.types.merge({
      id: this.getId(),
      arialabel: 'arialabel' + this.getId(),
      classBackdrop: this.getClassBackdrop(),
      classDialog: this.getClassDialog(),
      title: this.getTitle(),
      body: this.getBody(),
      classVerticalCenter: (this.defaultOptions.doVerticalCenter ? ' modal-dialog-centered' : ''),
      classModalHeader: '',
      noHeaderCloseButton: false,
      noHeaderCloseButtonButton: '',
      dataKeyboard: null,
    }, this.defaultOptions)

    options.classFade = 'fade'
    if (zzb.types.isBoolean(options.noFade) && options.noFade === true) {
      options.classFade = ''
    }

    if (!ZazzyDialog.isTypeNone(options.type)) {
      options.classModalHeader += ' alert-' + options.type
    }

    if (zzb.types.isNonEmptyString(options.classDialog)) {
      options.classDialog = ' ' + options.classDialog
    }

    if (zzb.types.isNonEmptyString(options.classBackdrop)) {
      options.classBackdrop = ' ' + options.classBackdrop
    }

    if (options.hasAutoBackdrop === true && !zzb.types.isStringNotEmpty(options.dataBackdrop)) {
      options.dataBackdrop = 'true'
    }
    if (zzb.types.isStringNotEmpty(options.dataBackdrop)) {
      options.hasAutoBackdrop = true
      options.extraAttributes += ' data-bs-backdrop="' + options.dataBackdrop + '"'
    }

    if (zzb.types.isBoolean(options.dataKeyboard)) {
      options.extraAttributes += ' data-bs-keyboard="' + options.dataKeyboard + '"'
    }

    if (options.noHeaderCloseButton !== true) {
      options.noHeaderCloseButtonButton = '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
      //options.noHeaderCloseButtonButton = '<button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
    }

    var template =
      '<div class="modal {classFade} modal-fullscreen{classBackdrop}" {extraAttributes} id="{id}" tabindex="-1" role="dialog" aria-labelledby="{arialabel}" aria-hidden="true">' +
        '<div class="modal-dialog{classVerticalCenter}{classDialog}" role="document">' +
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

    // Insert the template prior to adding events
    document.body.insertAdjacentHTML('beforeend', zzb.strings.format(template, options))
    var $modal = document.getElementById(this.getId())

    if (!$modal) {
      throw new Error('unexpected that modal has not been created')
    }

    var self = this

    if (!Array.isArray(options.buttons)) {
      options.buttons = []
    }

    var maxButtons = options.buttons.length

    options.buttons.forEach(function (button, ii) {
      // If button is a string, then it has a predefined 'preset' value that needs assignment.
      if (zzb.types.isStringNotEmpty(button)) {
        button = ZazzyDialog.getButtonPreset(button, ii, maxButtons)
      }

      if (!(zzb.types.isObject(button))) {
        return // continue
      }

      if (!(zzb.types.isStringNotEmpty(button.id))) {
        button.id = 'button-' + ii + '-' + self.getId()
      }

      if (!ZazzyDialog.isTypeNone(button.type)) {
        if (button.isOutline) {
          button.className += ' btn-outline-' + button.type
        } else {
          button.className += ' btn-' + button.type
        }
      }

      if (button.isDismiss) {
        if (!zzb.types.isFunction(button.action)) {
          button.action = function (dialog, ev) {
            dialog.close()
          }
        }
        zzb.dom.setAttribute($modal.querySelector('.modal-header button[data-bs-dismiss]'), 'aria-label', button.label)
      }

      if (zzb.types.isStringNotEmpty(button.ztrigger)) {
        button.ztrigger = zzb.strings.format(' ztrigger="{0}"', button.ztrigger)
      }

      if (zzb.dom.hasElement($modal.querySelector('.modal-footer'))) {
        $modal.querySelector('.modal-footer')
          .insertAdjacentHTML('beforeend', zzb.strings.format('<button id="{id}" type="button" class="btn {className}"{ztrigger}>{label}</button>', button))

        document.getElementById(button.id).addEventListener('click', function(ev) {
          if (button && zzb.types.isFunction(button.action)) {
            return button.action.call(document.getElementById(button.id), self, ev)
          }
        })
      }
    })

    this.defaultOptions = options
    return document.getElementById(this.getId())
  }
}

// ---------------------------------------------------
// _dialogs
// ---------------------------------------------------

var _dialogs = function () {
  this.modals = {}
}

_dialogs.prototype.ZazzyDialog = ZazzyDialog

_dialogs.prototype.modal = function (options) {
  if (options && options.id && zzb.types.isStringNotEmpty(options.id)) {
    if (this.modals[options.id]) {
      return this.modals[options.id]
    }
  }
  var myModal = new ZazzyDialog(options)
  if (myModal && zzb.types.isStringNotEmpty(myModal.getId())) {
    return myModal
  }
  throw new Error('Failed to create dialog')
}

_dialogs.prototype.showMessage = function (options) {
  var dialog = zzb.dialogs.modal(zzb.types.merge({
    type: ZazzyDialog.TYPE_NONE,
    buttons: [ZazzyDialog.BUTTON_OK]
  }, options))
  if (options.noAutoOpen === true) {
    return dialog
  }
  dialog.open()
}

_dialogs.prototype.showMessageChoice = function (options) {
  var dialog = zzb.dialogs.modal(zzb.types.merge({
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
  if (options.noAutoOpen === true) {
    return dialog
  }
  dialog.open()
}

_dialogs.prototype.handleError = function (options) {
  var template = '<div class="zzb-dialog-errors">{errors}</div>' +
    '<div class="zzb-dialog-message">{message}</div>'

  // this.dialogs.handleError({log: 'failed to retrieve login dialog form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the login form. Please check your connection settings and try again.'})
  options = zzb.types.merge({
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

  if (!zzb.types.isStringNotEmpty(options.errors)) {
    if (zzb.types.isArray(options.errs)) {
      var arrHtml = []

      options.errs.forEach(function (err, index) {
        if (err.message && zzb.types.isStringNotEmpty(err.message)) {
          arrHtml.push(zzb.strings.format('<div class="zzb-dialog-error-item">{0}</div>', err.message))
        }
      })

      options.errors = arrHtml.join('\n')
    }
  }

  options.body = zzb.strings.format(options.body, options)
  this.showMessage(options)
}

exports.y = _dialogs


/***/ }),

/***/ 171:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// types
// ---------------------------------------------------

function _dom () {}

_dom.prototype.hasElement = function ($elem) {
  return ($elem)
}

_dom.prototype.setAttribute = function ($elem, key, value) {
  // $modal.querySelector('.modal-header button[data-bs-dismiss]').setAttribute('aria-label', button.label)
  if ($elem) {
    if (zzb.types.isObject($elem)) {
      $elem.setAttribute(key, value)
    } else if (zzb.types.isArray($elem)) {
      $elem.forEach(function($e) {
        $e.setAttribute(key, value)
      })
    }
  }
}

_dom.prototype.getAttributeElse = function ($elem, name, elseValue) {
  if (elseValue === undefined || elseValue === null) {
    elseValue = null
  }
  if (!$elem) {
    return elseValue
  }
  let value = $elem.getAttribute(name)
  if (zzb.types.isNonEmptyString(value)) {
    return value
  }
  return elseValue
}

_dom.prototype.getAttributes = function ($elem, regex, camelCaseStrip) {
  if (!$elem || !regex) {
    return {}
  }
  if (!zzb.types.isNumber(camelCaseStrip)) {
    camelCaseStrip = -1
  }
  let data = {};
  [].forEach.call($elem.attributes, function(attr) {
    if (regex.test(attr.name)) {
      if (camelCaseStrip <= 0) {
        data[attr.name] = attr.value
      } else {
        // Creates camel case of the attrib, stripping off the "data-", which is the first 5 characters.
        // "data-method" transforms to "method"
        // "data-prop-sub" transforms to "propSub"
        let camelCaseName = attr.name.substr(camelCaseStrip).replace(/-(.)/g, function ($0, $1) {
          return $1.toUpperCase()
        })
        data[camelCaseName] = attr.value
      }
    }
  })
  return data
}

exports.v = _dom


/***/ }),

/***/ 154:
/***/ ((__unused_webpack_module, exports) => {

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
    permkeys.forEach(function (permkey) {
      var po = self.getPermObject(permkey)
      if (po.key) {
        pos[po.key] = po
      }
    })
  } else if (zzb.types.isObject(permkeys)) {
    for (const key in permkeys) {
      var perm = permkeys[key]
      // _.forOwn(permkeys, function (perm, key) {
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
    }
  }

  return pos
}

_perms.prototype.mergePermkey = function (permkey, merge) {
  if (!merge || !zzb.types.isStringNotEmpty(merge)) {
    return permkey
  }

  if (!permkey || !zzb.types.isStringNotEmpty(permkey)) {
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

  if (merge || zzb.types.isStringNotEmpty(merge)) {
    permkey = this.mergePermkey(permkey, merge)
  }

  if (!permkey || !zzb.types.isStringNotEmpty(permkey)) {
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
    if (available && zzb.types.isStringNotEmpty(available)) {
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

  if (!permkey || !zzb.types.isStringNotEmpty(permkey)) {
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
  if (zzb.types.isStringNotEmpty(permkey)) {
    po = this.getPermObject(permkey)
  }

  if (!zzb.types.isObject(po) || !po.key || !po.perm || po.perm.length === 0) {
    return false
  }

  var tp = null
  if (zzb.types.isStringNotEmpty(target)) {
    tp = this.getPermObject(target)
  } else if (Array.isArray(target)) {
    var self = this
    target.forEach(function (item) {
      if (zzb.types.isStringNotEmpty(item)) {
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
        if (zzb.types.isStringNotEmpty(target[po.key])) {
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

exports.Q = _perms


/***/ }),

/***/ 334:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// rob (Return Object)
// ---------------------------------------------------

var _rob = function () {}

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
      var hit = null
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
  var eo = {}
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
var createError = function (options1, options2) {
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
  var newErrs = null
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
  var arrFields = []
  var arrSystem = []

  var arrSystemMessages = []
  var arrFieldMessages = []

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

exports.S = _rob


/***/ }),

/***/ 313:
/***/ ((__unused_webpack_module, exports) => {

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
  options = zzb.types.merge({ forcePlural: false, suffix: null }, options)

  if ((number === 1 || number === -1) && !options.forcePlural) {
    return word
  }

  if (options.suffix) {
    return word + options.suffix
  } else {
    return word + 's'
  }
}

_strings.prototype.capitalize = function (target) {
  if (zzb.types.isStringNotEmpty(target)) {
    return target.charAt(0).toUpperCase() + string.slice(1);
  }
  return ''
}

_strings.prototype.toFirstCapitalEndPeriod = function (target) {
  if (zzb.types.isStringNotEmpty(target)) {
    target = target.trim()
    target = zzb.strings.capitalize(target)
    if (!target.endsWith(target, '.')) {
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
  if (!zzb.types.isStringNotEmpty(unitsFormat)) {
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
  valFixed = zzb.strings.trimSuffix(valFixed, ['.00', '.0'])

  return valFixed + unitSeperateSpace + units[u]
}

_strings.prototype.trimPrefix = function(target, prefix) {
  target = zzb.types.toString(target)
  var arr = []
  if (!zzb.types.isArray(prefix)) {
    arr.push(zzb.types.toString(prefix))
  } else {
    arr = prefix
  }
  for (var ii = 0; ii < arr.length; ii++) {
    if (target.startsWith(arr[ii])) {
      return target.slice(arr[ii])
    }
  }
  return target
}

_strings.prototype.trimSuffix = function(target, suffix) {
  target = zzb.types.toString(target)
  var arr = []
  if (!zzb.types.isArray(suffix)) {
    arr.push(zzb.types.toString(suffix))
  } else {
    arr = suffix
  }
  for (var ii = 0; ii < arr.length; ii++) {
    if (target.endsWith(arr[ii])) {
      return target.slice(0, arr[ii].length * -1)
    }
  }
  return target
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

_strings.prototype.toBool = function (target) {
  if (!zzb.types.isNonEmptyString(target)) {
    return (target)
  }
  switch(target.toLowerCase().trim()){
    case "true":
    case "yes":
    case "1":
      return true;

    case "false":
    case "no":
    case "0":
    case null:
      return false;

    default:
      return Boolean(target);
  }
}

_strings.prototype.parseIntOrZero = function (target, forceArray) {
  return zzb.strings.parseTypeElse(target, 'int', 0, forceArray ? true : false)
}

_strings.prototype.parseFloatOrZero = function (target, forceArray) {
  return zzb.strings.parseTypeElse(target, 'float', 0, forceArray ? true : false)
}

_strings.prototype.parseBoolOrFalse = function (target, forceArray) {
  return zzb.strings.parseTypeElse(target, 'bool', false, forceArray ? true : false)
}

_strings.prototype.parseTypeElse = function (target, type, elseif, forceArray) {
  let makeArray = (forceArray || zzb.types.isArray(target))
  if (target === undefined || target === null) {
    if (makeArray) {
      return []
    }
    return elseif
  } else if (!zzb.types.isArray(target)) {
    target = [target]
  }
  for (let ii = 0; ii < target.length; ii++) {
    if (target[ii] == undefined || target[ii] === null) {
      target[ii] = elseif
    } else {
    // if (zzb.types.isString(target[ii])) {
    //   let isEmpty = !zzb.types.isStringNotEmpty(target[ii])
      let convertNumber = false
      switch (type) {
        case 'int':
          parsed = parseInt(target[ii])
          convertNumber = true
          break
        case 'float':
          // parsed = isEmpty ? elseif : parseFloat(target[ii])
          parsed = parseFloat(target[ii])
          convertNumber = true
          break
        case 'bool':
          target[ii] = zzb.strings.toBool(target[ii])
          break
        case 'date':
        case 'date-iso':
          target[ii] = zzb.types.isNonEmptyString(target[ii]) ? target[ii] : elseif
          break
        default:
          if (!zzb.types.isString(target[ii])) {
            if (!zzb.types.isArray(target[ii]) && !zzb.types.isObject(target[ii])) {
              target[ii] += ''
            }
          }
          break
      }
      if (convertNumber) {
        target[ii] = isNaN(parsed) ? elseif : parsed
      }
    }
  }
  if (makeArray) {
    return target
  }
  return target[0]
}

_strings.prototype.mergeElseEmpty = function (mergeItem, mergeVar1, mergeVar2) {
  let mergeVar = mergeVar1
  if (!zzb.types.isStringNotEmpty(mergeVar)) {
    mergeVar = mergeVar2
    if (!zzb.types.isStringNotEmpty(mergeVar)) {
      return ''
    }
  }
  return zzb.strings.format(mergeItem, mergeVar)
}

exports.j = _strings


/***/ }),

/***/ 449:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// types
// ---------------------------------------------------

function _types () {}

_types.prototype.merge = function(defaultOption, newOptions) {
  return mergeArgs(defaultOption, newOptions)
}

const mergeArgs = function (...arguments) {
  // create a new object
  let target = {};

  // deep merge the object into the target object
  const merger = (obj) => {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // if the property is a nested object
          target[prop] = mergeArgs(target[prop], obj[prop]);
        } else {
          // for regular property
          target[prop] = obj[prop];
        }
      }
    }
  };

  // iterate through all objects and
  // deep merge them with target
  for (let i = 0; i < arguments.length; i++) {
    merger(arguments[i]);
  }

  return target;
};

_types.prototype.truncate = function(num, decimal) {
  return num.toString().substring(0, num.toString().indexOf('.')) + (num.toString().substr(num.toString().indexOf('.'), decimal + 1));
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

// baseToString is a lightweight version of the lodash function baseToString.
// https://github.com/lodash/lodash/blob/0843bd46ef805dd03c0c8d804630804f3ba0ca3c/lodash.js#L4230
_types.prototype.baseToString = function(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (zzb.types.isNumber(value)) {
    var result = (trimSuffix + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }
  return ''
}

_types.prototype.toString = function (s) {
  return s == null ? '' : zzb.types.baseToString(s);
}

_types.prototype.isArray = function (o) {
  return (o && (o !== undefined) && Object.prototype.toString.call(o) === '[object Array]')
}

_types.prototype.isArrayHasRecords = function (o) {
  return zzb.types.isArray(o) && o.length > 0
}

_types.prototype.isObject = function (o) {
  return (o && (typeof o === 'object'))
}

_types.prototype.isNumber = function (o) {
  return !isNaN(o - 0) && o !== null && o !== '' && o !== false
}

// Deprecated
// Will be remove in version 3.0.0
_types.prototype.isNonEmptyString = function (s) {
  return zzb.types.isStringNotEmpty(s)
}

_types.prototype.isStringNotEmpty = function (s) {
  return (s && (typeof s === 'string') && s.trim().length > 0)
}

// Deprecated
// Will be remove in version 3.0.0
_types.prototype.isEmptyString = function (s) {
  return zzb.types.isStringEmpty(s)
}

_types.prototype.isStringEmpty = function (s) {
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

exports.V = _types


/***/ }),

/***/ 781:
/***/ ((__unused_webpack_module, exports) => {

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
 * @see https://dirask.com/posts/JavaScript-UUID-function-in-Vanilla-JS-1X9kgD
 * @returns {String} the generated uuid
 */
_uuid.prototype.newV4 = function () {
  function generateNumber(limit) {
    var value = limit * Math.random();
    return value | 0;
  }

  function generateX() {
    var value = generateNumber(16);
    return value.toString(16);
  }

  function generateXes(count) {
    var result = '';
    for(var i = 0; i < count; ++i) {
      result += generateX();
    }
    return result;
  }

  function generateVariant() {
    var value = generateNumber(16);
    var variant =  (value & 0x3) | 0x8;
    return variant.toString(16);
  }

  return generateXes(8)
    + '-' + generateXes(4)
    + '-' + '4' + generateXes(3)
    + '-' + generateVariant() + generateXes(3)
    + '-' + generateXes(12)
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

exports.V = _uuid


/***/ }),

/***/ 936:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (typeof window !== 'undefined') {
    window.zzb = factory()
  } else if (typeof global !== 'undefined') {
    global.zzb = factory()
  } else if (true) {
    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
  } else {}
}(this, function () {

  // ---------------------------------------------------
  // types
  // ---------------------------------------------------

  var _types = (__webpack_require__(449)/* .types */ .V)

  // ---------------------------------------------------
  // uuid
  // ---------------------------------------------------

  var _uuid = (__webpack_require__(781)/* .uuid */ .V)

  // ---------------------------------------------------
  // strings
  // ---------------------------------------------------

  var _strings = (__webpack_require__(313)/* .strings */ .j)

  // ---------------------------------------------------
  // _dialogs
  // ---------------------------------------------------

  var _dom = (__webpack_require__(171)/* .dom */ .v)

  // ---------------------------------------------------
  // _dialogs
  // ---------------------------------------------------

  var _dialogs = (__webpack_require__(772)/* .dialogs */ .y)

  // ---------------------------------------------------
  // _perms (Permission Keys)
  // ---------------------------------------------------

  var _perms = (__webpack_require__(154)/* .perms */ .Q)

  // ---------------------------------------------------
  // _rob (Return Object)
  // ---------------------------------------------------

  var _rob = (__webpack_require__(334)/* .rob */ .S)

  // ---------------------------------------------------
  // _ajax
  // ---------------------------------------------------

  var _ajax = (__webpack_require__(546)/* .ajax */ .h)

  // ---------------------------------------------------
  // zzb
  // ---------------------------------------------------

  function _zzb () {}

  // data type operations: supplements lodash and moment
  _zzb.prototype.types = new _types()
  // uuid functions
  _zzb.prototype.uuid = new _uuid()
  // string functions
  _zzb.prototype.strings = new _strings()
  // dom helpers
  _zzb.prototype.dom = new _dom()
  // dialog functions
  _zzb.prototype.dialogs = new _dialogs()
  // _perms
  _zzb.prototype.perms = new _perms() // {types: _types})
  // rob (==return object)
  _zzb.prototype.rob = new _rob() // {types: _types})
  // ajax helpers with promises
  _zzb.prototype.ajax = new _ajax() // {rob: _rob, types: _types})

  return new _zzb()
}))


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(936);
/******/ 	
/******/ })()
;