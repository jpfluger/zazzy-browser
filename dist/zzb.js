//! zzb.js v2.9.1 (https://github.com/jpfluger/zazzy-browser)
//! MIT License; Copyright 2017-2023 Jaret Pfluger
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

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

/***/ 247:
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

/***/ 305:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// types
// ---------------------------------------------------

// A utility constructor providing type-checking,
// string-conversion, and object-manipulation methods.
function _types () {}

/**
 * Deeply merges two objects into a new object.
 * Properties from `newOptions` override those in `defaultOptions`.
 *
 * @param {Object} defaultOptions - The object providing default values.
 * @param {Object} newOptions - The object containing properties to override defaults.
 * @returns {Object} - A new object resulting from a deep merge of provided objects.
 */
_types.prototype.merge = function(defaultOptions, newOptions) {
  return deepMerge({}, defaultOptions, newOptions);
};

/**
 * Recursively merges multiple source objects into a target object.
 * Nested objects are merged deeply; other types overwrite directly.
 *
 * @param {Object} target - The target object to merge into.
 * @param {...Object} sources - One or more source objects.
 * @returns {Object} - The merged target object.
 */
function deepMerge(target, ...sources) {
  sources.forEach(source => {
    if (!source || typeof source !== 'object') return;
    Object.keys(source).forEach(key => {
      const value = source[key];
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        target[key] = deepMerge(target[key] || {}, value);
      } else {
        target[key] = value;
      }
    });
  });
  return target;
}

/**
 * Truncates a number to a specific number of decimal places without rounding.
 *
 * @param {number} num - The number to truncate.
 * @param {number} decimal - The number of decimal places to retain.
 * @returns {string} - The truncated number represented as a string.
 */
_types.prototype.truncate = function(num, decimal) {
  if (typeof num !== 'number' || typeof decimal !== 'number' || decimal < 0) return '';
  const numString = num.toString();
  const decimalIndex = numString.indexOf('.');
  if (decimalIndex === -1 || decimal === 0) return numString.split('.')[0];
  return numString.substring(0, decimalIndex + decimal + 1);
};

/**
 * Escapes special HTML characters in a given string to their corresponding HTML entities.
 *
 * @param {string} unsafe - The string containing potentially unsafe HTML characters.
 * @returns {string} - The safely escaped string, or empty string if input is invalid.
 */
_types.prototype.escapeHtml = function (unsafe) {
  if (typeof unsafe !== 'string') return '';
  const replacements = {
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    '\'':'&#039;'
  };
  return unsafe.replace(/[&<>"']/g, char => replacements[char]);
};

/**
 * Converts a given value to a primitive string.
 * - Returns empty string ('') if value is null or undefined.
 * - Converts numbers, booleans, objects, and other types using standard coercion.
 * - All zeros are represented simply as "0".
 *
 * @param {*} value - The value to convert to string.
 * @returns {string} - The primitive string representation.
 */
_types.prototype.baseToString = function(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return '' + value;
  }
  if (value == null) { // handles null or undefined
    return '';
  }
  return '' + value;
};

/**
 * Converts a value to a primitive string.
 * Returns empty string if value is null or undefined.
 *
 * @param {*} s - The value to convert to a string.
 * @returns {string} - The converted primitive string.
 */
_types.prototype.toString = function (s) {
  return s == null ? '' : zzb.types.baseToString(s);
};

/**
 * Checks if the provided value is an array.
 *
 * @param {*} o - The value to check.
 * @returns {boolean} - True if value is an array, false otherwise.
 */
_types.prototype.isArray = function (o) {
  return Array.isArray(o);
};

/**
 * Checks if the provided value is an array containing at least one element.
 *
 * @param {*} o - The value to check.
 * @returns {boolean} - True if the value is a non-empty array, false otherwise.
 */
_types.prototype.isArrayHasRecords = function (o) {
  return zzb.types.isArray(o) && o.length > 0;
};

/**
 * Checks if the provided value is a plain object (not an array, null, or other type).
 *
 * @param {*} o - The value to check.
 * @returns {boolean} - True if the value is a plain object, false otherwise.
 */
_types.prototype.isObject = function (o) {
  return o !== null && typeof o === 'object' && !Array.isArray(o);
};

/**
 * Checks if the provided value is a valid number (excluding NaN).
 *
 * @param {*} o - The value to check.
 * @returns {boolean} - True if the value is a valid number, false otherwise.
 */
_types.prototype.isNumber = function (o) {
  return typeof o === 'number' && !isNaN(o);
};

/**
 * Checks if the provided value is a string with non-whitespace characters.
 *
 * @param {*} s - The value to check.
 * @returns {boolean} - True if the value is a non-empty string, false otherwise.
 */
_types.prototype.isStringNotEmpty = function (s) {
  return typeof s === 'string' && s.trim().length > 0;
};

/**
 * Checks if the provided value is an empty string or contains only whitespace.
 *
 * @param {*} s - The value to check.
 * @returns {boolean} - True if the value is an empty or whitespace-only string, false otherwise.
 */
_types.prototype.isStringEmpty = function (s) {
  return typeof s === 'string' && s.trim().length === 0;
};

/**
 * Checks if the provided value is a string type.
 *
 * @param {*} s - The value to check.
 * @returns {boolean} - True if the value is a string, false otherwise.
 */
_types.prototype.isString = function (s) {
  return typeof s === 'string';
};

/**
 * Checks if the provided value is a function.
 *
 * @param {*} fn - The value to check.
 * @returns {boolean} - True if the value is a function, false otherwise.
 */
_types.prototype.isFunction = function (fn) {
  return typeof fn === 'function';
};

/**
 * Checks if the provided value is a boolean.
 *
 * @param {*} b - The value to check.
 * @returns {boolean} - True if the value is a boolean, false otherwise.
 */
_types.prototype.isBoolean = function (b) {
  return typeof b === 'boolean';
};

/**
 * Checks if a given value is a single numeric digit (0–9).
 *
 * Accepts string, number, or other types. Only returns true for:
 * - A single character string containing a digit ('0'–'9')
 * - A number between 0 and 9 inclusive with no decimals
 *
 * Examples:
 *   isDigit('5')     → true
 *   isDigit(3)       → true
 *   isDigit('a')     → false
 *   isDigit('42')    → false
 *   isDigit(null)    → false
 *   isDigit(5.5)     → false
 *
 * @param {*} val - The value to check.
 * @returns {boolean} - True if the value is a single digit, false otherwise.
 */
_types.prototype.isDigit = function (val) {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val >= 0 && val <= 9;
  }
  if (typeof val === 'string' && val.length === 1) {
    return val >= '0' && val <= '9';
  }
  return false;
};

