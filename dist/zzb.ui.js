//! zzb.ui.js v2.8.3 (https://github.com/jpfluger/zazzy-browser)
//! MIT License; Copyright 2017-2023 Jaret Pfluger
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 964:
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

      const objReturn = {request: options, data: data}

      // allow an escape
      if (objReturn.request.RAWRETURN === true) {
        return callback(objReturn, null)
      }

      let noFinalResolve = false
      const rob = zzb.rob.newROB()

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
                type: zzb.types.isStringNotEmpty(data.messageType) ? data.messageType : null,
                classDialog: 'zzb-dialog-flash-message zzb-dialog-flash-redirect' + zzb.strings.mergeElseEmpty(' zzb-dialog-flash-status-{0}', data.messageType),
                dataBackdrop: 'static',
                title: zzb.types.isStringNotEmpty(data.messageTitle) ? data.messageTitle : '',
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
        let tmpRecs = data.recs
        if (!data.ISROBRECS) {
          if (data.recs) {
            tmpRecs = zzb.rob.sanitizeRecords(data.recs)
          } else if (data.rec) {
            tmpRecs = zzb.rob.sanitizeRecords(data.rec)
            data.rec = null
          } else if (!Array.isArray(data.errs) || data.errs.length === 0) {
            // pass in self
            tmpRecs = zzb.rob.sanitizeRecords(data)
          }
        }

        // Obsolete? Depends on the paginate paradigm to be useful.
        if (data.paginate) {
          rob.paginate = data.paginate
        }

        rob.errs = data.errs
        rob.recs = tmpRecs
        tmpRecs = null
        rob.columns = data.columns

        rob.listErrs = zzb.rob.toList(rob.errs)

        if (options.SKIPFLASH !== true) {
          if (zzb.types.isStringNotEmpty(data.message)) {
            noFinalResolve = true
            zzb.dialogs.showMessage({
              type: zzb.types.isStringNotEmpty(data.messageType) ? data.messageType : null,
              classDialog: 'zzb-dialog-flash-message' + zzb.strings.mergeElseEmpty(' zzb-dialog-flash-status-{0}', data.messageType, rob.hasErrors() ? 'error' : 'okay'),
              dataBackdrop: 'static',
              title: zzb.types.isStringNotEmpty(data.messageTitle) ? data.messageTitle : '',
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

_ajax.prototype.postFORM = function (options, callback) {
  options.method = 'POST'
  options.expectType = 'json'
  zzb.ajax.request(options, callback)
}

const AjaxMessage = function (options) {}

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

exports.R = _ajax


/***/ }),

/***/ 149:
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
      this.bsModal = new bootstrap.Modal(this.modal, {focus: this.defaultOptions.focus === true, keyboard: this.defaultOptions.keyboard === true})
    } else {
      this.closeModal = this.modal.querySelectorAll('[data-bs-dismiss]');

      this.closeModal.forEach(item => {
        item.addEventListener("click", (e) => {
          this.close();
        });
      })
    }

    const self = this
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
    const dialog = {
      // contains the full html, including id, title, body and buttons already formatted
      htmlDialog: '',
      // The remainder builds the htmlDialog
      id: zzb.uuid.newV4(),
      type: ZazzyDialog.TYPE_NONE,
      classDialog: '',
      classBackdrop: '',
      extraAttributes: '',
      noFade: false,
      noFocus: false,
      noKeyboard: false,
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
      hasAutoBackdrop: false,
      isScrollable: false,
      isNoFooter: false,
      classWidthMod: '',
      isFullscreen: false,
      classFullscreenMod: ''
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
    const button = {
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
    let button = ZazzyDialog.getButtonDefaults()
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

    const options = zzb.types.merge({
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
      focus: this.defaultOptions.noFocus != true,
      keyboard: this.defaultOptions.noKeyboard != true,
      classScrollable: (this.defaultOptions.isScrollable ? ' modal-dialog-scrollable' : ''),
      classNoFooter: (this.defaultOptions.isNoFooter ? ' d-none' : ''),
      classWidthMod: '',
      classFullscreen: ''
    }, this.defaultOptions)

    options.classFade = ' fade'
    if (zzb.types.isBoolean(options.noFade) && options.noFade === true) {
      options.classFade = ''
    }

    if (!ZazzyDialog.isTypeNone(options.type)) {
      options.classModalHeader += ' alert-' + options.type
    }

    if (zzb.types.isStringNotEmpty(options.classDialog)) {
      options.classDialog = ' ' + options.classDialog
    }

    if (zzb.types.isStringNotEmpty(options.classBackdrop)) {
      options.classBackdrop = ' ' + options.classBackdrop
    }

    if (options.hasAutoBackdrop === true && !zzb.types.isStringNotEmpty(options.dataBackdrop)) {
      options.dataBackdrop = 'true'
    }
    if (zzb.types.isStringNotEmpty(options.dataBackdrop)) {
      options.hasAutoBackdrop = true
      options.extraAttributes += ' data-bs-backdrop="' + options.dataBackdrop + '"'
    }

    if (zzb.types.isStringNotEmpty(options.classWidthMod)) {
      options.classWidthMod = ' modal-' + options.classWidthMod
    }

    if (options.isFullscreen == true) {
      options.classFullscreen = ' modal-fullscreen'
      if (zzb.types.isStringNotEmpty(options.classFullscreenMod)) {
        options.classFullscreen = options.classFullscreen + '-' + options.classFullscreenMod + '-down'
      }
    }

    // Pertains to static backdrop.
    if (zzb.types.isBoolean(options.dataKeyboard)) {
      options.extraAttributes += ' data-bs-keyboard="' + options.dataKeyboard + '"'
    }

    if (options.noHeaderCloseButton !== true) {
      options.noHeaderCloseButtonButton = '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
      //options.noHeaderCloseButtonButton = '<button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
    }

    const template =
      '<div class="modal{classFade}{classBackdrop}" {extraAttributes} id="{id}" tabindex="-1" role="dialog" aria-labelledby="{arialabel}" aria-hidden="true">' +
        '<div class="modal-dialog{classVerticalCenter}{classFullscreen}{classWidthMod}{classScrollable}{classDialog}" role="document">' +
          '<div class="modal-content">' +
            '<div class="modal-header{classModalHeader}">' +
              '<h5 class="modal-title" id="{arialabel}">{title}</h5>' +
              '{noHeaderCloseButtonButton}' +
            '</div>' +
            '<div class="modal-body">{body}</div>' +
            '<div class="modal-footer{classNoFooter}">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'

    // Insert the template prior to adding events
    document.body.insertAdjacentHTML('beforeend', zzb.strings.format(template, options))
    const $modal = document.getElementById(this.getId())

    if (!$modal) {
      throw new Error('unexpected that modal has not been created')
    }

    const self = this

    if (!Array.isArray(options.buttons)) {
      options.buttons = []
    }

    const maxButtons = options.buttons.length

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

const _dialogs = function () {
  this.modals = {}
}

_dialogs.prototype.ZazzyDialog = ZazzyDialog

_dialogs.prototype.modal = function (options) {
  if (options && options.id && zzb.types.isStringNotEmpty(options.id)) {
    if (this.modals[options.id]) {
      return this.modals[options.id]
    }
  }
  const myModal = new ZazzyDialog(options)
  if (myModal && zzb.types.isStringNotEmpty(myModal.getId())) {
    return myModal
  }
  throw new Error('Failed to create dialog')
}

_dialogs.prototype.showMessage = function (options) {
  const dialog = zzb.dialogs.modal(zzb.types.merge({
    type: ZazzyDialog.TYPE_NONE,
    buttons: [ZazzyDialog.BUTTON_OK]
  }, options))
  if (options.noAutoOpen === true) {
    return dialog
  }
  dialog.open()
}

_dialogs.prototype.showMessageChoice = function (options) {
  const dialog = zzb.dialogs.modal(zzb.types.merge({
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
  const template = '<div class="zzb-dialog-errors">{errors}</div>' +
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
      const arrHtml = []

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

exports.i = _dialogs


/***/ }),

/***/ 636:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// dom
// ---------------------------------------------------

function _dom () {}

_dom.prototype.hasUIHover = function () {
  return (!window.matchMedia("(hover: none)").matches)
}

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
  if (zzb.types.isStringNotEmpty(value)) {
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

exports.t = _dom


/***/ }),

/***/ 531:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// perms (Permission Keys)
// ---------------------------------------------------

const _perms = function () {}

_perms.prototype.getPO = function (pos, key) {
  let po = pos[key]

  if (po) {
    return po
  }

  return this.getPermObject(key + ':')
}

_perms.prototype.getPermObjectFromPermkeys = function (permkeys) {
  const pos = {}
  const self = this

  if (Array.isArray(permkeys)) {
    permkeys.forEach(function (permkey) {
      let po = self.getPermObject(permkey)
      if (po.key) {
        pos[po.key] = po
      }
    })
  } else if (zzb.types.isObject(permkeys)) {
    for (const key in permkeys) {
      let perm = permkeys[key]
      // _.forOwn(permkeys, function (perm, key) {
      if (!perm) {
        perm = ''
      }
      let po = null
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

  let split = null
  let po = {}
  let mo = {}

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

  for (let mm = 0; mm < mo.perm.length; mm++) {
    if (po.perm.indexOf(mo.perm[mm]) < 0) {
      po.perm += mo.perm[mm]
    }
  }

  return po.key + ':' + po.perm
}

_perms.prototype.getPermObject = function (permkey, available, merge) {
  let po = { key: null, perm: null, attr: {}, toPermkey: function () { return this.key + ':' + this.perm } }

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

  let split = permkey.split(':')
  po.key = split[0]
  po.perm = split[1]

  po.perm = po.perm.trim().toUpperCase()

  if (po.perm.length > 0) {
    // remove any permissions from the default that are not available
    if (available && zzb.types.isStringNotEmpty(available)) {
      available = available.trim().toUpperCase()
      for (let mm = po.perm.length - 1; mm >= 0; mm--) {
        if (available.indexOf(po.perm[mm]) < 0) {
          po.perm = po.perm.replace(po.perm[mm], '')
        }
      }
    }
  }

  po.attr = this.getPermAttributes(po.toPermkey(), available)

  return po
}

const reCRUDX = new RegExp('^[CRUDX]*$')

_perms.prototype.getPermAttributes = function (permkey) {
  // CRUDX
  let attr = { canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExecute: false }

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

  let po = permkey
  if (zzb.types.isStringNotEmpty(permkey)) {
    po = this.getPermObject(permkey)
  }

  if (!zzb.types.isObject(po) || !po.key || !po.perm || po.perm.length === 0) {
    return false
  }

  let tp = null
  if (zzb.types.isStringNotEmpty(target)) {
    tp = this.getPermObject(target)
  } else if (Array.isArray(target)) {
    const self = this
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

  for (let ii = 0; ii < tp.perm.length; ii++) {
    if (po.perm.indexOf(tp.perm[ii]) >= 0) {
      return true
    }
  }

  return false
}

exports.k = _perms


/***/ }),

/***/ 628:
/***/ ((__unused_webpack_module, exports) => {

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

exports.I = _rob


/***/ }),

/***/ 462:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// strings
// ---------------------------------------------------

const _strings = function () {}

function ValueError (message) {
  let err = new Error(message)
  err.name = 'ValueError'
  return err
}

// https://github.com/davidchambers/string-format
// create :: Object -> String,*... -> String
// zzb.strings.format('{0}, you have {1} mushroom{2}', 'Piggy', 2, 's')
// zzb.strings.format('{0}, you have {1} mushroom{2}', ['Piggy', 2, 's'])
// zzb.strings.format('{name}, you have {number} mushroom{ending}', {name: 'Piggy', number: 2, ending: 's'})
const formatString = function (transformers) {
  return function (template) {
    let args = Array.prototype.slice.call(arguments, 1)
    let idx = 0
    let state = 'UNDEFINED'

    if (Array.isArray(args) && args.length > 0 && Array.isArray(args[0])) {
      let tmpArr = args[0].map(function (s) {
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
        let key = _key
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
        let path = key.split('.')
        let value = (/^\d+$/.test(path[0]) ? path : ['0'].concat(path))
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
  let args = Array.prototype.slice.call(arguments, 1)
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
    let comma = ''
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
    return target.charAt(0).toUpperCase() + target.slice(1);
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

const sizeUnitsFormatNameSingle = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
const sizeUnitsFormatNameDouble = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
const sizeUnitsFormatNameFull = ['Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte', 'Petabyte', 'Exabyte', 'Zettabyte', 'Yottabyte']
const sizeUnitsFormatNameEIC = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

// From https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/10420404
//      https://ux.stackexchange.com/questions/13815/files-size-units-kib-vs-kb-vs-kb
// We standardized the above, somewhat, with https://github.com/cloudfoundry/bytefmt
// Also only divisions are with 1024 and NOT 1000
_strings.prototype.sizeToHumanReadable = function (bytes, unitsFormat, noSizeUnitSeparation, dp) {
  if (!zzb.types.isStringNotEmpty(unitsFormat)) {
    unitsFormat = 'single'
  }
  let unitSeperateSpace = ' '
  if (noSizeUnitSeparation === true) {
    unitSeperateSpace = ''
  }
  if (!dp) {
    dp = 1
  }

  let thresh = 1024 // si ? 1000 : 1024

  let units
  let unitsBytes = 'B'
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

  // let units = si
  //   ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  //   : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  // let r = 10 ** dp
  let r = Math.pow(dp, 10)

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  let valFixed = bytes.toFixed(dp) + ''
  valFixed = zzb.strings.trimSuffix(valFixed, ['.00', '.0'])

  return valFixed + unitSeperateSpace + units[u]
}

_strings.prototype.trimPrefix = function(target, prefix) {
  target = zzb.types.toString(target)
  let arr = []
  if (!zzb.types.isArray(prefix)) {
    arr.push(zzb.types.toString(prefix))
  } else {
    arr = prefix
  }
  for (let ii = 0; ii < arr.length; ii++) {
    if (target.startsWith(arr[ii])) {
      return target.slice(arr[ii])
    }
  }
  return target
}

_strings.prototype.trimSuffix = function(target, suffix) {
  target = zzb.types.toString(target)
  let arr = []
  if (!zzb.types.isArray(suffix)) {
    arr.push(zzb.types.toString(suffix))
  } else {
    arr = suffix
  }
  for (let ii = 0; ii < arr.length; ii++) {
    if (target.endsWith(arr[ii])) {
      return target.slice(0, arr[ii].length * -1)
    }
  }
  return target
}

// https://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
_strings.prototype.millisecondsTimeToHumanReadable = function (milliseconds) {
  let temp = milliseconds / 1000
  const years = Math.floor(temp / 31536000)
  const days = Math.floor((temp %= 31536000) / 86400)
  const hours = Math.floor((temp %= 86400) / 3600)
  const minutes = Math.floor((temp %= 3600) / 60)
  const seconds = temp % 60

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
  if (!zzb.types.isStringNotEmpty(target)) {
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
    case "":
    case null:
    case undefined:
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
          target[ii] = zzb.types.isStringNotEmpty(target[ii]) ? target[ii] : elseif
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

exports.P = _strings


/***/ }),

/***/ 247:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// time
// ---------------------------------------------------

function _time () {}

class ZazzyInterval {
  constructor(options) {
    this.options = ZazzyInterval.getZazzyDefaults(options)
    if (this.options.autostart === true) {
      this.options.new()
    }
  }
  static getZazzyDefaults(options) {
    const myInterval = {
      interval: 60000,
      autostart: false,
      id: null,
      targetClick: null,
      datacache: false,
      action: function() {console.log('ZazzyInterval no-op')}
    }
    options = (zzb.types.isObject(options) ? zzb.types.merge(myInterval, options) : myInterval)
    options.autostart = options.autostart === true
    if (!(zzb.types.isStringNotEmpty(options.id))) {
      options.id = zzb.uuid.newV4()
    }
    if (!zzb.types.isFunction(options.action)) {
      throw new Error('required action')
    }
    options._cache = null
    options._itoken = null
    if (!zzb.types.isFunction(options.new)) {
      options.new = function() {
        options._itoken = setInterval(options.refresh, this.interval)
        options._isPaused = false
      }
    }
    if (!zzb.types.isFunction(options.clear)) {
      options.clear = function(doPause) {
        if (options._itoken == null) {
          return
        }
        clearInterval(options._itoken)
        options._itoken = null
        if (doPause === true) {
          options._isPaused = true
        }
      }
    }
    if (!zzb.types.isFunction(options.unpause)) {
      options.unpause = function() {
        if (options._isPaused !== true) {
          return
        }
        options._itoken = setInterval(options.refresh, this.interval)
        options._isPaused = false
      }
    }
    if (!zzb.types.isFunction(options.refresh)) {
      options.refresh = function() {
        if (options._itoken == null) {
          return
        }
        options._isPaused = false
        options.action && options.action()
        // document.getElementById("butMainSearch").click()
      }
    }
    return options
  }
  new() {
    if (zzb.types.isFunction(this.options.new)) {
      this.options.new()
    }
  }
  clear(doPause) {
    if (zzb.types.isFunction(this.options.clear)) {
      this.options.clear(doPause === true)
    }
  }
  unpause() {
    if (zzb.types.isFunction(this.options.unpause)) {
      this.options.unpause()
    }
  }
  refresh() {
    if (zzb.types.isFunction(this.options.refresh)) {
      this.options.refresh()
    }
  }
  setCache(obj) {
    this.options._cache = this.options.datacache ? obj : null
  }
  getCache() {
    return this.options.datacache ? this.options._cache : null
  }
  hasCache() {
    return this.options.datacache && this.options._cache
  }
}

_time.prototype.ZazzyInterval = ZazzyInterval

_time.prototype.getInterval = function (id) {
  if (!this.myIntervals || !zzb.types.isStringNotEmpty(id) || !this.myIntervals[id]) {
    return null
  }
  return this.myIntervals[id]
}

_time.prototype.clearAll = function (doPause) {
  if (!this.myIntervals || !zzb.types.isObject(this.myIntervals)) {
    return
  }
  for (const key in this.myIntervals) {
    this.myIntervals[key].clear(doPause)
  }
}

_time.prototype.unpauseAll = function () {
  if (!this.myIntervals || !zzb.types.isObject(this.myIntervals)) {
    return
  }
  for (const key in this.myIntervals) {
    this.myIntervals[key].unpause()
  }
}

_time.prototype.newInterval = function (options) {
  if (!this.myIntervals) {
    this.myIntervals = {}
  }
  if (options && options.id && zzb.types.isStringNotEmpty(options.id)) {
    if (this.myIntervals[options.id]) {
      return this.myIntervals[options.id]
    }
  }
  const myInterval = new ZazzyInterval(options)
  if (myInterval && myInterval.options && zzb.types.isStringNotEmpty(myInterval.options.id)) {
    this.myIntervals[myInterval.options.id] = myInterval
    return myInterval
  }
  throw new Error('Failed to create ZazzyInterval')
}

_time.prototype.newUIInterval = function ($elem) {
  if (!$elem) {
    return
  }
  if ($elem.getAttribute('zi-inited') === 'true') {
    return
  }
  if (!zzb.types.isStringNotEmpty($elem.getAttribute('id'))) {
    $elem.setAttribute('id', zzb.uuid.newV4())
  }
  // zi-interval = The interval in milliseconds. Default is 60000 (1 minute).
  // zi-id = The name of identifying this interval object. Default is a new uuid4 value.
  // zi-autostart = [ "true" | "false" ] If true, then begin the timer immediately otherwise do not start.
  zzb.time.newInterval({
    interval: zzb.dom.getAttributeElse($elem, 'zi-interval', null),
    id: zzb.dom.getAttributeElse($elem, 'zi-id', null),
    autostart: $elem.getAttribute('zi-autostart') === 'true',
    targetClick: $elem.getAttribute('id'),
    datacache: $elem.getAttribute('zi-datacache') === 'true',
    action: function() {

      //console.log('myInterval.action', this.targetClick)

      // Detect modal dialogs open. If open, then ignore b/c the new injects can junk-up the dom, creating wierd bugs.
      // console.log('modals showing', document.querySelectorAll('.modal.show').length)
      if (document.querySelectorAll('.modal.show').length > 0) {
        return
      }

      document.getElementById(this.targetClick).setAttribute('zi-noclick', 'true');
      document.getElementById(this.targetClick).click();
    }
  })
  $elem.setAttribute('zi-inited', 'true')
}

exports.k = _time


/***/ }),

/***/ 305:
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
    let result = (trimSuffix + '');
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
  let getType = {}
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

exports.g = _types


/***/ }),

/***/ 169:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// uuid
// ---------------------------------------------------

const _uuid = function () {}

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
    let value = limit * Math.random();
    return value | 0;
  }

  function generateX() {
    let value = generateNumber(16);
    return value.toString(16);
  }

  function generateXes(count) {
    let result = '';
    for(let i = 0; i < count; ++i) {
      result += generateX();
    }
    return result;
  }

  function generateVariant() {
    let value = generateNumber(16);
    let variant =  (value & 0x3) | 0x8;
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
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
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
  const re = /^([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)$/i
  return re.test(uuid)
}

exports.u = _uuid


/***/ }),

/***/ 168:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// _zaction
// ---------------------------------------------------

/*
Usage:
    1. Add 'zaction' to an element class to add event listeners.
       * This happens on load prior to HTML display or when new content added after.
       * Add 'no-autoload-zactions' to the body class to disable initializing zaction prior to HTML display.
    2. Add 'zload-action' to load content prior to HTML display

On the element itself:
    * `zclosest`: Navigate up the DOM to the designated element, merging in zui attributes on it. Existing zui attributes are not replaced.
    * `zcall`: Specify the DOM event. Defaults to `click` but available are what your handler specifies, such as click, mousedown, mouseup, change.

    * `zurl`: The url to send data to the server. If the path contains a reserved name (see variable `reservePH` for a list), these are replaced with their respective actions.
              Reserved placeholder list includes [':event', ':mod', ":zid", ':zidParent']. These are optional to include in zurl.
              Valid zurls are:
              * https://example.com/path/to/page
              * https://example.com/:event/:zid/:mod
              * https://example.com/path/to/page/:zidParent
              * https://example.com/path/to/pdfs/:zid/:blobName

    * `za-event`: The event to fire inside the local event handler.
                  If data is sent to the server, it is part of zaction.event.
                  Note sometimes events run that don't send data to the server (eg drag-drop).
                  Built-in events:
                  * zurl-dialog
                  * zurl-confirm // show a confirmation dialog prior to running an action
                  * zurl-replace
                  * zurl-search // allows interval for page refresh and data-caching
                  * zurl-action
                  * zurl-field-update // updates fields using json key-values
                  * zurl-blob-download
                  * zurl-nav-tab
                  * zurl-nav-self
    * `za-mod`: If used, it is sent to the server as zaction.mod (eg 'delete', 'create', 'edit', 'paginate').
    * `za-method`: The type of call to initiate with the server. Available: `getJSON`, `postJSON`, `postFORM`. Default is `postJSON`.

    * `za-zid`: The id of an element. Optional. If used, it is sent to the server as zaction.zid.
    * `za-zid-parent`: The parent-id of an element. Optional. If used, it is sent to the server as zaction.zidParent.
    * `za-zseq`: The sequence number, if used as a second zid identifier. This id is a passive passenger in that zaction does
                 not use it. You may create or rename other zids to suit your needs. For example, we could have called this slot "zid2".

    * `za-page-on`: When pagination is active, it is sent to the server as zaction.pageOn.
    * `za-page-limit`: When pagination is active, it is the number of records to show on a page.
    * `za-ignore-zurl`:  If 'true', the url is ignored but other properties are initialized.
    * `za-do-zval`:  When placed on an element (eg button for submit), results will be sent through the zval processor.

    * `za-loop-type`: If used, it is sent to the server as zaction.loopType.
    * `za-loop-inject-skip-inject`: If set to 'true' and a loopType has not been identified, forces skipping injecting html even when an inject is identified.

    * `za-data`: The data selector in the format of "label.type : id | class". The first period (".") is the label separator and the colon (":") separates the type selector.
                 * Label is optional but required when selecting multiple elements that require html injection from server ajax results.
                 * The selector has the reserved words 'none | selector | closest | self'.
                   * 'none': skips all selectors completely for the element and any ancestors.
                   * 'self': returns the current element.
                   * 'closest': selects the closest element.
                   * 'selector': selects the element, usually based on id ('#id") or class ('.class).
                 If the selected element is of type Form, a new FormData object is auto-created.
                 If the zurl, zid and zidParent are not already detected, the data element is inspected for these attributes after the zclosest hierarchy has been completed.
                 Examples.
                     za-data="none" --> IGNORE zdata for entire life of zaction.
                     za-data="self" | "self:"
                     za-data="label.selector:criteria"
                     za-data="label.closest:criteria"
                     za-data="label.selector@inner:criteria" // innerHTML. 'inner' is the default.
                     za-data="label.closest@outer:criteria" // outerHTML

    * `za-inject`: The element targeted for injection by the results of an action in a format similar to za-data.
    * `za-post-save`: The elements targeted to invoke after a normal zaction, if no errors.
                      It is similar to `zdlg-post-save` but the latter is attached to a dialog footer button whereas `za-post-save` is not.

    * `zinput`: The element having this class will have its data-state checked for any changes and, if any, then `ztoggler` gets fired.
    * `zinput-event`: Default is `input`. For example, specify `change` for a change event.
    * `zinput-field`: An `input`, `select` or `textarea` that should get an input handler. For textarea, set `zinput-event` to `change`.
    * `ztoggler`: An attribute on an element having class `zinput`.
                  It points to the id of the element that should be toggled should any changes happen to child elements having class `zinput-field`.
                  These are elements that have the `input` event fired.
    * `ztoggler-display`: `disabled` or `none`. Default is `none`. If none, the target ztoggler element will not show unless there is a data-state change.
    * `zref-zinput-ptr`: The `zinput` loader will auto-place this on the `ztoggler` element as a reference back to the `zinput` parent.
                          It is required for post-zaction functionality.

    * `za-dlg`: The selector to the element having dlg attributes in a format similar to za-data.
      * zdlg-post-save="selector" // See `za-post-save`. The version for zdlg is attached to a dialog button.
      * zdlg-title="Dialog Title" // Force this title all the title, even if the server sends a title to use.
      * zdlg-alt-title="Alternative Title" // Use this title when the server does not send a title.
      * zdlg-body="Do you want to save?" // Evaluation order is zaction.getOptions().zdlg.body (from element), results.html (from server), results.js.body (or optionally from server if results.html is empty)
      * zdlg-noHeaderCloseButton="false | true" // if 'true', the close button on the header will be hidden.
      * zdlg-type="default | none | primary | secondary | success | danger | warning| info| light | dark | link"
        * This sets the theme for the entire dialog but not the buttons, which are set by 'zdlg-theme' or 'zdlg-buttons'.
      * zdlg-alt-type="default | none | primary | secondary | success | danger | warning| info| light | dark | link" // Use the alternate type when the server does not send a theme.
      * zdlg-theme="Cancel|Save|default" // A quick way to create buttons and set the type. Use zdlg-buttons for further customization.
      * zdlg-alt-theme="Cancel|Save|default" // Use the alternate theme when the server does not send a theme.
      * zdlg-buttons='LABEL|THEME|ZTRIGGER;LABEL|THEME|ZTRIGGER'
        * The ';' separates buttons.
      * zdlg-class-backdrop="class2 class3" // Add classes to the backdrop of a .modal-dialog. The backdrop class is already "fullscreen".
      * zdlg-alt-class-backdrop="class2 class3" // Add classes to the backdrop of a .modal-dialog. The backdrop class is already "fullscreen".
      * zdlg-class="modal-fullscreen class2 class3" // Add classes to a .modal-dialog.
      * zdlg-alt-class="modal-fullscreen class2 class3" // Add classes to a .modal-dialog.
      * zdlg-class-width-mod="sm | lg | xl" // Adds optional size to dialog width, even if the server sends data to use.
      * zdlg-alt-class-width-mod="sm | lg | xl" // Use this when server does not send data.
      * zdlg-class-fullscreen-mod="sm | md | lg | xl | xxl" // Adds optional fullscreen down-sizing width, even if the server sends data to use.
      * zdlg-alt-class-fullscreen-mod="sm | md | lg | xl | xxl" // Use this when server does not send data.
      * zdlg-is-scrollable="true | false" // Adds scrollbars to dialog, even if the server sends data to use.
      * zdlg-alt-is-scrollable="true | false" // Use this when server does not send data.
      * zdlg-is-fullscreen="true | false" // Adds fullscreen to dialog, even if the server sends data to use. Optionally use in conjunction with `zdlg-class-fullscreen-mod .
      * zdlg-alt-is-fullscreen="true | false" // Use this when server does not send data.
      * zdlg-is-no-footer="true | false" // Hides the footer completely, even if the server sends data to use.
      * zdlg-alt-is-no-footer="true | false" // Use this when server does not send data.

    REMOVED: DOM Manipulation (this was tucked inside handleZUrlAction)
    * `za-post-inject-action`:  Optional action to run after injection. Current supported is 'delete' inside handleZUrlAction.
 */

class ZActionHandler {
  constructor(options) {
    this.options = zzb.types.merge({id:null,handler:null,namespace:null}, options)
  }
  getId() {
    return this.options.id
  }
  getHandler() {
    return this.options.handler
  }
  getNameSpace() {
    return this.options.namespace
  }
  run(zaction) {
    if (this.options.handler) {
      return this.options.handler(zaction)
    }
    return false
  }
}

const _zaction = function () {
  this.handlers = []
  // Required
  // this.handlers = [
  //     new ZActionHandler({handler: zzb.zaction.actionHandler})
  // ]
}

_zaction.prototype.ZActionHandler = ZActionHandler

_zaction.prototype.registerHandler = function(options) {
  zzb.zaction.setHandler(new ZActionHandler(options))
}

_zaction.prototype.getHandlers = function() {
  return this.handlers
}

_zaction.prototype.getHandler = function(id) {
  if (!id) {
    return
  }
  this.handlers.forEach(function(handler) {
    if (handler.getId() === id) {
      return handler
    }
  })
  return null
}

_zaction.prototype.setHandler = function(handler) {
  if (!handler) {
    return
  }
  for (let ii = 0; ii < this.handlers.length; ii++) {
    if (this.handlers[ii].getId() === handler.id) {
      this.handlers[ii] = handler
      return
    }
  }
  this.handlers.push(handler)
}

function findSelectorTargets($elem, bundle) {
  if (!$elem) {
    return null
  }
  if (!zzb.types.isStringNotEmpty(bundle)) {
    return null
  }
  let arr = []
  let ssTargets = bundle.split(',')
  for (let mm = 0; mm < ssTargets.length; mm++) {

    let bundle = ssTargets[mm]

    switch (bundle) {
      case 'self':
        arr.push({label: 'self', $elem: $elem})
        break
      case 'self:':
        arr.push({label: 'self', $elem: $elem})
        break
      case 'none':
        return 'none'
      case 'none:':
        return 'none'
      default:
        // parse
        // label.selector:#id
        // label.selector@placement:#id
        let split = [ bundle.substring(0, bundle.indexOf(':')), bundle.substring(bundle.indexOf(':') + 1) ]
        if (split.length === 2) {
          if (!zzb.types.isStringNotEmpty(split[1])) {
            return null
          }

          let label = null
          if (split[0].indexOf('.') > 1) {
            // label.selector#placement
            label = split[0].slice(0, split[0].indexOf('.'))
            split[0] = split[0].slice(split[0].indexOf('.') + 1)
          }

          let placement = 'inner'
          let mySelector = split[0]
          if (split[0].indexOf('@') > 1) {
            // label.selector#placement
            mySelector = split[0].slice(0, split[0].indexOf('@'))
            placement = split[0].slice(split[0].indexOf('@') + 1)
          }

          let $target = null
          if (mySelector === 'selector' || mySelector === 's') {
            $target = document.querySelector(split[1])
          } else if (mySelector === 'closest' || mySelector === 'c') {
            $target = $elem.closest(split[1])
          } else if (mySelector === 'child' || mySelector === 'h') {
            $target = $elem.querySelector(split[1])
          }

          if (!(placement === 'inner' || placement === 'outer')) {
            console.log('unknown placement param inside inject; defaulting to "inner"', split)
            placement = 'inner'
          }

          if ($target) {
            arr.push({label: label, $elem: $target, placement: placement})
          }
        }
    }
  }

  return arr
}

_zaction.prototype.newZClosest = function($elem, obj, isFirstZAction, zaExtraHandler) {
  return buildZClosest($elem, obj, isFirstZAction, zaExtraHandler)
}

function buildZClosest($elem, obj, isFirstZAction, zaExtraHandler) {
  let isNew = false
  if (!obj) {
    isNew = true
    obj = {zaction:{},zdata:{},zdlg:{tryDialog: false},zurl:null,$data:null,arrInjects:null,zref:{},zinterval:{}}
  }
  if (!$elem) {
    return null
  }

  if (isNew) {
    obj.zinterval.id = $elem.getAttribute('zi-id')
    if (zzb.types.isStringNotEmpty(obj.zinterval.id)) {
      obj.zinterval.noClick = $elem.getAttribute('zi-noclick') === 'true'
      $elem.setAttribute('zi-noclick', 'false');
    }
  }

  // Apply 'obj.zaction' over the top of the newest found attributes, since 'obj.zaction' overrides these.
  obj.zaction = zzb.types.merge(zzb.dom.getAttributes($elem, /^za-/, 3), obj.zaction)

  // zdata elements are the full hierarchy, from element to zclosest ancestors.
  obj.zdata = zzb.types.merge(zzb.dom.getAttributes($elem, /^zd-/, 3), obj.zdata)

  if (!obj.forceIgnoreZUrl) {
    if (isNew || isFirstZAction) {
      obj.forceIgnoreZUrl = obj.zaction.ignoreZurl === 'true'
    }
    if (!obj.forceIgnoreZUrl && !obj.zurl) {
      obj.zurl = findZUrlByAttribute($elem, true)
    }
  }

  if (!obj.forceIgnoreZData) {
    if (!obj.$data) {
      if (zzb.types.isStringNotEmpty(obj.zaction.data)) {
        let arrData = findSelectorTargets($elem, obj.zaction.data)
        if (arrData && arrData[0].$elem) {
          obj.$data = arrData[0].$elem
          obj.forceIgnoreZData = (obj.$data === 'none')
          if (obj.forceIgnoreZData) {
            obj.$data = null
            obj.formData = null
          } else {
            if (obj.$data.nodeName.toLowerCase() === 'form') {
              obj.isForm = true
              obj.formData = new FormData(obj.$data)
            }
            // Wait until the full zclosest hierarchy is completed and if
            // the following aren't found, then try with the data
            // = zurl, zid, zidParent
          }
        }
      }
    }
  }

  // The element itself can have dlg attributes and may also reference another element via 'za-dlg'.
  if (isNew || isFirstZAction) {
    obj.zref = zzb.types.merge(zzb.dom.getAttributes($elem, /^zref-/, 5), obj.zref)
    obj.zdlg = zzb.types.merge(zzb.dom.getAttributes($elem, /^zdlg-/, 5), obj.zdlg)
    // Look for any referenced dlg attributes indicated by the `za-dlg` attribute.
    if (zzb.types.isStringNotEmpty(obj.zaction.dlg)) {
      let arrDlg = findSelectorTargets($elem, obj.zaction.dlg)
      if (arrDlg && arrDlg[0].$elem) {
        obj.zdlg = zzb.types.merge(zzb.dom.getAttributes(arrDlg[0].$elem, /^zdlg-/, 5), obj.zdlg)
        // Dlgs are special cases since they disrupt the normal "zclosest" flow from child to parent.
        // With a dlg in play, it needs a change for the element to use its values, if present and if not
        // having been already defined on $elem.
        obj.zaction = zzb.types.merge(zzb.dom.getAttributes(arrDlg[0].$elem, /^za-/, 3), obj.zaction)
        // Also grab the zurl, if available, since it corresponds directly to the dialog. There is the potential
        // the $elem has on "override" in effect.
        if (!obj.zurl) {
          obj.zurl = findZUrlByAttribute(arrDlg[0].$elem, true)
        }
      }
    }
  }

  if (!obj.forceIgnoreZInject) {
    if (!obj.arrInjects) {
      if (zzb.types.isStringNotEmpty(obj.zaction.inject)) {
        obj.arrInjects = findSelectorTargets($elem, obj.zaction.inject)
        if (obj.arrInjects) {
          obj.forceIgnoreZInject = (obj.arrInjects === 'none')
          if (obj.forceIgnoreZInject) {
            obj.arrInjects = null
          }
        }
      }
    }
  }

  let notOnZaction = (isNew && !$elem.classList.contains('zaction'))
  if (isNew && zaExtraHandler === 'za-post-action') {
    notOnZaction = false
  }
  if (notOnZaction) {
    // root $elem must begin with a zaction
    obj = buildZClosest($elem.closest('.zaction'), obj, notOnZaction, zaExtraHandler)
  } else {
    // a: zclosest=div.navigate  --> div.navigate: zclosest=form --> form-info
    let closest = zzb.dom.getAttributeElse($elem, 'zclosest', null)
    if (closest) {
      let $target = $elem.closest(closest)
      if ($target) {
        obj = buildZClosest($target, obj)
      }
    }
  }

  return obj
}

_zaction.prototype.newZAction = function(ev) {
  if (!ev || !ev.target) {
    return {isValid: false}
  }

  let myZA = {
    isValid: true,
    ev: ev,
    zcall: ev.target.getAttribute('zcall'), // click, mousedown, mouseup, change
    _options: null,
    _runAJAX: null, // function
    isMouseDown: function() {
      return this.zcall === 'mousedown'
    },
    forceStopPropDef: function(doForce) {
      if (doForce || (ev.target.getAttribute('force-stop-prop-def') === "true")) {
        this.ev.preventDefault()
        this.ev.stopPropagation()
        return true
      }
      return false
    },
    getZEvent: function() {
      if (!this._options) {
        this.getOptions()
      }
      return this._options.zaction.event
    },
    hasZEvent: function() {
      return zzb.types.isStringNotEmpty(this.getZEvent())
    },
    isZUrl: function() {
      if (!this._options) {
        this.getOptions()
      }
      return zzb.types.isStringNotEmpty(this._options.zurl)
    },
    canRunZVal: function() {
      this.getOptions()
      return (this._options && this._options.$data && this._options.zaction.doZval === "true")
      // return (this._options && this._options.isForm && this._options.$data && this._options.zaction.val === "true")
    },
    runAJAX: function(options, callback) {
      // Ensure this._options has been created
      this.getOptions()

      if (!options || !this._runAJAX) {
        callback && callback(null, new Error('_runAJAX not defined'))
      } else {
        this._runAJAX(options, callback)
      }
    },
    runInjects: function(drr) {
      if (this.getOptions().arrInjects && drr && drr.rob && drr.rob.hasRecords() && drr.rob.first().dInjects) {
        runInjects(this.getOptions().arrInjects, drr.rob.first().dInjects)
      }
    },
    buildAJAXOptions: function() {
      // Ensure this._options has been created
      this.getOptions()
      // Create the options bundle for the ajax call
      let ajaxOptions = {
        url: this._options.zurl
      }

      const myInterval = zzb.time.getInterval(this._options.zinterval.id)
      if (myInterval && !this._options.zinterval.noClick) {
        //console.log('setCache from noClick')
        myInterval.setCache(null)
      }
      const hasCache = (myInterval && myInterval.hasCache())
      let doSetCache = false

      if (this._options.zaction.method === 'postJSON') {
        ajaxOptions.body = {}
        if (!this._options.forceIgnoreZData) {
          if (this._options.isForm) {
            if (hasCache) {
              ajaxOptions.body = myInterval.getCache()
              //console.log('using cached search')
            } else {
              ajaxOptions.body = zzb.types.merge(serialize(this._options.formData, this._options.$data), ajaxOptions.body)
              ajaxOptions.body = zzb.types.merge(this._options.zdata, ajaxOptions.body)
              ajaxOptions.body = objToTree(ajaxOptions.body)
              // Forms can internally have data that may override that in zaction: zid, zidParent, pageLimit, pageOn.
              // We "could" check if formData.pageLimit has a value and then replace that of zaction.pageLimit
              // but if we do this, then where do the "exceptions" end? Instead, let the server handle new pageLimit requests
              // to create new zaction.pageLimits.
              // ajaxOptions.body.data.zaction.pageLimit = ajaxOptions.body.dat

              // Save the interval cache
              doSetCache = true
              //console.log('regular search')
            }
          }
        }
        ajaxOptions.body.zaction = this._options.zaction
      } else if (this._options.zaction.method === 'postFORM') {
        if (hasCache) {
          ajaxOptions.body = myInterval.getCache()
        } else {
          ajaxOptions.body = this._options.formData
          doSetCache = true
        }
      }

      if (doSetCache && myInterval) {
        myInterval.setCache(ajaxOptions.body)
      }

      if (zzb.types.isStringNotEmpty(this._options.zaction.expectType)) {
        ajaxOptions.expectType = this._options.zaction.expectType
      }

      return ajaxOptions
    },
    getOptions: function() {
      if (this._options) {
        return this._options
      }

      this._options = buildZClosest(this.ev.target, null, null, this.ev.zaExtraHandler)

      if (!this._options.forceIgnoreZData) {
        if (this._options.$data) {
          if (!this._options.zaction.zid) {
            this._options.zaction.zid = zzb.dom.getAttributeElse(this._options.$data, 'za-zid', null)
          }
          if (!this._options.zaction.zidParent) {
            this._options.zaction.zidParent = zzb.dom.getAttributeElse(this._options.$data, 'za-zid-parent', null)
          }
          if (!this._options.zurl) {
            this._options.zurl = findZUrlByAttribute(this._options.$data, true)
          }
        }
      }

      // Wait until full hierarchy is completed
      if (!zzb.types.isStringNotEmpty(this._options.zaction.loopType)) {
        this._options.loopType = null
      } else {
        if (!this._options.forceIgnoreZInject) {
          if (this._options.arrInjects) {
            if (this._options.zaction.loopInjectSkipInject === "true") {
              console.log(new Error('skipping za-loop-type "' + this._options.zaction.loopType + '": no arrInjects identified'))
              this._options.zaction.loopType = null
            } else {
              this._options.hasLoopType = true
            }
          }
        }
      }

      if (!zzb.types.isStringNotEmpty(this._options.zaction.method)) {
        this._options.zaction.method = 'postJSON'
      }

      // assign method
      switch (this._options.zaction.method) {
        case 'getJSON':
          this._runAJAX = zzb.ajax.getJSON
          break
        case 'postFORM':
          this._runAJAX = zzb.ajax.postFORM
          break
        default:
          this._runAJAX = zzb.ajax.postJSON
          break
      }

      // transition from string to boolean
      if (this._options.zdlg) {
        this._options.zdlg.tryDialog = Object.keys(this._options.zdlg).length > 0
      }

      if (!this._options.forceIgnoreZUrl) {
        let zurl = this._options.zurl
        if (!zzb.types.isStringNotEmpty(zurl)) {
          // Log it but don't throw an error. There is a chance the calling program is using the zurl system
          // for other purposes, such as to retrieve arrInjects, $formdata, zid or zidParent values.
          console.log('cannot determine zurl')
          this._options.zurl = null
        } else {
          for (let ii = 0; ii < reservePH.length; ii++) {
            if (zurl.indexOf(reservePH[ii]) > -1) {
              let keyNoColon = reservePH[ii].replace(':', '')
              if (zzb.types.isStringNotEmpty(this._options.zaction[keyNoColon])) {
                zurl = zurl.replace(reservePH[ii], this._options.zaction[keyNoColon])
              } else {
                throw new Error("reserve placeholder '" + reservePH[ii] + "' not found in zurl '" + zurl + "'")
              }
            }
          }
          this._options.zurl = zurl
        }
      }

      this._options.zaction.pageOn = zzb.strings.parseIntOrZero(this._options.zaction.pageOn)
      this._options.zaction.pageLimit = zzb.strings.parseIntOrZero(this._options.zaction.pageLimit)

      return this._options
    }
  }

  if (!myZA.hasZEvent()) {
    return {isValid: false}
  }

  return myZA
}

let reservePH = [':event', ':mod', ":zid", ':zidParent', ':blobName']

function findZUrlByAttribute($elem, returnNull) {
  if (!$elem) {
    return (returnNull ? null : '')
  }
  let zurl = $elem.getAttribute('zurl')
  if (!zzb.types.isStringNotEmpty(zurl)) {
    zurl = $elem.getAttribute('href')
    if (!zzb.types.isStringNotEmpty(zurl)) {
      zurl = $elem.getAttribute('action')
      if (!zzb.types.isStringNotEmpty(zurl) && $elem.nodeName && $elem.nodeName.toLowerCase() !== 'img') {
        zurl = $elem.getAttribute('src')
      }
    }
  }
  if (!zurl || zurl === '#') {
    return (returnNull ? null : '')
  }
  return zurl
}

// https://gomakethings.com/how-to-serialize-form-data-with-vanilla-js/
// https://gomakethings.com/how-to-serialize-form-data-into-a-search-parameter-string-with-vanilla-js/
// https://stackoverflow.com/questions/41431322/how-to-convert-formdata-html5-object-to-json
function serialize (data, $elem) {
  let obj = {};
  for (let [key, value] of data) {
    if (obj[key] !== undefined) {
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    } else {
      obj[key] = value;
    }
  }
  if ($elem) {
    const keys = Object.keys(obj)
    for (let ii = 0; ii < keys.length; ii++) {
      let $field = $elem.querySelector('[name="' + keys[ii] + '"]')
      if ($field) {
        let zfType = $field.getAttribute('zf-type')

        // The cached value, if set, overrides the actual value.
        let zfCVal = zzb.dom.getAttributeElse($field, 'zf-cval', null)
        if (zfCVal) {
          if (zfType === 'date-iso' && (obj[keys[ii]] && obj[keys[ii]].trim() === '')) {
            // A different datepicker object picker may have better results.
            obj[keys[ii]] = null
          } else {
            obj[keys[ii]] = zfCVal
          }
        }

        if (zzb.types.isStringNotEmpty(zfType)) {
          let forceArray = zfType.startsWith('[]')
          let type = zfType.replaceAll('[]', '')
          let elseif = (type === 'int' || type === 'float') ? 0 : ''
          if (type === 'string' && !forceArray) {
            continue
          } else if (type === 'bool') {
            elseif = false
          } else if (type === 'date-iso') {
            elseif = null
          }
          obj[keys[ii]] = zzb.strings.parseTypeElse(obj[keys[ii]], type, elseif, forceArray)
        }
      }
    }
  }
  return obj;
}

function objToTree(obj) {

  function setNode(branch, parts, level, value) {
    if (level === parts.length - 1) {
      branch[parts[level]] = value
    } else {
      if (!branch[parts[level]]) {
        branch[parts[level]] = {}
      }
      branch[parts[level]] = setNode(branch[parts[level]], parts, level + 1, value)
    }
    return branch
  }

  const keys = Object.keys(obj)
  let tree = {}
  for (let ii = 0; ii < keys.length; ii++) {
    tree = setNode(tree, keys[ii].split('.'), 0, obj[keys[ii]])
  }

  return tree
}

// Three means to run handlers
// 1. Use built-in handlers. Defaults are in _zaction.prototype.actionHandler, including hooks to the `zurl` system
// 2. Pass-in an unregistered handler for designated selectors only.
// 3. Pre-register a handler to be called every time. Registration happens prior to calling addEventListeners.
_zaction.prototype.addEventListeners = function(selector, unregisteredHandler, $parent) {

  // Since querySelectorAll errors on an empty string, simply return when selector is empty.
  if (!zzb.types.isStringNotEmpty(selector)) {
    return
  }

  // The parent element to user for the selector
  if (!$parent) {
    $parent = document
  }

  let $elems = $parent.querySelectorAll(selector)
  $elems.forEach(function($elem) {

    if ($elem.getAttribute('za1x') === "true") {
      return
    }

    let zcall = $elem.getAttribute('zcall')
    if (!zzb.types.isStringNotEmpty(zcall)) {
      zcall = 'click'
    }

    // Disallow zaction to be set twice on the the same element.
    // Optionally limit to when .zaction has a $parent parameter.
    //if (!$parent) {
    $elem.setAttribute('za1x', 'true')
    //}

    $elem.addEventListener(zcall, function(ev) {
      zzb.zaction.actionHandler(ev, unregisteredHandler, null)
    })
  })
}

_zaction.prototype.actionHandler = function(ev, unregisteredHandler, callback) {

  let zaction = zzb.zaction.newZAction(ev)
  if (zaction.isValid !== true) {
    throw new Error('failed to create new zaction from event')
  }

  // Check if propagation and defaults should be stopped otherwise
  // individual handler zevents will handle any stopping of propagation/defaults
  zaction.forceStopPropDef()

  // If any unregistered or system handlers handles the action, then stop processing
  let isHandled = false

  // Try any unregistered handler first
  if (unregisteredHandler) {
    isHandled = unregisteredHandler(zaction, callback)
    if (isHandled === true) {
      return
    }
  }

  // Handle the running of any 3rd-party zactions. Doing so allows the 3rd
  // party to override any built-in event handler functions, such as for "za-*"
  let handlers = zzb.zaction.getHandlers()
  for (let ii = 0; ii < handlers.length; ii++) {
    isHandled = handlers[ii].run(zaction, callback)
    if (isHandled === true) {
      return
    }
  }

  if (zaction.isZUrl()) {
    zzb.zaction.handleZUrl(zaction, callback)
  }
  // else {
  //     switch (zaction.getOptions().zaction.event) {
  //         case '':
  //             break
  //         default:
  //             break
  //     }
  // }
}

function runZFormUpdate(zaction, rob) {
  if (!zaction || !rob) {
    return
  }
  if (rob.hasRecords() && zaction.getOptions().$data && zaction.getOptions().isForm && zaction.getOptions().$data.elements.length > 0) {
    try {
      for (const [key, value] of Object.entries(rob.first())) {
        const field = zaction.getOptions().$data.elements.namedItem(key)
        if (field !== undefined && zzb.types.isObject(field)) {
          field.value = value
        }
      }
    } catch(e) {
      console.log('failed runZFormUpdate', e)
    }
  }
}

_zaction.prototype.runZValidate = function(zaction, rob, hideOnly) {
  runZValidate(zaction, rob, hideOnly)
}

function runZValidate(zaction, rob, hideOnly) {
  if (!zaction || !zaction.canRunZVal()) {
    return
  }
  try {
    let hasAny = (rob && rob.listErrs && (rob.hasErrors() || rob.hasMessages))
    let $elems = zaction.getOptions().$data.querySelectorAll('.zval')
    $elems.forEach(function($elem) {
      let isInPlace = $elem.classList.contains('zval-in-place')
      if (isInPlace) {
        $elem.classList.remove('is-valid')
        $elem.classList.remove('is-invalid')
      } else {
        $elem.classList.add('d-none')
      }
      if (!hideOnly && rob) {
        // find the name of the element
        let zval = zzb.dom.getAttributes($elem, /^zval-/, 5)
        if (!zzb.types.isStringNotEmpty(zval.name)) {
          if (isInPlace) {
            zval.name = zzb.dom.getAttributeElse($elem, 'name')
          }
        }
        // Are there matching error or message fields in rob?
        // Why an array? Remember, there could be multiple error/messages returned for a single field name.
        let arrAny = []
        if (hasAny && zzb.types.isStringNotEmpty(zval.name)) {
          arrAny = rob.listErrs.getAnyByName(zval.name)
        }
        // Handle the results
        if (arrAny.length === 0) {
          if (isInPlace) {
            $elem.classList.add('is-valid')
          }
        } else {
          if (isInPlace) {
            $elem.classList.add('is-invalid')
          } else {
            let html = zzb.rob.renderList({targets: arrAny, format: 'html'})
            if (zzb.types.isStringNotEmpty(html)) {
              $elem.innerHTML = html
              $elem.classList.remove('d-none')
            }
          }
        }
      }
      return true
    })
  } catch(e) {
    console.log('failed runZValidate', e)
  }
}

// format = button1|button2|theme-name
function splitDlgTheme(target) {
  if (!zzb.types.isStringNotEmpty(target)) {
    return null
  }
  let ss = target.split('|')
  let dlgTheme = {
    type: zzb.dialogs.ZazzyDialog.TYPE_NONE
  }
  if (ss.length > 0) {
    if (zzb.types.isStringNotEmpty(ss[0])) {
      dlgTheme.button1 = {
        label: ss[0],
        ztrigger: ss[0].toLowerCase(),
        type: zzb.dialogs.ZazzyDialog.TYPE_SECONDARY
      }
    }
  }
  if (ss.length > 1) {
    if (zzb.types.isStringNotEmpty(ss[1])) {
      dlgTheme.button2 = {
        label: ss[1],
        ztrigger: ss[1].toLowerCase(),
        type: zzb.dialogs.ZazzyDialog.TYPE_PRIMARY
      }
    }
  }
  if (ss.length > 2) {
    if (zzb.types.isStringNotEmpty(ss[2])) {
      switch (ss[2]) {
        case 'default':
          break;
        default:
          dlgTheme.type = ss[2]
          if (dlgTheme.button2) {
            dlgTheme.button2.type = dlgTheme.type
          }
          break;
      }
    }
  }
  return dlgTheme
}

function splitDlgButton(target) {
  if (!zzb.types.isStringNotEmpty(target)) {
    return null
  }
  let ss = target.split('|')
  if (ss.length === 0) {
    return null
  }
  let but = {}
  if (ss.length > 0) {
    but.label = ss[0]
  }
  if (ss.length > 1) {
    but.type = ss[1]
  }
  if (ss.length > 2) {
    but.ztrigger = ss[2]
  }
  return but
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
function jsonEval(srcObj, zaction){
  let options = null
  if (zzb.types.isStringNotEmpty(srcObj)) {
    options = Function('"use strict";return (' + srcObj + ')')(zaction);
  }
  return zzb.types.merge({actionHandler: null, onAccept: null, buttons: null}, options)
}

function findZTriggerDialog($elem, jsSvr) {
  if (!$elem) {
    return null
  }

  let ztrigger = zzb.dom.getAttributeElse($elem, 'ztrigger')
  if (!ztrigger) {
    return null
  }

  let $trigger = $elem.closest('.modal-content').querySelector('.modal-body [ztrigger="' + ztrigger + '"]')
  if (!$trigger) {
    throw new Error('failed to locate modal ztrigger="' + ztrigger + '"')
  }

  let objZT = {
    altHandler: null,
    $trigger: $trigger
  }
  if (jsSvr && zzb.types.isObject(jsSvr.ztriggers)) {
    objZT.altHandler = jsSvr.ztriggers[ztrigger]
  }

  return objZT
}

function handleDialog(zaction, callback, results) {
  function handleActionResults(drr, err, $dialog) {
    if (err) {
      return
    }
    // console.log('ztrigger', drr, err)
    if (zzb.types.isStringNotEmpty(zaction.getOptions().zdlg.postSave)) {
      fnPostSave(zaction.getOptions().zdlg.postSave)
      // let ss = zaction.getOptions().zdlg.postSave.split(':')
      // if (ss.length === 2) {
      //   let $target = document.querySelector(ss[1])
      //   if ($target) {
      //     if ($target.getAttribute('za1x2') !== 'true') {
      //       $target.setAttribute('za1x2', 'true')
      //       $target.addEventListener('za-post-action', function(ev){
      //         zzb.zaction.actionHandler(ev, null, null)
      //       })
      //     }
      //     //console.log('ztrigger', ev.detail, err, zaction)
      //     let ev = new CustomEvent('za-post-action')
      //     ev.zaExtraHandler = 'za-post-action'
      //     $target.dispatchEvent(ev)
      //   }
      // }
    } else if (zaction.getOptions().hasLoopType) {
      runInjects(zaction.getOptions().arrInjects, drr.rob.first().dInjects)
      // Old method is not an array
      // zaction.getOptions().$inject.innerHTML = drr.rob.first().html
      // zzb.zaction.addEventListeners('.zaction', null, zaction.getOptions().$inject)
      // zzb.zaction.runZLoadActions(zaction.getOptions().$inject)
    }
    if ($dialog) {
      $dialog.close()
    }
  }

  results = zzb.types.merge({html: null, js: {title: null, altTitle: null, body: null, type: null, buttons: null, noHeaderCloseButton: false, focus: true, keyboard: true}}, (results) ? results : {})

  let dlgOptions = {
    title: '',
    body: '',
    onShow: function(ev) {

      let $elem = ev.target.querySelector('.modal-body')
      if (!$elem) {
        return
      }

      if (zzb.dom.getAttributeElse($elem, '_zdinit', '') === 'true') {
        return
      }

      let $buttons = ev.target.querySelectorAll('.modal-footer [ztrigger]')
      let allowedTriggers = []
      if ($buttons) {
        $buttons.forEach(function($button) {
          allowedTriggers.push($button.getAttribute('ztrigger'))
        })
      }

      // Init:
      // 1. UI elements needing javascript inside modal-body
      // 2. Any action handlers
      // 3. Triggers
      //    * When the event is 'zurl-confirm', the server is not contact until AFTER confirmation.
      //      'zurl-confirm' is resolved under 'button.action' otherwise $elem is searched for triggers
      //       inside '.modal-body', which is what the logic below does.
      if ($elem) {

        zzb.zaction.loadZInputs($elem)

        if (zzb.zui) {
          zzb.zui.onElemInit($elem)
        }

        zzb.zaction.addEventListeners('.zaction', results.js.actionHandler, $elem)

        let $ztElems = $elem.querySelectorAll('[ztrigger]')
        if ($ztElems) {
          $ztElems.forEach(function($ztElem) {
            if (!allowedTriggers.includes($ztElem.getAttribute(('ztrigger')))) {
              console.log('no match of ztrigger handler "', $ztElem.getAttribute('ztrigger') + '"' )
            } else {
              // Ensure this element has a loop-type assigned from the original action.
              if (zaction.getOptions().hasLoopType) {
                if (!zzb.types.isStringNotEmpty($ztElem.getAttribute('za-loop-type'))) {
                  $ztElem.setAttribute('za-loop-type', zaction.getOptions().zaction.loopType)
                  $ztElem.setAttribute('za-loop-inject-skip-inject', "false") // true
                }
              }

              $ztElem.addEventListener('ztrigger-dialog-button', function(ev){
                zzb.zaction.actionHandler(ev, ev.detail.altHandler, function(drr, err) {
                  handleActionResults(drr, err, ev.detail.dialog)
                })
              })
            }
          })
        }
      }

      zzb.dom.setAttribute($elem, '_zdinit', 'true')

      if ($elem.classList.contains('d-none')) {
        $elem.classList.remove('d-none')
      }
    },
    onShown: null,
    onHide: null,
    onHidden: null,
    buttons: [
      zzb.dialogs.ZazzyDialog.getButtonDefaults({
        type: zzb.dialogs.ZazzyDialog.TYPE_SECONDARY,
        label: 'Cancel',
        ztrigger: 'cancel',
        action: function (dialog, ev) {
          dialog.close()
        }
      }),
      zzb.dialogs.ZazzyDialog.getButtonDefaults({
        type: zzb.dialogs.ZazzyDialog.TYPE_PRIMARY,
        label: 'Ok',
        ztrigger: 'ok',
        action: function (dialog, ev) {
          if (zaction.getZEvent() === 'zurl-confirm') {
            zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
              handleActionResults(drr, err, dialog)
            })
          } else {
            let objZT = findZTriggerDialog(this)
            if (!objZT && !objZT.$trigger) {
              dialog.close()
            } else {
              objZT.$trigger.dispatchEvent(new CustomEvent('ztrigger-dialog-button', {detail: {dialog: dialog, evOriginal: ev, altHandler: objZT.altHandler}}))
            }
          }
        }
      })
    ]
  }

  dlgOptions.title = findDlgAjaxValue(zaction, results, 'title', 'altTitle', false)
  dlgOptions.body = findDlgAjaxValue(zaction, results, 'body', null, true)
  dlgOptions.type = findDlgAjaxValue(zaction, results, 'type', 'altType', false)
  dlgOptions.classBackdrop = findDlgAjaxValue(zaction, results, 'classBackdrop', 'altClassBackdrop', false)
  dlgOptions.classDialog = findDlgAjaxValue(zaction, results, 'class', 'altClass', false)
  dlgOptions.dataBackdrop = ''
  dlgOptions.classWidthMod = findDlgAjaxValue(zaction, results, 'classWidthMod', 'altClassWidthMod', false)
  dlgOptions.classFullscreenMod = findDlgAjaxValue(zaction, results, 'classFullscreenMod', 'altClassFullscreenMod', false)
  dlgOptions.isScrollable = findDlgAjaxValue(zaction, results, 'isScrollable', 'altIsScrollable', false) === 'true'
  dlgOptions.isFullscreen = findDlgAjaxValue(zaction, results, 'isFullscreen', 'altIsFullscreen', false) === 'true'
  dlgOptions.isNoFooter = findDlgAjaxValue(zaction, results, 'isNoFooter', 'altIsNoFooter', false) === 'true'
  dlgOptions.noHeaderCloseButton = (zaction.getOptions().zdlg.noHeaderCloseButton === 'true' || results.js.noHeaderCloseButton === true)
  dlgOptions.noFocus = (zaction.getOptions().zdlg.noFocus === 'true' || results.js.noFocus === true)
  dlgOptions.noKeyboard = (zaction.getOptions().zdlg.noKeyboard === 'true' || results.js.noKeyboard === true)

  let dlgTheme = null
  dlgTheme = findDlgAjaxValue(zaction, results, 'theme', 'altTheme', false)
  dlgTheme = (zzb.types.isStringNotEmpty(dlgTheme) ? splitDlgTheme(dlgTheme) : null)

  // The server can reply with its own set of buttons
  // but it may be easier to define overrides on the element.
  // See syntax for 'zdlg-buttons'
  if (zzb.types.isArrayHasRecords(results.js.buttons)) {
    dlgOptions.buttons = results.js.buttons

    // dialog themes
    if (dlgTheme) {
      if (dlgTheme.type && !zzb.types.isStringNotEmpty(dlgOptions.type)) {
        dlgOptions.type = dlgTheme.type
      }
      // The question is if we allow the client to override any server theme buttons?
      // Currently, no. Reason for having server buttons is to have a length !== 2.
      // Future use cases will help determine a better implementation.
    }
  } else {
    // dialog themes
    if (dlgTheme) {
      if (dlgTheme.type && !zzb.types.isStringNotEmpty(dlgOptions.type)) {
        dlgOptions.type = dlgTheme.type
      }
      function setButton(but, ii) {
        dlgOptions.buttons[ii].label = but.label
        dlgOptions.buttons[ii].ztrigger = but.ztrigger.toLowerCase()
        dlgOptions.buttons[ii].type = but.type
      }
      if (dlgTheme.button2) {
        setButton(dlgTheme.button2, 1)
      } else {
        dlgOptions.buttons.splice(1)
      }
      if (dlgTheme.button1) {
        setButton(dlgTheme.button1, 0)
      } else {
        dlgOptions.buttons.splice(0)
      }
    }

    // Individual button overrides
    let ovBut = zaction.getOptions().zdlg.buttons
    if (zzb.types.isStringNotEmpty(ovBut)) {
      ovBut = ovBut.split(';')
      if (ovBut.length !== dlgOptions.buttons.length) {
        console.log('zdlg-buttons definition does not match default options/theme')
      } else {
        for (let ii = 0; ii < dlgOptions.buttons.length; ii++) {
          let but = splitDlgButton(ovBut[ii])
          if (but) {
            if (zzb.types.isStringNotEmpty(but.label)) {
              dlgOptions.buttons[ii].label = but.label
            }
            if (zzb.types.isStringNotEmpty(but.type)) {
              dlgOptions.buttons[ii].type = but.type
            }
            if (zzb.types.isStringNotEmpty(but.ztrigger)) {
              dlgOptions.buttons[ii].ztrigger = but.ztrigger
            }
          }
        }
      }
    }
  }
  zzb.dialogs.showMessage(dlgOptions)
}

function findDlgAjaxValue(zaction, results, key, altKey, isHtmlBody) {
  let value = ''
  let hasZActionDlg = zzb.types.isObject(zaction.getOptions().zdlg)
  if (zzb.types.isStringNotEmpty(key)) {
    if (hasZActionDlg) {
      value = zaction.getOptions().zdlg[key]
      if (zzb.types.isStringNotEmpty(value)) {
        return value
      }
    }
    if (results) {
      if (isHtmlBody) {
        if (zzb.types.isStringNotEmpty(results.html)) {
          return results.html
        }
      }
      if (results.js) {
        if (zzb.types.isStringNotEmpty(results.js[key])) {
          return results.js[key]
        }
      }
    }
  }
  if (hasZActionDlg && zzb.types.isStringNotEmpty(altKey)) {
    value = zaction.getOptions().zdlg[altKey]
    if (zzb.types.isStringNotEmpty(value)) {
      return value
    }
  }
  return ''
}

function handleZUrlDialog(zaction, callback) {
  zaction.forceStopPropDef(true)
  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }

    let results = drr.rob.first()
    results.js = jsonEval(results.js, zaction)

    handleDialog(zaction, callback, results)
  })
}