/**
 * Compares two values and returns:
 * - 0 if values are strictly equal.
 * - 1 if the first value is greater (ascending) or smaller (descending).
 * - -1 if the first value is smaller (ascending) or greater (descending).
 *
 * Special handling:
 * - Considers `null` less than any other value except `undefined`.
 * - Considers `undefined` as less than any other value.
 *
 * @param {*} x - The first value to compare.
 * @param {*} y - The second value to compare.
 * @param {boolean} [isDesc=false] - If true, compares in descending order.
 * @returns {number} Comparison result: 0, 1, or -1.
 */
_types.prototype.compare = function (x, y, isDesc = false) {
  if (x === y) return 0;

  if (x === undefined) return isDesc ? 1 : -1;
  if (y === undefined) return isDesc ? -1 : 1;
  if (x === null) return isDesc ? 1 : -1;
  if (y === null) return isDesc ? -1 : 1;

  if (isDesc) {
    return x > y ? -1 : 1;
  }
  return x > y ? 1 : -1;
};

const TYPE_ALIASES = {
  int: "integer",
  integer: "integer",
  str: "string",
  string: "string",
  bool: "boolean",
  boolean: "boolean",
  float: "float",
  number: "float",
  obj: "object",
  object: "object",
  null: "null"
};

/**
 * Normalizes a type string to a canonical type alias.
 *
 * Converts common shorthand or alternative type names like "int", "str", or "bool"
 * into consistent internal representations such as "integer", "string", or "boolean".
 *
 * Supported aliases:
 * - int, integer → "integer"
 * - str, string → "string"
 * - bool, boolean → "boolean"
 * - float, number → "float"
 * - obj, object → "object"
 * - null → "null"
 *
 * If the type is unrecognized, returns the original input string.
 *
 * @param {*} typeStr - The type to normalize. If not a string, it is stringified.
 * @returns {string} Normalized type string.
 */
_types.prototype.normalizeType = function normalizeType(typeStr) {
  if (typeof typeStr !== "string") {
    typeStr = String(typeStr ?? "string");
  }
  return TYPE_ALIASES[typeStr.toLowerCase()] || typeStr;
}

/**
 * Compares two values based on the specified type.
 * Supports integer, float, IP (v4/v6), and text types.
 *
 * @param {*} a - The first value to compare.
 * @param {*} b - The second value to compare.
 * @param {string} type - The comparison type ('int', 'float', 'ip', 'ipv4', 'ipv6', 'text').
 * @returns {number} - Comparison result: -1, 0, or 1.
 */
_types.prototype.compareValues = function(a, b, type) {
  switch (type) {
    case 'int':
      return parseInt(a, 10) - parseInt(b, 10);
    case 'float':
      return parseFloat(a) - parseFloat(b);
    case 'ip':
    case 'ipv4':
    case 'ipv6':
      return this.compareIP(a, b);
    case 'text':
    default:
      return (a || '').toString().toLowerCase().localeCompare((b || '').toString().toLowerCase());
  }
};

/**
 * Compares two IP addresses, determining whether they are IPv4 or IPv6,
 * and then delegating to the appropriate comparison function.
 *
 * Mixed-type comparison treats IPv4 as lower than IPv6.
 *
 * @param {string} a - First IP address.
 * @param {string} b - Second IP address.
 * @returns {number} - Comparison result: -1, 0, or 1.
 */
_types.prototype.compareIP = function(a, b) {
  const aType = this.detectIPType(a);
  const bType = this.detectIPType(b);

  if (aType === 'ipv4' && bType === 'ipv4') return this.compareIPv4(a, b);
  if (aType === 'ipv6' && bType === 'ipv6') return this.compareIPv6(a, b);
  return aType === 'ipv4' ? -1 : 1;
};

/**
 * Detects whether a string represents an IPv4 or IPv6 address.
 *
 * @param {string} ip - The IP address to classify.
 * @returns {string} - Either 'ipv4', 'ipv6', or 'unknown'.
 */
_types.prototype.detectIPType = function(ip) {
  if (ip.includes('.')) return 'ipv4';
  if (ip.includes(':')) return 'ipv6';
  return 'unknown';
};

/**
 * Compares two IPv4 addresses by their numeric octet values.
 *
 * @param {string} a - First IPv4 address.
 * @param {string} b - Second IPv4 address.
 * @returns {number} - Comparison result: -1, 0, or 1.
 */
_types.prototype.compareIPv4 = function(a, b) {
  const aParts = a.split('.').map(n => parseInt(n, 10) || 0);
  const bParts = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 4; i++) {
    if (aParts[i] < bParts[i]) return -1;
    if (aParts[i] > bParts[i]) return 1;
  }
  return 0;
}