function handleZUrlConfirm(zaction, callback) {
  zaction.forceStopPropDef(true)
  handleDialog(zaction, callback, null)
}

function runInjects(arrInjects, dInjects) {
  if (arrInjects && dInjects) {
    if (zzb.types.isArray(dInjects)) {
      if (dInjects.length !== arrInjects.length) {
        console.log('inject partial success; arrInjects (len=' + arrInjects.length + ') is less than the number of dInjects (len=' + dInjects.length + ') returned')
      }
      function doInject($inject, dInject, placement) {

        // example for jsonEval
        // let results = drr.rob.first()
        // console.log(results)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
        // function jsonEval(obj) {
        //     return Function('"use strict";return (' + obj + ')')();
        // }
        //
        // results.js = jsonEval(results.js)

        // Should not be applicable here on direct $injects since they use existing zaction system
        // but jsonEval is used for creating dialog from server. If we do a jsonEval here, we may
        // need to transform it for custom action handler situation.
        //results.js = jsonEval(results.js, zaction)

        if (placement === 'outer') {
          $inject.outerHTML = dInject.html
        } else {
          $inject.innerHTML = dInject.html
        }
        if (zzb.zui) {
          zzb.zui.onElemInit($inject)
        }
        zzb.zaction.addEventListeners('.zaction', null, $inject)
        zzb.zaction.runZLoadActions($inject)
      }
      if (dInjects.length === 1) {
        doInject(arrInjects[0].$elem, dInjects[0])
      } else {
        for (let tt = 0; tt < dInjects.length; tt++) {
          if (tt < arrInjects.length) {
            for (let vv = 0; vv < arrInjects.length; vv++) {
              if (arrInjects[vv].label === dInjects[tt].label) {
                doInject(arrInjects[vv].$elem, dInjects[tt], arrInjects[vv].placement)
                break
              }
            }
          }
        }
      }
    }
  }
}