/**
 * Compares two IPv6 addresses after expanding their shorthand notation.
 *
 * @param {string} a - First IPv6 address.
 * @param {string} b - Second IPv6 address.
 * @returns {number} - Comparison result: -1, 0, or 1.
 */
_types.prototype.compareIPv6 = function (a, b) {
  const aParts = normalizeIPv6(a);
  const bParts = normalizeIPv6(b);

  for (let i = 0; i < 8; i++) {
    const aVal = parseInt(aParts[i], 16);
    const bVal = parseInt(bParts[i], 16);
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
  }
  return 0;
};

function normalizeIPv6(ip) {
  const parts = ip.split('::');
  let head = parts[0] ? parts[0].split(':') : [];
  let tail = parts[1] ? parts[1].split(':') : [];

  // Normalize each segment to 4-digit hex
  head = head.map(h => h.padStart(4, '0'));
  tail = tail.map(h => h.padStart(4, '0'));

  const fill = new Array(8 - head.length - tail.length).fill('0000');
  return [...head, ...fill, ...tail];
}

exports.g = _types


/***/ }),

/***/ 462:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// strings
// ---------------------------------------------------

const _strings = function () {}

/**
 * Creates a flexible string formatting function with support for:
 * - Positional and named placeholders
 * - Nested property access (e.g., {user.name})
 * - Optional value transformers (e.g., {0!upper})
 * - Escape sequences for literal braces (e.g., {{ and }})
 *
 * Usage Examples:
 *   format('{0}, you have {1} item{2}', 'Alice', 3, 's')             → "Alice, you have 3 items"
 *   format('{name}, you have {count} item{ending}', {name: 'Bob', count: 1, ending: ''}) → "Bob, you have 1 item"
 *   format('{0.name} has {1}', [{ name: 'Sally' }, 'apples'])       → "Sally has apples"
 *
 * Notes:
 * - Supports both implicit (e.g., {0}, {1}) and explicit (e.g., {name}) placeholders,
 *   but not mixed in the same template (will throw an error).
 * - Accepts an optional transformer map (e.g., `{ upper: s => s.toUpperCase() }`)
 *   to apply transformations using the `!transform` syntax.
 *
 * @param {Object.<string, function>} transformers - Optional map of transformation functions.
 * @returns {Function} - A formatter function: (template: string, ...values) => string
 */
const formatString = function (transformers) {
  return function format(template) {
    let args = Array.prototype.slice.call(arguments, 1);
    let idx = 0;
    let state = 'UNDEFINED';

    // Normalize args: if passed as a single array, unpack it
    if (args.length === 1 && Array.isArray(args[0])) {
      args = args[0];
    }

    return template.replace(
      /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
      function (match, literal, _key, xf) {
        if (literal != null) {
          return literal; // Escaped curly braces
        }

        let key = _key;

        if (key.length > 0) {
          if (state === 'IMPLICIT') {
            throw new Error('Cannot switch from implicit to explicit numbering');
          }
          state = 'EXPLICIT';
        } else {
          if (state === 'EXPLICIT') {
            throw new Error('Cannot switch from explicit to implicit numbering');
          }
          state = 'IMPLICIT';
          key = String(idx++);
        }

        const path = key.split('.');
        const lookupPath = /^\d+$/.test(path[0]) ? path : ['0'].concat(path);

        let value = lookupPath
          .reduce((maybe, key) => {
            return maybe.reduce((_, x) => {
              if (x != null && key in Object(x)) {
                const val = x[key];
                return [typeof val === 'function' ? val() : val];
              }
              return [];
            }, []);
          }, [args])
          .reduce((_, x) => x, '');

        if (xf == null) {
          return value;
        } else if (Object.prototype.hasOwnProperty.call(transformers, xf)) {
          return transformers[xf](value);
        } else {
          throw new Error('No transformer named "' + xf + '"');
        }
      }
    );
  };
};

_strings.prototype.format = formatString({});

/**
 * Light-weight formatter that fills missing values with an empty string.
 *
 * Supports both:
 *   - Positional placeholders: '{0}', '{1}' with array args
 *   - Named placeholders: '{name}', '{count}' with object arg
 *
 * Example:
 *   formatEmpty('Hi {0}, your code is {1}', ['Alice']) → 'Hi Alice, your code is '
 *   formatEmpty('Hi {name}, your count is {count}', { name: 'Bob' }) → 'Hi Bob, your count is '
 *
 * @param {string} template - The string template containing placeholders.
 * @param {...*} args - An array of values or a single object to interpolate.
 * @returns {string} - The formatted string with missing values replaced by ''.
 */
_strings.prototype.formatEmpty = function (template) {
  let args = Array.prototype.slice.call(arguments, 1);

  // Normalize args if passed as single array (e.g., formatEmpty('{0}', ['A']))
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }

  // Handle named object replacement
  if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    const obj = args[0];
    return template.replace(/{([^{}]+)}/g, function (_, key) {
      return obj[key] != null ? obj[key] : '';
    });
  }

  // Handle positional replacements
  return template.replace(/{(\d+)}/g, function (_, index) {
    return typeof args[index] !== 'undefined' && args[index] !== null
      ? String(args[index])
      : '';
  });
};

/**
 * Appends the specified characters to a string **only if** its length exceeds a given threshold.
 *
 * Commonly used to truncate long strings and append a suffix (like '...') to indicate continuation.
 *
 * Usage Example:
 *   zzb.strings.appendIfMoreThan('some string', '...', 3)
 *   // → 'som...'
 *
 * If the input string's length is less than or equal to `ifMoreCharCount`, it is returned unchanged.
 *
 * @param {string} str - The input string to check and potentially truncate.
 * @param {string} charsToAppend - The characters to append if truncation occurs.
 * @param {number} ifMoreCharCount - The length threshold to trigger truncation.
 * @returns {string} - The original or truncated string with appended characters.
 */