function handleZUrlReplace(zaction, callback) {
  zaction.forceStopPropDef(true)
  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }

    if (zaction.getOptions().arrInjects) {
      runInjects(zaction.getOptions().arrInjects, drr.rob.first().dInjects)
    }

    callback && callback(drr, null)
  })
}

// handleZUrlSearch is a version of handleZUrlAction that submits a form
// and handles injects. It can be used with ZazzyInterval, including smart search-caching.
function handleZUrlSearch(zaction, callback) {
  zaction.forceStopPropDef(true)
  const myInterval = zzb.time.getInterval(zaction.getOptions().zinterval.id)
  if (myInterval) {
    myInterval.clear()
  }
  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }
    if (drr && drr.rob) {
      if (!drr.rob.hasRecords()) {
        callback && callback(drr, null)
      }
      zaction.runInjects(drr)
    }
    if (myInterval) {
      myInterval.new()
    }
    callback && callback(drr, true)
  })
}

function handleZUrlAction(zaction, callback, doFormUpdate) {
  zaction.forceStopPropDef(true)
  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }

    if (drr && drr.rob) {
      runZValidate(zaction, drr.rob)
      if (drr.rob.hasErrors()) {
        callback && callback(null, new Error('validate has errors'))
        return
      }
      if (doFormUpdate === true) {
        runZFormUpdate(zaction, drr.rob)
      }
      if (zaction.getOptions().arrInjects && drr.rob.hasRecords() && drr.rob.first().dInjects) {
        runInjects(zaction.getOptions().arrInjects, drr.rob.first().dInjects)
      }
      let zref = zaction.getOptions().zref
      if (zref && zzb.types.isStringNotEmpty(zref.zinputPtr)) {
        zzb.zaction.loadZInputs(document.getElementById(zref.zinputPtr))
      }
      let za = zaction.getOptions().zaction
      if (za && zzb.types.isStringNotEmpty(za.postSave)) {
        fnPostSave(za.postSave)
      }
    }

    callback && callback(drr, null)
  })
}