_strings.prototype.appendIfMoreThan = function (str, charsToAppend, ifMoreCharCount) {
  return (str && str.length > ifMoreCharCount)
    ? str.substring(0, ifMoreCharCount) + charsToAppend
    : str;
};

/**
 * Joins array items into a single string, separated by a specified delimiter (defaults to comma).
 *
 * Optionally extracts a nested field from objects using dot-notation (e.g., "user.name").
 *
 * Examples:
 *   zzb.strings.joinArr(['a', 'b', 'c'])                         // → "a, b, c"
 *   zzb.strings.joinArr([{name:'a'},{name:'b'}], 'name')        // → "a, b"
 *   zzb.strings.joinArr([{user:{name:'a'}},{user:{name:'b'}}], 'user.name')  // → "a, b"
 *   zzb.strings.joinArr(['x', 'y'], null, ' / ')                // → "x / y"
 *
 * @param {Array} arr - The input array to join (strings or objects).
 * @param {string} [fieldPath] - Optional dot-notated field path to extract from each object.
 * @param {string} [delimiter=', '] - The delimiter used to join values.
 * @returns {string} - The joined string.
 */
_strings.prototype.joinArr = function (arr, fieldPath, delimiter) {
  if (!Array.isArray(arr) || arr.length === 0) return '';

  const sep = delimiter != null ? delimiter : ', ';

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((val, key) => {
      return val && typeof val === 'object' ? val[key] : undefined;
    }, obj);
  };

  return arr
    .map(item => {
      if (fieldPath && typeof item === 'object' && item !== null) {
        const val = getNestedValue(item, fieldPath);
        return val != null ? String(val) : '';
      }
      return String(item);
    })
    .join(sep);
};

/**
 * Converts a word to its plural form based on the given number.
 *
 * Appends an "s" or a custom suffix if the number is not 1 or -1, unless `forcePlural` is true.
 *
 * Examples:
 *   zzb.strings.toPlural('dog', 1)                      // → "dog"
 *   zzb.strings.toPlural('dog', 2)                      // → "dogs"
 *   zzb.strings.toPlural('city', 2, { suffix: 'ies' })  // → "cities"
 *
 * @param {string} word - The base word to pluralize.
 * @param {number} number - The quantity to evaluate.
 * @param {Object} [options] - Optional config: { forcePlural: boolean, suffix: string|null }
 * @returns {string} - The pluralized word.
 */
_strings.prototype.toPlural = function (word, number, options) {
  options = zzb.types.merge({ forcePlural: false, suffix: null }, options);

  if ((number === 1 || number === -1) && !options.forcePlural) {
    return word;
  }

  return word + (options.suffix || 's');
};

/**
 * Capitalizes the first character of a non-empty string.
 *
 * Examples:
 *   zzb.strings.capitalize('hello') → 'Hello'
 *
 * @param {string} target - The string to capitalize.
 * @returns {string} - Capitalized string or empty string if input is invalid.
 */
_strings.prototype.capitalize = function (target) {
  if (zzb.types.isStringNotEmpty(target)) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return '';
};

/**
 * Trims a string, capitalizes the first letter, and ensures it ends with a period.
 *
 * Examples:
 *   zzb.strings.toFirstCapitalEndPeriod('hello world') → 'Hello world.'
 *
 * @param {string} target - The input string to format.
 * @returns {string} - Formatted string or empty string if input is invalid.
 */
_strings.prototype.toFirstCapitalEndPeriod = function (target) {
  if (zzb.types.isStringNotEmpty(target)) {
    target = target.trim();
    target = zzb.strings.capitalize(target);
    if (!target.endsWith('.')) {
      target += '.';
    }
  }
  return target;
};

// Unit labels for size formatting
const sizeUnitsFormatNameSingle = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const sizeUnitsFormatNameDouble = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const sizeUnitsFormatNameFull = ['Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte', 'Petabyte', 'Exabyte', 'Zettabyte', 'Yottabyte'];
const sizeUnitsFormatNameEIC = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

/**
 * Converts a file size in bytes to a human-readable string using various unit styles.
 *
 * Supported `unitsFormat` options:
 * - 'single': ["K", "M", "G", ...]
 * - 'double': ["KB", "MB", "GB", ...]
 * - 'full': ["Kilobyte", "Megabyte", ...]
 * - 'eic': ["KiB", "MiB", ...]
 *
 * @param {number} bytes - The file size in bytes.
 * @param {string} [unitsFormat='single'] - The format style for units.
 * @param {boolean} [noSizeUnitSeparation=false] - Whether to omit the space between value and unit.
 * @param {number} [dp=1] - Number of decimal places.
 * @returns {string} - Human-readable file size string.
 */
_strings.prototype.sizeToHumanReadable = function (bytes, unitsFormat, noSizeUnitSeparation, dp) {
  if (!zzb.types.isStringNotEmpty(unitsFormat)) unitsFormat = 'single';
  if (!dp) dp = 1;

  let unitSeperateSpace = noSizeUnitSeparation === true ? '' : ' ';
  let thresh = 1024;

  let units, unitsBytes = 'B';
  switch (unitsFormat.toLowerCase()) {
    case 'full': units = sizeUnitsFormatNameFull; unitsBytes = 'Bytes'; break;
    case 'double': units = sizeUnitsFormatNameDouble; break;
    case 'eic': units = sizeUnitsFormatNameEIC; break;
    default: units = sizeUnitsFormatNameSingle; break;
  }

  if (Math.abs(bytes) < thresh) {
    return bytes + unitSeperateSpace + unitsBytes;
  }

  let u = -1;
  let r = Math.pow(dp, 10);

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  let valFixed = bytes.toFixed(dp) + '';
  valFixed = zzb.strings.trimSuffix(valFixed, ['.00', '.0']);

  return valFixed + unitSeperateSpace + units[u];
};

/**
 * Removes the specified prefix (or any of multiple) from the start of a string.
 *
 * @param {string} target - The input string.
 * @param {string|string[]} prefix - A prefix or array of prefixes to remove.
 * @returns {string} - The trimmed string.
 */
_strings.prototype.trimPrefix = function(target, prefix) {
  target = zzb.types.toString(target);
  let arr = Array.isArray(prefix) ? prefix : [zzb.types.toString(prefix)];
  for (let ii = 0; ii < arr.length; ii++) {
    if (target.startsWith(arr[ii])) {
      return target.slice(arr[ii].length);
    }
  }
  return target;
};

/**
 * Removes the specified suffix (or any of multiple) from the end of a string.
 *
 * @param {string} target - The input string.
 * @param {string|string[]} suffix - A suffix or array of suffixes to remove.
 * @returns {string} - The trimmed string.
 */
_strings.prototype.trimSuffix = function(target, suffix) {
  target = zzb.types.toString(target);
  let arr = Array.isArray(suffix) ? suffix : [zzb.types.toString(suffix)];
  for (let ii = 0; ii < arr.length; ii++) {
    if (target.endsWith(arr[ii])) {
      return target.slice(0, -arr[ii].length);
    }
  }
  return target;
};

/**
 * Converts a duration in milliseconds into a human-readable format like "1d 2h 3m 4.56s".
 *
 * @param {number} milliseconds - The duration in milliseconds.
 * @returns {string} - Human-readable time interval.
 */
_strings.prototype.millisecondsTimeToHumanReadable = function (milliseconds) {
  let temp = milliseconds / 1000;
  const years = Math.floor(temp / 31536000);
  const days = Math.floor((temp %= 31536000) / 86400);
  const hours = Math.floor((temp %= 86400) / 3600);
  const minutes = Math.floor((temp %= 3600) / 60);
  const seconds = temp % 60;

  if (days || hours || seconds || minutes) {
    return (years ? years + 'y ' : '') +
      (days ? days + 'd ' : '') +
      (hours ? hours + 'h ' : '') +
      (minutes ? minutes + 'm ' : '') +
      Number.parseFloat(seconds).toFixed(2) + 's';
  }

  return '< 1s';
};

/**
 * Converts various value types into a boolean.
 *
 * Recognizes:
 *   - Booleans: true, false
 *   - Numbers: 1 (true), 0 (false)
 *   - Strings: "true", "yes", "1" → true; "false", "no", "0", "" → false
 *   - All else falls back to Boolean coercion
 *
 * @param {*} target - The value to evaluate.
 * @returns {boolean}
 */
_strings.prototype.toBool = function (target) {
  if (typeof target === 'boolean') {
    return target;
  }

  if (typeof target === 'number') {
    return target === 1;
  }

  if (!zzb.types.isStringNotEmpty(target)) {
    return false;
  }

  switch (target.toLowerCase().trim()) {
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'false':
    case 'no':
    case '0':
    case '':
      return false;
    default:
      return Boolean(target);
  }
};

/**
 * Parses the input into an integer, or returns 0 as fallback.
 * Optionally handles arrays of values if `forceArray` is true.
 *
 * @param {*} target - The value or array of values to parse.
 * @param {boolean} [forceArray=false] - Whether to always return an array.
 * @returns {number|number[]} - Parsed integer(s) or 0/array of 0s if parsing fails.
 */
_strings.prototype.parseIntOrZero = function (target, forceArray) {
  return this.parseTypeElse(target, 'int', 0, !!forceArray);
};

/**
 * Parses the input into a float, or returns 0.0 as fallback.
 * Optionally handles arrays of values if `forceArray` is true.
 *
 * @param {*} target - The value or array of values to parse.
 * @param {boolean} [forceArray=false] - Whether to always return an array.
 * @returns {number|number[]} - Parsed float(s) or 0.0/array of 0.0s if parsing fails.
 */
_strings.prototype.parseFloatOrZero = function (target, forceArray) {
  return this.parseTypeElse(target, 'float', 0.0, !!forceArray);
};

/**
 * Parses the input into a boolean, or returns false as fallback.
 * Optionally handles arrays of values if `forceArray` is true.
 *
 * @param {*} target - The value or array of values to parse.
 * @param {boolean} [forceArray=false] - Whether to always return an array.
 * @returns {boolean|boolean[]} - Parsed boolean(s) or false/array of false if parsing fails.
 */
_strings.prototype.parseBoolOrFalse = function (target, forceArray) {
  return this.parseTypeElse(target, 'bool', false, !!forceArray);
};

/**
 * Attempts to parse a value (or array of values) into a specified type, with fallback support.
 *
 * Normalizes the provided type using `zzb.types.normalizeType`, which supports aliases like:
 *   - 'int', 'integer' → 'integer'
 *   - 'str', 'string' → 'string'
 *   - 'bool', 'boolean' → 'boolean'
 *   - 'float', 'number' → 'float'
 *   - 'obj', 'object' → 'object'
 *   - 'null' → 'null'
 *
 * If the value is null or undefined, or if parsing fails, the fallback is used.
 *
 * If `forceArray` is true (or `target` is already an array), all values are parsed and an array is returned.
 * Otherwise, the function returns a single parsed value.
 *
 * @param {*} target - The value or array of values to parse.
 * @param {string} type - The desired type to parse into (e.g., "int", "string", "bool").
 * @param {*} fallback - A fallback value used when parsing fails or input is invalid.
 * @param {boolean} [forceArray=false] - Whether to always return an array of results.
 * @returns {*} - Parsed value(s) as the specified type, or fallback(s) if parsing fails.
 */