const fnPostSave = function(zaSelector) {
  if (zaSelector && zzb.types.isStringNotEmpty(zaSelector)) {
    let ss = zaSelector.split(':')
    if (ss.length === 2) {
      let $target = document.querySelector(ss[1])
      if ($target) {
        if ($target.getAttribute('za1x2') !== 'true') {
          $target.setAttribute('za1x2', 'true')
          $target.addEventListener('za-post-action', function(ev){
            zzb.zaction.actionHandler(ev, null, null)
          })
        }
        //console.log('ztrigger', ev.detail, err, zaction)
        let ev = new CustomEvent('za-post-action')
        ev.zaExtraHandler = 'za-post-action'
        $target.dispatchEvent(ev)
      }
    }
  }
}

function handleZUrlBlobDownload(zaction, callback) {
  zaction.forceStopPropDef(true)

  if (!zzb.types.isStringNotEmpty(zaction.getOptions().zaction.expectType)) {
    zaction.getOptions().zaction.expectType = 'blob'
  }

  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }

    if (drr.data) {
      if (!zzb.types.isStringNotEmpty(zaction.getOptions().zaction.blobType)) {
        zaction.getOptions().zaction.blobType = 'application/octet-stream'
      }

      if (!zzb.types.isStringNotEmpty(zaction.getOptions().zaction.blobName)) {
        zaction.getOptions().zaction.blobName = 'my-file'
      }

      // const blob = new Blob([drr.first()], { type: zaction.getOptions().zaction.blobType });
      const downloadUrl = URL.createObjectURL(drr.data);
      const a = document.createElement("a");
      a.classList.add('d-none')
      a.href = downloadUrl;
      a.download = zaction.getOptions().zaction.blobName;
      document.body.appendChild(a);
      a.click();
    }

    callback && callback(drr, null)
  })
}

_zaction.prototype.handleZUrl = function(zaction, callback) {

  if (!zzb.types.isStringNotEmpty(zaction.getOptions().zurl)) {
    throw new Error('zurl not defined: tried zurl, href, action and src')
  }

  let isHandled = false
  switch (zaction.getOptions().zaction.event) {
    case 'zurl-dialog':
      handleZUrlDialog(zaction, callback)
      isHandled = true
      break
    case 'zurl-confirm': // show a confirmation dialog prior to running an action
      handleZUrlConfirm(zaction, callback)
      isHandled = true
      break
    case 'zurl-replace':
      handleZUrlReplace(zaction, callback)
      isHandled = true
      break
    case 'zurl-search':
      handleZUrlSearch(zaction, callback)
      isHandled = true
      break
    case 'zurl-action':
      handleZUrlAction(zaction, callback)
      isHandled = true
      break
    case 'zurl-field-update':
      handleZUrlAction(zaction, callback, true)
      isHandled = true
      break
    case 'zurl-blob-download':
      handleZUrlBlobDownload(zaction, callback)
      isHandled = true
      break
    case 'zurl-nav-tab':
      zaction.forceStopPropDef(true)
      if (zaction.isZUrl()) {
        isHandled = true
        let url = zaction.getOptions().zurl
        if (!(url.startsWith('http://') || url.startsWith('https://'))) {
          if (!url.startsWith('/')) {
            url = '/' + url
          }
          url = window.location.origin + url
        }
        window.open(url, '_blank');
      }
      callback && callback(null, null)
      break
    case 'zurl-nav-self':
    default:
      zaction.forceStopPropDef(true)
      if (zaction.isZUrl()) {
        isHandled = true
        window.location.href = zaction.getOptions().zurl
      }
      callback && callback(null, null)
      break
  }
  return isHandled
}