_strings.prototype.parseTypeElse = function (target, type, fallback, forceArray) {
  const makeArray = forceArray || zzb.types.isArray(target);
  const values = zzb.types.isArray(target) ? target.slice() : [target];

  const normalizedType = zzb.types.normalizeType(type);

  const output = values.map(val => {
    if (val === undefined || val === null) return fallback;

    let parsed;

    switch (normalizedType) {
      case 'integer':
        parsed = parseInt(val);
        return isNaN(parsed) ? fallback : parsed;

      case 'float':
        parsed = parseFloat(val);
        return isNaN(parsed) ? fallback : parsed;

      case 'boolean':
        return zzb.strings.toBool(val);

      case 'string':
        return zzb.types.isString(val) ? val : String(val ?? fallback);

      case 'object':
        return typeof val === 'object' ? val : fallback;

      case 'null':
        return null;

      case 'date':
      case 'date-iso':
        return zzb.types.isStringNotEmpty(val) ? val : fallback;

      default:
        // fallback for unrecognized types
        return zzb.types.isString(val) ? val : String(val ?? fallback);
    }
  });

  return makeArray ? output : output[0];
}

/**
 * Formats a string using a primary or fallback value.
 * If the `value` is not a non-empty string, the `fallback` is used instead.
 * If neither is valid, returns an empty string.
 *
 * @param {string} template - The string template to format (e.g., 'Hello, {0}!').
 * @param {string} value - The primary value to insert into the template.
 * @param {string} fallback - A fallback value used if the primary value is empty or invalid.
 * @returns {string} - The formatted string, or an empty string if both inputs are empty.
 */
_strings.prototype.formatElseEmpty = function (template, value, fallback) {
  let finalValue = value
  if (!zzb.types.isStringNotEmpty(finalValue)) {
    finalValue = fallback
    if (!zzb.types.isStringNotEmpty(finalValue)) {
      return ''
    }
  }
  return zzb.strings.format(template, finalValue)
}

exports.P = _strings


/***/ }),

/***/ 482:
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
  // _dialogs
  // ---------------------------------------------------

  const _dom = (__webpack_require__(636)/* .dom */ .t)

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

  const _rob = (__webpack_require__(247)/* .rob */ .I)

  // ---------------------------------------------------
  // _ajax
  // ---------------------------------------------------

  const _ajax = (__webpack_require__(964)/* .ajax */ .R)

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

const reCRUDXL = new RegExp('^[CRUDXL]*$')

_perms.prototype.getPermAttributes = function (permkey) {
  // CRUDX
  let attr = { canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExecute: false, canList: false }

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

  if (!reCRUDXL.test(permkey)) {
    return attr
  }

  attr.canRead = permkey.indexOf('C') >= 0
  attr.canCreate = permkey.indexOf('R') >= 0
  attr.canUpdate = permkey.indexOf('U') >= 0
  attr.canDelete = permkey.indexOf('D') >= 0
  attr.canExecute = permkey.indexOf('X') >= 0
  attr.canList = permkey.indexOf('L') >= 0

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

/***/ 636:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// dom
// ---------------------------------------------------

function _dom () {}

/**
 * Checks if the current device supports hover interactions (e.g., mouse).
 *
 * @returns {boolean} - True if hover is supported; false otherwise.
 */
_dom.prototype.hasUIHover = function () {
  return (!window.matchMedia("(hover: none)").matches)
}

/**
 * Determines if a DOM element reference exists.
 *
 * @param {Element|null|undefined} $elem - The DOM element or reference.
 * @returns {boolean} - True if the element exists; false otherwise.
 */
_dom.prototype.hasElement = function ($elem) {
  return !!$elem
}

/**
 * Sets an attribute on a DOM element or a list of DOM elements.
 *
 * @param {Element|Element[]} $elem - A single DOM element or an array of elements.
 * @param {string} key - The attribute name to set.
 * @param {string} value - The attribute value to assign.
 */
_dom.prototype.setAttribute = function ($elem, key, value) {
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

/**
 * Retrieves an attribute from a DOM element, returning a fallback if not found or empty.
 *
 * @param {Element|null} $elem - The DOM element.
 * @param {string} name - The attribute name to retrieve.
 * @param {*} elseValue - The fallback value to return if the attribute is missing or empty.
 * @returns {*} - The attribute value or the fallback.
 */
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

/**
 * Extracts all attributes from a DOM element matching a regex, optionally converting names to camelCase.
 *
 * @param {Element} $elem - The DOM element.
 * @param {RegExp} regex - A regular expression to filter attributes (e.g., /^data-/).
 * @param {number} [camelCaseStrip=-1] - If > 0, strips the prefix and converts the rest to camelCase.
 * @returns {Object} - A key-value map of matched attributes.
 */
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
        let camelCaseName = attr.name.substr(camelCaseStrip).replace(/-(.)/g, function ($0, $1) {
          return $1.toUpperCase()
        })
        data[camelCaseName] = attr.value
      }
    }
  })
  return data
}


/**
 * Sets a deeply nested value in an object based on a dot-notated path.
 * Supports array notation like `foo[0].bar`.
 *
 * Examples:
 *   setPath(obj, 'user.name', 'Alice')
 *   setPath(obj, 'items[0].title', 'Item 1')
 *
 * @param {Object} obj - The object to update.
 * @param {string} path - Dot-notated path (supports array syntax).
 * @param {*} value - The value to assign at the target path.
 */