_zaction.prototype.runZLoadActions = function($parent) {
  if (!$parent) {
    $parent = document
  }
  let $elems = $parent.querySelectorAll('.zload-action')
  if ($elems) {
    $elems.forEach(function($elem) {

      $elem.addEventListener('zload-action', function(ev){
        zzb.zaction.actionHandler(ev, null, null)
      })

      $elem.dispatchEvent(new CustomEvent('zload-action'))
    })
  }
  zzb.zaction.loadZInputs($parent)
  if ($parent.tagName && zzb.types.isStringNotEmpty($parent.tagName)) {
    const $autoF = $parent.querySelector('.zui-autofocus')
    if ($autoF && zzb.types.isObject($autoF)) {
      $autoF.focus()
    }
  }
  $parent.querySelectorAll('.zzb-zui-navtab-buttons').forEach(function ($btns) {
    $btns.querySelectorAll('button').forEach(function ($elem) {
      const tabTrigger = new bootstrap.Tab($elem)
      $elem.addEventListener('click', function(ev) {
        ev.preventDefault()

        if ($elem.getAttribute('za1x') === "true") {
          // console.log('tab-za1x')
          tabTrigger.show()
          return
        }

        let zevent = $elem.getAttribute('za-event')
        if (!zzb.types.isStringNotEmpty(zevent)) {
          // console.log('tab-no-za-event')
          tabTrigger.show()
          return
        }

        $elem.setAttribute('za1x', 'true')

        zzb.zaction.actionHandler(ev, null, function(drr, err) {
          if (!err) {
            // console.log('tab-click!')
            tabTrigger.show()
          }
        })
      })
    })
  })
}

const cacheZInputs = {}

_zaction.prototype.loadZInputs = function($parent) {
  if (!$parent) {
    $parent = document
  }
  const fnToggle = function ($toggler, useDisabled, noChange) {
    if (noChange) {
      useDisabled ? $toggler.disabled = true : $toggler.classList.add('d-none')
    } else {
      useDisabled ? $toggler.disabled = false : $toggler.classList.remove('d-none')
    }
  }
  const fnUpdateToggler = function(id, $toggler, useDisabled) {
    let noChange = true
    for (const [ key, value ] of Object.entries(cacheZInputs[id].changes)) {
      if (value === false) {
        noChange = false
      }
    }
    fnToggle($toggler, useDisabled, noChange)
  }
  const fnFindFieldType = function($field) {
    let fldType = $field.getAttribute('type')
    return fldType ? fldType.toLowerCase() : $field.tagName.toLowerCase()
  }
  const fnDetectChanges = function($elem) {
    let id = $elem.getAttribute('id')
    if (!zzb.types.isStringNotEmpty(id)) {
      id = zzb.uuid.newV4().replace(/-/g, '')
      $elem.setAttribute('id', id)
    }
    let $toggler = document.getElementById($elem.getAttribute('ztoggler'))
    if (zzb.types.isObject($toggler)) {
      $toggler.setAttribute('zref-zinput-ptr', id)
      let useDisabled = $toggler.getAttribute('ztoggler-display') === 'disabled'
      fnToggle($toggler, useDisabled, true)
      cacheZInputs[id] = {originals:{},changes:{}}
      let $fields = $elem.querySelectorAll('.zinput-field')
      if ($fields) {
        $elem.querySelectorAll('.zinput-field').forEach(function($field) {
          const fldName = $field.getAttribute('name')
          if (zzb.types.isStringNotEmpty(fldName)) {
            const fldType = fnFindFieldType($field)
            if (fldType === 'checkbox' || fldType === 'radio') {
              cacheZInputs[id].originals[fldName] = $field.checked + ''
            } else {
              cacheZInputs[id].originals[fldName] = $field.value
            }
            let chEvent = $field.getAttribute('zinput-event')
            if (zzb.types.isStringEmpty(chEvent)) {
              chEvent = 'input'
            }
            const zInputEvent = $field.getAttribute('zinput-event')
            if (zInputEvent === 'change') {
              $field.addEventListener('change', function (e) {
                if (fldType === 'checkbox' || fldType === 'radio') {
                  cacheZInputs[id].changes[fldName] = cacheZInputs[id].originals[fldName] === this.checked + ''
                } else if (fldType === 'textarea') {
                  cacheZInputs[id].changes[fldName] = cacheZInputs[id].originals[fldName] === this.value
                } else {
                  cacheZInputs[id].changes[e.target.name] = cacheZInputs[id].originals[e.target.name] === e.target.value
                }
                fnUpdateToggler(id, $toggler, useDisabled)
              })
            } else {
              $field.addEventListener('input', function(e) {
                cacheZInputs[id].changes[e.target.name] = cacheZInputs[id].originals[e.target.name] === e.target.value
                fnUpdateToggler(id, $toggler, useDisabled)
              })
            }
          }
        })
      }
    }
  }
  if ($parent.tagName && $parent['classList'] && $parent.classList.contains('zinput')) {
    fnDetectChanges($parent)
  } else {
    let $elems = $parent.querySelectorAll('.zinput')
    if ($elems) {
      $elems.forEach(function($elem) {
        fnDetectChanges($elem)
      })
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {

  let $body = document.querySelector('body')
  if ($body) {
    if ($body.getAttribute('no-autoload-zactions') === 'true') {
      return
    }
    // $body.getAttribute('zactions-wait-check' === 'true') {
    //         // The issue is preventing multiple events to be attached to a single element.
    //         // Current solution:
    //         // 1. The attribute "za1x" (=zaction 1x only) checks if zaction has been applied to an element.
    //         //    Future: optionally inside addEventListeners, can add flag to not add the za1x check.
    //         // Other solutions:
    //         // 2. Add a timer on an interval to run addEventListeners only when other libs have finished loading,
    //         //    indicated by a conditional attribute on the body (eg proceed) or stopWait function on zaction.
    //         //    BUT #2 may not ever be needed anyways. Other libs can register handlers when their js loads which is then
    //         //    available immediately and prior to DOMContentLoaded. (script tags are processed before DOMContentLoaded)
    //         return
    // }
    zzb.zaction.addEventListeners('.zaction')
  }

  zzb.zaction.runZLoadActions()

}, false);

exports.j = _zaction


/***/ }),

/***/ 204:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// _zui
// ---------------------------------------------------

const _zui = function () {
  this.zsplitters = {}
  this.elemIniters = []
  this.defaultRWidth = 576 // default responsive width
  this.handlers = []
}

_zui.prototype.getDefaultRWdith = function () {
  return this.defaultRWidth
}

// RESPONSIVE CHECK
function getViewport () {
  // https://stackoverflow.com/a/8876069
  const width = Math.max(
    document.documentElement.clientWidth, window.innerWidth || 0
  )
  return width
  // if (width <= 576) return 576 // 'xs'
  // if (width <= 768) return 768 // 'sm'
  // if (width <= 992) return 992 // 'md'
  // if (width <= 1200) return 1200 // 'lg'
  // return 99999 // 'xl'
}

_zui.prototype.isViewportGTRSize = function (rsize) {
  if (!zzb.types.isNumber(rsize) || rsize <= 0) {
    rsize = this.defaultRWidth
  }
  return (getViewport() > rsize)
}

_zui.prototype.getZUICache = function () {
  let c = {zsplitter:{}}
  try {
    let s = localStorage.getItem('zuiC')
    if (zzb.types.isStringNotEmpty(s)) {
      let o = JSON.parse(s)
      if (zzb.types.isObject(o)) {
        // console.log('c-saved', o.zsplitter)
        return zzb.types.merge(c, o)
      }
    }
  } catch (e) {
    console.log(e)
  }
  // console.log('c-new', c)
  return c
}

_zui.prototype.setZUICache = function (zuiC) {
  localStorage.setItem('zuiC', JSON.stringify(zuiC))
}

_zui.prototype.removeZUICache = function () {
  localStorage.removeItem('zuiC')
}

_zui.prototype.registerZSplitterResize = function (options) {
  let handler = new zzb.zaction.ZActionHandler(options)
  for (let ii = 0; ii < this.handlers.length; ii++) {
    if (this.handlers[ii].getId() === handler.id) {
      this.handlers[ii] = handler
      return
    }
  }
  this.handlers.push(handler)
}

_zui.prototype.triggerZSplitterResize = function () {
  for (let ii = 0; ii < this.handlers.length; ii++) {
    this.handlers[ii].getHandler()()
  }
}

function setZUICacheZSplitter(zsplitter) {
  if (zsplitter && zzb.types.isStringNotEmpty(zsplitter.id)) {
    try {
      let zuiC = zzb.zui.getZUICache()
      zuiC.zsplitter[zsplitter.id] = zsplitter
      zzb.zui.setZUICache(zuiC)
    } catch (e) {
      console.log(e)
    }
  }
}

function initZSplitter($resizer, direction, arrToggableWidths) {
  let zsplitter = zzb.dom.getAttributes($resizer, /^zsplitter-/, 10)
  zsplitter.id = $resizer.getAttribute('id')

  let usingCache = zzb.types.isStringNotEmpty(zsplitter.id)
  let isCacheNew = true
  if (usingCache) {
    let zuiC = zzb.zui.getZUICache()
    isCacheNew = (!zuiC.zsplitter[zsplitter.id])
    if (isCacheNew) {
      zuiC.zsplitter[zsplitter.id] = zsplitter
      zzb.zui.setZUICache(zuiC)
    } else {
      zsplitter = zuiC.zsplitter[zsplitter.id]
    }
  }

  if (zsplitter.show !== 'open' && zsplitter.show !== 'close') {
    zsplitter.show = null
  }

  if (zzb.types.isStringNotEmpty(zsplitter.rsize)) {
    zsplitter.rsize = Number(zsplitter.rsize)
  }
  if (!zzb.types.isNumber(zsplitter.rsize) || zsplitter.rsize < 0) {
    zsplitter.rsize = zzb.zui.getDefaultRWdith()
  }

  const setCacheZSplitter = function(state) {
    if (usingCache) {
      zsplitter.show = state
      setZUICacheZSplitter(zsplitter)
      // console.log(state)
    }
  }

  let doRSizeOpen = zzb.zui.isViewportGTRSize(zsplitter.rsize) // (getViewport() > zsplitter.rsize)
  if (usingCache && isCacheNew && !doRSizeOpen) {
    if (zsplitter.show === 'open') {
      setCacheZSplitter('close')
    }
  } else if (!usingCache && !doRSizeOpen) {
    zsplitter.show = 'close'
  }
  // console.log('responsive-check', zsplitter, 'doRSizeShow=' + doRSizeOpen)


  if (!arrToggableWidths) {
    arrToggableWidths = []
  } else if (!Array.isArray(arrToggableWidths)) {
    arrToggableWidths = arrToggableWidths.split(',')
  }
  function isCharNumber(c) {
    return c >= '0' && c <= '9';
  }
  for (let ii = 0; ii < arrToggableWidths.length; ii++) {
    if (isCharNumber(arrToggableWidths[ii].slice(-1))) {
      if (arrToggableWidths[ii] !== '') {
        arrToggableWidths[ii] += 'px'
      }
    }
  }

  // set the id, if not present
  if (!usingCache) {
    $resizer.id = 'zsplitter' + zzb.zui.getZSplitters().length + direction
  }

  // "left" or "right"
  const $targetSide = (direction === 'left' ? $resizer.previousElementSibling : $resizer.nextElementSibling)
  const $altSide = (direction === 'left' ? $resizer.nextElementSibling : $resizer.previousElementSibling)

  let idxWidthStatic = 0
  function setStaticWidth() {
    if (arrToggableWidths.length > 0) {
      if (!arrToggableWidths[idxWidthStatic].endsWith('%')) {
        $targetSide.style.width = arrToggableWidths[idxWidthStatic]
      } else {
        let pwidth = 0
        let total = 0
        try {
          let pwidth = parseFloat(arrToggableWidths[idxWidthStatic].slice(0, -1)) / 100
          let total = $resizer.getBoundingClientRect().width + $targetSide.getBoundingClientRect().width + $altSide.getBoundingClientRect().width
          // console.log($resizer.parentNode.getBoundingClientRect().width, $resizer.getBoundingClientRect().width, $targetSide.getBoundingClientRect().width, $altSide.getBoundingClientRect().width, total, total / 2, $resizer.parentNode.getBoundingClientRect().width - total)
          $targetSide.style.width = (total * pwidth) + 'px'
        } catch {
          console.log('failed to set targetSide width', pwidth, total)
          $targetSide.style.width = '200px'
        }
      }
    }
  }

  setStaticWidth()

  $resizer.querySelectorAll('[zsplitter-toggable]').forEach(function($elem) {
    $elem.addEventListener('click', function (ev) {
      ev.preventDefault();

      idxWidthStatic++

      if (idxWidthStatic < arrToggableWidths.length) {
        setCacheZSplitter('open')
        setStaticWidth()
      } else if (idxWidthStatic === arrToggableWidths.length) {
        setCacheZSplitter('close')
        idxWidthStatic = -1
        $targetSide.style.width = '0'
      }

      zzb.zui.triggerZSplitterResize()

    }, false);
  })

  // Logic to auto-show (or not)
  // 1. Must have valid width (eg arrToggableWidths.length > 0)
  // 2. Use value from zsplitter-show="true" ("false").
  //    a. if not found, examine class on $resizer for 'd-none'
  //    b. if not found, examine class on $targetSide for 'd-none'
  let doReveal = arrToggableWidths.length > 0
  let doOpenOrClose = zsplitter.show === 'open' || zsplitter.show === 'close'
  if (doOpenOrClose) {
    if (zsplitter.show === 'close') {
      $targetSide.style.width = 0
      idxWidthStatic = -1
    }
    if (doReveal) {
      $resizer.classList.remove('d-none')
      $targetSide.classList.remove('d-none')
    } else {
      $resizer.classList.add('d-none')
      $targetSide.classList.add('d-none')
    }
  }

  let obj = zzb.zui.getZSplitter($resizer.id)
  obj.toggle = function(state) {
    if (state === 'open') {
      idxWidthStatic = 0
      $resizer.classList.remove('d-none')
      $targetSide.classList.remove('d-none')
      setCacheZSplitter(state)
      setStaticWidth()
    } else if (state === 'close') {
      $targetSide.style.width = 0
      idxWidthStatic = -1
      $resizer.classList.remove('d-none')
      $targetSide.classList.remove('d-none')
      setCacheZSplitter(state)
    } else if (state === 'dismiss') {
      idxWidthStatic = -1
      $resizer.classList.add('d-none')
      $targetSide.classList.add('d-none')
    }
    zzb.zui.triggerZSplitterResize()
  }

  zzb.zui.setZSplitter($resizer.id, obj)

  // The current position of mouse
  let x = 0;
  let y = 0;
  let targetWidth = 0;

  // Handle the mousedown event
  // that's triggered when user drags the resizer
  const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    targetWidth = $targetSide.getBoundingClientRect().width;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    const dmod = (direction === 'left' ? 1 : -1)

    const newTargetWidth = ((targetWidth + dx * dmod) * 100) / $resizer.parentNode.getBoundingClientRect().width;
    $targetSide.style.width = `${newTargetWidth}%`;

    $resizer.style.cursor = 'col-resize';
    document.body.style.cursor = 'col-resize';

    $targetSide.style.userSelect = 'none';
    $targetSide.style.pointerEvents = 'none';

    $altSide.style.userSelect = 'none';
    $altSide.style.pointerEvents = 'none';

    zzb.zui.triggerZSplitterResize()
  };

  const mouseUpHandler = function () {
    $resizer.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');

    $targetSide.style.removeProperty('user-select');
    $targetSide.style.removeProperty('pointer-events');

    $altSide.style.removeProperty('user-select');
    $altSide.style.removeProperty('pointer-events');

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);

    zzb.zui.triggerZSplitterResize()
  };

  // Attach the handler
  $resizer.addEventListener('mousedown', mouseDownHandler);
}

_zui.prototype.getZSplitter = function(id) {
  let obj = this.zsplitters[id]
  if (obj) {
    return obj
  }
  return {toggle: null}
}

_zui.prototype.setZSplitter = function(id, obj) {
  if (id && obj) {
    this.zsplitters[id] = obj
  }
}

_zui.prototype.toggleZSplitterById = function(id, state) {
  let $elem = document.getElementById(id)
  if ($elem) {
    let obj = zzb.zui.getZSplitter($elem.id)
    obj.toggle(state)
  }
}

_zui.prototype.onLoadInit = function() {
  document.querySelectorAll('.zsplitter').forEach(function($elem) {
    Array.from($elem.attributes).forEach(attr => {
      switch (attr.nodeName) {
        case 'zsplitter-left':
          initZSplitter($elem, 'left', attr.nodeValue)
          return true
        case 'zsplitter-right':
          initZSplitter($elem, 'right', attr.nodeValue)
          return true
        default:
          break
      }
    })
  });
  zzb.zui.triggerZSplitterResize()
  document.querySelectorAll('.zuit-eo').forEach(function($elem) {
    let e1 = $elem.getAttribute('zuitEO1')
    if (zzb.types.isStringNotEmpty(e1)) {
      let e2 = $elem.getAttribute('zuitEO2')
      if (zzb.types.isStringNotEmpty(e2)) {
        $elem.innerHTML = e1 + '@' + e2
      }
    }
  });
  document.querySelectorAll('.zuit-year').forEach(function($elem) {
    $elem.innerHTML = new Date().getFullYear()
  });
  document.querySelectorAll('.zpagenohistory').forEach(function($elem) {
    history.pushState(null, null, location.href);
    history.back();
    history.forward();
    window.onpopstate = function () { history.go(1); };
  });
}