_dom.prototype.setPath = function(obj, path, value) {
  let current = obj;
  const pathParts = zzb.types.toString(path).split(".");

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const arrayMatch = part.match(/^(\w+)\[(\d*)\]$/);

    let key = part;
    let isArray = false;
    let arrayIndex = 0;

    if (arrayMatch) {
      isArray = true;
      key = arrayMatch[1];
      arrayIndex = arrayMatch[2] === "" ? null : parseInt(arrayMatch[2], 10);
    }

    if (i === pathParts.length - 1) {
      if (isArray) {
        if (!zzb.types.isArray(current[key])) current[key] = [];
        if (arrayIndex !== null) {
          while (current[key].length <= arrayIndex) {
            current[key].push(null);
          }
          current[key][arrayIndex] = value;
        } else {
          current[key] = value;
        }
      } else {
        current[key] = value;
      }
    } else {
      if (isArray) {
        if (!zzb.types.isArray(current[key])) current[key] = [];
        if (!zzb.types.isObject(current[key][0])) current[key][0] = {};
        current = current[key][0];
      } else {
        if (!zzb.types.isObject(current[key])) current[key] = {};
        current = current[key];
      }
    }
  }
}

/**
 * Converts a form element's input into a deeply nested JSON object.
 * Uses zf-* attributes to determine types, arrays, and nullability.
 *
 * - Supports nested paths like `user.name`
 * - Handles custom types via `zf-type` (e.g., "int", "[]bool|null")
 * - Reads value overrides from `zf-cval`
 *
 * @param {HTMLFormElement} formElem - The form element to serialize.
 * @returns {Object} - A deeply nested JSON object.
 */
_dom.prototype.formDataToJson = function(formElem) {
  const data = new FormData(formElem);
  const raw = {};
  const nested = {};

  for (let [key, value] of data) {
    if (raw[key] !== undefined) {
      if (!zzb.types.isArray(raw[key])) {
        raw[key] = [raw[key]];
      }
      raw[key].push(value);
    } else {
      raw[key] = value;
    }
  }

  for (const key in raw) {
    const field = formElem.querySelector(`[name="${key}"]`);
    let value = raw[key];
    let typeHint = 'string';
    let forceArray = false;
    let isNullable = false;

    if (field) {
      const zfCVal = field.getAttribute("zf-cval");
      if (zfCVal !== null) {
        value = zfCVal;
      }

      let zfType = field.getAttribute("zf-type") || "string";

      // Handle array type indicator (e.g. "[]int")
      if (zfType.startsWith("[]")) {
        forceArray = true;
        zfType = zfType.slice(2);
      }

      const typeParts = zfType.split("|").map(t => zzb.types.normalizeType(t));
      typeHint = typeParts[0];
      isNullable = typeParts.includes("null");

      const fallback = typeHint === 'integer' || typeHint === 'float'
        ? 0
        : typeHint === 'boolean'
          ? false
          : '';

      const isEmpty = value === '' || value === null || typeof value === 'undefined';

      if (isEmpty && isNullable) {
        value = null;
      } else if (zzb.types.isArray(value)) {
        value = value.map(v => zzb.strings.parseTypeElse(v, typeHint, fallback, false));
      } else {
        value = zzb.strings.parseTypeElse(value, typeHint, fallback, false);
      }
    } else {
      value = value === '' ? '' : value;
    }

    if (forceArray && !zzb.types.isArray(value)) {
      value = [value];
    }

    zzb.dom.setPath(nested, key, value);
  }

  return nested;
}

/**
 * Parses a selector bundle and resolves DOM targets relative to a base element.
 *
 * Supports:
 * - self:              returns the element itself
 * - none:              returns string 'none'
 * - selector:#id       uses document.querySelector
 * - closest:.class     uses $elem.closest
 * - child:.child       uses $elem.querySelector
 * - Supports optional label and placement: `label.selector@placement:target`
 *
 * Examples:
 *   findSelectorTargets(elem, 'self')
 *     → [ { label: 'self', $elem: elem } ]
 *
 *   findSelectorTargets(elem, 'none')
 *     → 'none'
 *
 *   findSelectorTargets(elem, 'selector:#modal')
 *     → [ { label: null, $elem: document.querySelector('#modal'), placement: 'inner' } ]
 *
 *   findSelectorTargets(elem, 'closest:.container')
 *     → [ { label: null, $elem: elem.closest('.container'), placement: 'inner' } ]
 *
 *   findSelectorTargets(elem, 'child:.inner-content')
 *     → [ { label: null, $elem: elem.querySelector('.inner-content'), placement: 'inner' } ]
 *
 *   findSelectorTargets(elem, 'alert.closest@outer:.alert-box')
 *     → [ { label: 'alert', $elem: elem.closest('.alert-box'), placement: 'outer' } ]
 *
 *   findSelectorTargets(elem, 'self, selector:#target, notice.child@inner:.message')
 *     → [ { label: 'self', $elem: elem }, { $elem: document.querySelector('#target'), ... }, { label: 'notice', $elem: ..., placement: 'inner' } ]
 *
 * @param {Element} $elem - The base DOM element.
 * @param {string} bundle - Comma-separated list of selector expressions.
 * @returns {Array|String|null} - Array of resolved targets, 'none', or null on failure.
 */