const enLocale = {
  date: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    clear: 'Clear',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'hh:mm aa',
    firstDay: 0
  }
}

_zui.prototype.setLocale = function(locale) {
  this.locale = locale
}

_zui.prototype.getLocale = function(locale, callback) {
  if (!callback) {
    throw new Error('no callback defined for getLocale')
  }
  if (this.locale) {
    callback(this.locale)
  } else {
    let myLocale = enLocale
    zzb.zui.setLocale(myLocale)
    callback(myLocale)
  }
}

_zui.prototype.setElemIniter = function(target) {
  let initer = zzb.types.merge({name:null, fn: null}, target)
  if (initer.name && initer.fn) {
    let isFound = false
    for (let ii = 0; ii < this.elemIniters.length; ii++) {
      if (this.elemIniters[ii].name === initer.name) {
        this.elemIniters[ii] = intiter
        isFound = true
        break
      }
    }
    if (!isFound) {
      this.elemIniters.push(initer)
    }
  }
}

_zui.prototype.onElemInit = function($elem) {
  if (!$elem) {
    $elem = document.body
  }

  for (let ii = 0; ii < this.elemIniters.length; ii++) {
    this.elemIniters[ii].fn($elem)
  }

  // Autocomplete
  // Fork: https://github.com/jpfluger/bootstrap-5-autocomplete
  // Derived from: https://github.com/gch1p/bootstrap-5-autocomplete
  if (typeof Autocomplete !== 'undefined') {
    let $elems = document.querySelectorAll('.zautocomplete')
    if ($elems && $elems.length > 0) {
      $elems.forEach(function ($elem) {

        // let opts = zzb.zaction.newZClosest($elem, null, null, null)
        // opts.data = []
        // opts.locale = 'en'
        // opts.maximumItems = 7
        // opts.threshold = 3
        // let opts = zzb.types.merge(opts, zzb.dom.getAttributes($elem, /^zacom-/, 6))
        let opts = zzb.types.merge({
          data: [],
          locale: 'en',
          maximumItems: 7,
          threshold: 3,
          zurl: $elem.getAttribute('zurl'),
          zmod: $elem.getAttribute('zmod'),
        }, zzb.dom.getAttributes($elem, /^zacom-/, 6))
        if (!zzb.types.isArray(opts.data)) {
          opts.data = []
        }
        opts.maximumItems = zzb.strings.parseIntOrZero(opts.maximumItems)
        if (opts.maximumItems <= 0) {
          opts.maximumItems = 7
        }
        opts.threshold = zzb.strings.parseIntOrZero(opts.threshold)
        if (opts.threshold <= 0) {
          opts.threshold = 3
        }
        if (!zzb.types.isStringNotEmpty(opts.zurl)) {
          console.log('zautocomplete zurl not found')
          return
        }
        if (zzb.types.isStringNotEmpty(opts.zmod)) {
          opts.zurl = opts.zurl.replace(':mod', opts.zmod)
        }

        const ac = new Autocomplete($elem, {
          // data: [{label: "One", value: 1},{label: "OneOne", value: 11},{label: "Two", value: 2},{label: "Three", value: 3}],
          // maximumItems: 7,
          // threshold: 1,
          data: opts.data,
          locale: opts.locale,
          maximumItems: opts.maximumItems,
          threshold: opts.threshold,
          onSelectItem: function(label, value){
            // console.log("user selected:", label, value);
          },
          onInput: function (inData) {
            zzb.ajax.postJSON({url: opts.zurl, body: {input: inData, limit: opts.maximumItems}}, function(drr, err) {
              if (err || !drr.rob.hasRecords()) {
                return
              }
              // console.log(drr.rob.recs)
              ac.setData(drr.rob.recs)
            })
          }
        });

      })
    }
  }

  // Date/Time Picker
  // https://air-datepicker.com/
  if (typeof AirDatepicker !== 'undefined') {
    let $elems = document.querySelectorAll('.zdate-picker')
    if ($elems) {
      // Server should be in UTC. Data in value field transmitted to client is UTC, format ISO 8601.
      // https://tc39.es/ecma262/#sec-date-time-string-format
      // https://toastui.medium.com/handling-time-zone-in-javascript-547e67aa842d
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
      // Date.parse("2019-01-01") -> defaults to UTC according to ES5
      // *Best: Date.parse("2019-01-01T00:00:00.000Z") -> specifies UTC
      // Date.parse("2019-01-01T00:00:00.000+00:00") -> specifies UTC
      // Date.parse("2019-01-01T00:00:00") -> defaults to local
      $elems.forEach(function ($elem) {
        // zdate-value = If 'now', then a new Date in local time-zone is created.
        // zdate-locale = The locale to use. default is "en" (English).
        // zdate-auto-close = [ "true" | "false" ] = If false, do not automatically close the calendar pop-up after the date is selected. Default is "true".
        // zdate-use-iso-val = [ "true" | "false" ] = If false, do not use ISO dates but default to whatever the Picker selects. Default is "false" unless 'zf-type="date-iso".
        let dtAttribs = zzb.types.merge({
          value: zzb.dom.getAttributeElse($elem, 'value', null),
          locale: 'en',
          autoClose: true,
          useISOVal: zzb.dom.getAttributeElse($elem, 'zf-type', null) === 'date-iso',
          addBtnToday: true,
          addBtnClear: true,
          autoEvInput: false,
          autoEvBlur: false,
        }, zzb.dom.getAttributes($elem, /^zdate-/, 6))
        dtAttribs.autoClose = zzb.strings.toBool(dtAttribs.autoClose)
        dtAttribs.addBtnToday = zzb.strings.toBool(dtAttribs.addBtnToday)
        dtAttribs.addBtnClear = zzb.strings.toBool(dtAttribs.addBtnClear)
        dtAttribs.autoEvInput = zzb.strings.toBool(dtAttribs.autoEvInput)
        dtAttribs.autoEvBlur = zzb.strings.toBool(dtAttribs.autoEvBlur)

        let dpButtons = []
        if (dtAttribs.addBtnToday) {
          dpButtons.push('today')
        }
        if (dtAttribs.addBtnClear) {
          dpButtons.push('clear')
        }

        // Update the date if an input field.
        let isInput = ($elem.nodeName === 'INPUT')
        let dtCache = null

        const mycfval = $elem.getAttribute('zf-cval')
        if (zzb.types.isStringNotEmpty(dtAttribs.value)) {
          if (!zzb.types.isStringNotEmpty(mycfval)) {
            dtCache = (dtAttribs.value === 'now' ? new Date() : new Date(Date.parse(dtAttribs.value)))
            zzb.dom.setAttribute($elem, 'zdate-value', '')
          }
        }
        if (zzb.types.isStringNotEmpty(mycfval)) {
          dtCache = (dtAttribs.value === 'now' ? new Date() : new Date(Date.parse(mycfval)))
        }

        let name = zzb.dom.getAttributeElse($elem, 'name', null)

        zzb.zui.getLocale(dtAttribs.locale, function(myLocale) {
          let adp = new AirDatepicker($elem, {
            locale: myLocale.date,
            autoClose: dtAttribs.autoClose,
            buttons: dpButtons,
            onSelect: function (ops) {
              if (isInput) {
                //console.log(ops, dtAttribs, ops.date.toISOString(), ops.date.getTimezoneOffset())
                if (dtAttribs.useISOVal) {
                  //zzb.dom.setAttribute($elem, 'value', ops.date.toISOString())
                  if (name && ops && ops.date) {
                    // Set the cached value, which overrides the AirPicker value on form submit.
                    zzb.dom.setAttribute($elem, 'zf-cval', ops.date.toISOString())
                    // console.log(name, 'onSelect', ops.date.toISOString())
                  }
                }
              }
            }
          })
          if (dtCache) {
            adp.selectDate(dtCache)
            // console.log('adp.selectDate dtCache', dtCache)
          }
          if (!luxon) {
            if (dtAttribs.autoEvInput === true || dtAttribs.autoEvBlur === true) {
              console.log('advanced date processing using "luxon.js"')
            }
          } else {
            // Ref: https://github.com/t1m0n/air-datepicker/issues/41
            if (dtAttribs.autoEvInput === true) {
              $elem.addEventListener('input', function(evt) {
                const vInput = $elem.value
                if (zzb.types.isNonEmptyString(vInput)) {
                  // is vInput valid?
                  let vTemp = luxon.DateTime.fromFormat(vInput, myLocale.date.dateFormat)
                  if (vTemp.isValid) {
                    // console.log('input-isValid', vTemp.toJSDate())
                    adp.selectDate(vTemp.toJSDate())
                  }
                }
              })
            }
            if (dtAttribs.autoEvBlur === true) {
              $elem.addEventListener('blur', function(evt) {
                const vPick = $elem.getAttribute('zf-cval')
                const vInput = $elem.value

                // console.log('onBlur', vPick, vInput, adp.viewDate.toISOString())

                let vTemp = luxon.DateTime.fromFormat(vInput, myLocale.date.dateFormat)
                if (!vTemp.isValid) {
                  zzb.dom.setAttribute($elem, 'zf-cval', '')
                  $elem.value = ''
                }
              })
            }
          }
        })
      })
    }
  }
}

_zui.prototype.onZLoadSection = function($elem, isCustom) {
  if (!$elem) {
    $elem = document.body
  }
  // Have a catch22 situation.
  // Custom actions at a higher-level need to be created prior to the calling of `zloadsection`. How to resolve?
  // When `isCustom` is `false`, then run `zloadsection` otherwise run `zloadsection-custom`.
  let classZInterval = 'zinterval' + (isCustom === true ? '-custom' : '')
  $elem.querySelectorAll('.' + classZInterval).forEach(function($elem) {
    $elem.classList.remove(classZInterval)
    if ($elem.classList.contains('zaction')) {
      //console.log('clicking ' + classZInterval)
      zzb.time.newUIInterval($elem)
    }
  })
  // `zloadsection` must come after zinterval otherwise data-caching will break.
  let classZLoadSection = 'zloadsection' + (isCustom === true ? '-custom' : '')
  $elem.querySelectorAll('.' + classZLoadSection).forEach(function($elem) {
    $elem.classList.remove(classZLoadSection)
    if ($elem.classList.contains('zaction')) {
      //console.log('clicking ' + classZLoadSection)
      $elem.click()
    }
  })
}

document.addEventListener('DOMContentLoaded', function () {
  zzb.zui.onLoadInit()
  zzb.zui.onElemInit()
  zzb.zui.onZLoadSection(null)
}, false);

exports.T = _zui


/***/ }),

/***/ 856:
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

  const _types = (__webpack_require__(305)/* .types */ .g)

  // ---------------------------------------------------
  // uuid
  // ---------------------------------------------------

  const _uuid = (__webpack_require__(169)/* .uuid */ .u)

  // ---------------------------------------------------
  // strings
  // ---------------------------------------------------

  const _strings = (__webpack_require__(462)/* .strings */ .P)

  // ---------------------------------------------------
  // _dom
  // ---------------------------------------------------

  const _dom = (__webpack_require__(636)/* .dom */ .t)

  // ---------------------------------------------------
  // _time
  // ---------------------------------------------------

  const _time = (__webpack_require__(247)/* .time */ .k)

  // ---------------------------------------------------
  // _dialogs
  // ---------------------------------------------------

  const _dialogs = (__webpack_require__(149)/* .dialogs */ .i)

  // ---------------------------------------------------
  // _perms (Permission Keys)
  // ---------------------------------------------------

  const _perms = (__webpack_require__(531)/* .perms */ .k)

  // ---------------------------------------------------
  // _rob (Return Object)
  // ---------------------------------------------------

  const _rob = (__webpack_require__(628)/* .rob */ .I)

  // ---------------------------------------------------
  // _ajax
  // ---------------------------------------------------

  const _ajax = (__webpack_require__(964)/* .ajax */ .R)

  // ---------------------------------------------------
  // _zaction
  // ---------------------------------------------------

  const _zaction = (__webpack_require__(168)/* .zaction */ .j)

  // ---------------------------------------------------
  // _zui
  // ---------------------------------------------------

  const _zui = (__webpack_require__(204)/* .zui */ .T)

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
  // time functions
  _zzb.prototype.time = new _time()
  // dialog functions
  _zzb.prototype.dialogs = new _dialogs()
  // _perms
  _zzb.prototype.perms = new _perms() // {types: _types})
  // rob (==return object)
  _zzb.prototype.rob = new _rob() // {types: _types})
  // ajax helpers with promises
  _zzb.prototype.ajax = new _ajax() // {rob: _rob, types: _types})
  // ui action helpers linking elements to event listeners
  _zzb.prototype.zaction = new _zaction()
  // ui element extras
  _zzb.prototype.zui = new _zui()

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
/******/ 	var __webpack_exports__ = __webpack_require__(856);
/******/ 	
/******/ })()
;