_dom.prototype.findSelectorTargets = function ($elem, bundle) {
  if (!$elem || !zzb.types.isStringNotEmpty(bundle)) {
    return null
  }

  const result = []
  const targetStrings = bundle.split(',')

  for (let entry of targetStrings) {
    entry = entry.trim()

    if (entry === 'self' || entry === 'self:') {
      result.push({ label: 'self', $elem })
      continue
    }

    if (entry === 'none' || entry === 'none:') {
      return 'none'
    }

    const colonIndex = entry.indexOf(':')
    if (colonIndex === -1) continue

    const left = entry.slice(0, colonIndex)
    const right = entry.slice(colonIndex + 1)
    if (!zzb.types.isStringNotEmpty(right)) return null

    let label = null
    let method = left
    let placement = 'inner'

    // Parse label.method@placement
    const dotIndex = method.indexOf('.')
    if (dotIndex > 0) {
      label = method.slice(0, dotIndex)
      method = method.slice(dotIndex + 1)
    }

    const atIndex = method.indexOf('@')
    if (atIndex > 0) {
      placement = method.slice(atIndex + 1)
      method = method.slice(0, atIndex)
    }

    let $target = null
    switch (method) {
      case 'selector':
      case 's':
        $target = document.querySelector(right)
        break
      case 'closest':
      case 'c':
        $target = $elem.closest(right)
        break
      case 'child':
      case 'h':
        $target = $elem.querySelector(right)
        break
      default:
        console.warn('Unknown selector method:', method)
        break
    }

    if (!(placement === 'inner' || placement === 'outer')) {
      console.warn('Unknown placement param; defaulting to "inner":', placement)
      placement = 'inner'
    }

    if ($target) {
      result.push({ label, $elem: $target, placement })
    }
  }

  return result
}

/**
 * Attempts to extract a URL-like value from an element by checking a prioritized list of attributes.
 * Falls back in order: zurl → href → action → src (if not an <img>).
 *
 * @param {Element} $elem - The DOM element to inspect.
 * @param {boolean} [returnNull=false] - If true, returns null instead of an empty string on failure.
 * @returns {string|null} - The found URL string or fallback value.
 */
_dom.prototype.findZUrl = function ($elem, returnNull) {
  if (!$elem || typeof $elem.getAttribute !== 'function') { returnNull ? null : '' }

  const tag = $elem.nodeName?.toLowerCase()
  const tryAttrs = ['zurl', 'href', 'action']

  // Only check 'src' if the element is not an image
  if (tag !== 'img') {
    tryAttrs.push('src')
  }

  for (const attr of tryAttrs) {
    const val = $elem.getAttribute(attr)
    if (zzb.types.isStringNotEmpty(val) && val !== '#') {
      return val
    }
  }

  return returnNull ? null : ''
}

/**
 * Unified in-memory and persistent (localStorage) cache utility for DOM-centric use cases.
 *
 * Provides a simple interface to:
 * - Get/set temporary cache in memory (`mode: 'mem'`)
 * - Persist small configuration/state values using `localStorage` (`mode: 'persist'`)
 *
 * Options:
 * - `mode`: 'mem' (default) or 'persist'
 * - `rootKey`: Used as the localStorage key root (default: 'zuiC')
 *
 * Example:
 *   _dom.cache.set('myKey', 'value')                        // memory
 *   _dom.cache.set('theme', 'dark', { mode: 'persist' })    // localStorage
 *   _dom.cache.get('theme', { mode: 'persist' })            // 'dark'
 */
const _memCache = {};

_dom.prototype.cache = {
  /**
   * Retrieves a cached value by key.
   * @param {string} key - Cache key to retrieve.
   * @param {Object} [options] - Options: { mode: 'mem' | 'persist', rootKey?: string }
   * @returns {*} - The cached value or null.
   */
  get(key, { mode = 'mem', rootKey = 'zuiC' } = {}) {
    if (!key) return null;

    if (mode === 'persist') {
      try {
        const store = JSON.parse(localStorage.getItem(rootKey) || '{}');
        return store[key] ?? null;
      } catch (e) {
        console.warn('ZUI persistent cache read error:', e);
        return null;
      }
    }

    return _memCache[key] ?? null;
  },

  /**
   * Stores a value in cache.
   * @param {string} key - Key to store under.
   * @param {*} value - Value to store.
   * @param {Object} [options] - Options: { mode: 'mem' | 'persist', rootKey?: string }
   */
  set(key, value, { mode = 'mem', rootKey = 'zuiC' } = {}) {
    if (!key) return;

    if (mode === 'persist') {
      try {
        const store = JSON.parse(localStorage.getItem(rootKey) || '{}');
        store[key] = value;
        localStorage.setItem(rootKey, JSON.stringify(store));
      } catch (e) {
        console.warn('ZUI persistent cache write error:', e);
      }
    } else {
      _memCache[key] = value;
    }
  },

  /**
   * Clears a key or all cache depending on mode.
   * @param {Object} [options] - { key?: string, mode?: 'mem' | 'persist', rootKey?: string }
   */
  clear({ key = null, mode = 'mem', rootKey = 'zuiC' } = {}) {
    if (mode === 'persist') {
      if (key) {
        try {
          const store = JSON.parse(localStorage.getItem(rootKey) || '{}');
          delete store[key];
          localStorage.setItem(rootKey, JSON.stringify(store));
        } catch (e) {
          console.warn('ZUI persistent cache clear error:', e);
        }
      } else {
        localStorage.removeItem(rootKey);
      }
    } else {
      if (key) {
        delete _memCache[key];
      } else {
        for (const k in _memCache) {
          delete _memCache[k];
        }
      }
    }
  }
};

exports.t = _dom


/***/ }),

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

      const objReturn = { request: options, data: data }

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
                classDialog: 'zzb-dialog-flash-message zzb-dialog-flash-redirect' + zzb.strings.formatElseEmpty(' zzb-dialog-flash-status-{0}', data.messageType),
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
              classDialog: 'zzb-dialog-flash-message' + zzb.strings.formatElseEmpty(' zzb-dialog-flash-status-{0}', data.messageType, rob.hasErrors() ? 'error' : 'okay'),
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
/******/ 	var __webpack_exports__ = __webpack_require__(482);
/******/ 	
/******/ })()
;