//! zzb.ui.js v2.9.0 (https://github.com/jpfluger/zazzy-browser)
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

/***/ 168:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// _zaction
// ---------------------------------------------------

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
  for (const handler of this.handlers) {
    if (handler.getId() === id) return handler;
  }
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

// function findSelectorTargets($elem, bundle) {
//   if (!$elem) {
//     return null
//   }
//   if (!zzb.types.isStringNotEmpty(bundle)) {
//     return null
//   }
//   let arr = []
//   let ssTargets = bundle.split(',')
//   for (let mm = 0; mm < ssTargets.length; mm++) {
//
//     let bundle = ssTargets[mm]
//
//     switch (bundle) {
//       case 'self':
//         arr.push({label: 'self', $elem: $elem})
//         break
//       case 'self:':
//         arr.push({label: 'self', $elem: $elem})
//         break
//       case 'none':
//         return 'none'
//       case 'none:':
//         return 'none'
//       default:
//         // parse
//         // label.selector:#id
//         // label.selector@placement:#id
//         let split = [ bundle.substring(0, bundle.indexOf(':')), bundle.substring(bundle.indexOf(':') + 1) ]
//         if (split.length === 2) {
//           if (!zzb.types.isStringNotEmpty(split[1])) {
//             return null
//           }
//
//           let label = null
//           if (split[0].indexOf('.') > 1) {
//             // label.selector#placement
//             label = split[0].slice(0, split[0].indexOf('.'))
//             split[0] = split[0].slice(split[0].indexOf('.') + 1)
//           }
//
//           let placement = 'inner'
//           let mySelector = split[0]
//           if (split[0].indexOf('@') > 1) {
//             // label.selector#placement
//             mySelector = split[0].slice(0, split[0].indexOf('@'))
//             placement = split[0].slice(split[0].indexOf('@') + 1)
//           }
//
//           let $target = null
//           if (mySelector === 'selector' || mySelector === 's') {
//             $target = document.querySelector(split[1])
//           } else if (mySelector === 'closest' || mySelector === 'c') {
//             $target = $elem.closest(split[1])
//           } else if (mySelector === 'child' || mySelector === 'h') {
//             $target = $elem.querySelector(split[1])
//           }
//
//           if (!(placement === 'inner' || placement === 'outer')) {
//             console.log('unknown placement param inside inject; defaulting to "inner"', split)
//             placement = 'inner'
//           }
//
//           if ($target) {
//             arr.push({label: label, $elem: $target, placement: placement})
//           }
//         }
//     }
//   }
//
//   return arr
// }

_zaction.prototype.buildZClosest = function($elem, obj, isFirstZAction, zaExtraHandler) {
  return buildZClosest($elem, obj, isFirstZAction, zaExtraHandler)
}

class ZBuilder {
  constructor($elem) {
    this.$elem = $elem;
    this.zaction = {};
    this.zdata = {};
    this.zdlg = { tryDialog: false };
    this.zurl = null;
    this.$data = null;
    this.arrInjects = null;
    this.zref = {};
    this.zinterval = {
      id: $elem.getAttribute('zi-id'),
      noClick: $elem.getAttribute('zi-noclick') === 'true'
    };
    this.forceIgnoreZUrl = false;
    this.forceIgnoreZData = false;
    this.forceIgnoreZInject = false;
    this.isForm = false;
    this.formData = null;

    $elem.setAttribute('zi-noclick', 'false');
  }

  bld_mergeAttributes() {
    this.zaction = zzb.types.merge(zzb.dom.getAttributes(this.$elem, /^za-/, 3), this.zaction);
    this.zdata = zzb.types.merge(zzb.dom.getAttributes(this.$elem, /^zd-/, 3), this.zdata);
  }

  bld_addViewPort() {
    if (typeof window !== 'undefined') {
      this.zaction.viewPort = {
        window: {
          w: Math.round(window.innerWidth) || 0,
          h: Math.round(window.innerHeight) || 0
        },
        content: { w: 0, h: 0 }
      };

      const mainContainer = document.querySelector('.zwc-main-content');
      if (mainContainer) {
        const rect = mainContainer.getBoundingClientRect();
        this.zaction.viewPort.content = {
          w: Math.round(rect.width),
          h: Math.round(rect.height)
        };
      }
    }
  }

  bld_resolveZUrl(isFirstCall, isFirstZAction) {
    if (this.forceIgnoreZUrl) return;

    if (isFirstCall || isFirstZAction) {
      this.forceIgnoreZUrl = this.zaction.ignoreZurl === 'true';
    }

    if (!this.forceIgnoreZUrl && !this.zurl) {
      this.zurl = zzb.dom.findZUrl(this.$elem, true);
    }
  }

  bld_resolveZData() {
    if (this.forceIgnoreZData || this.$data) return;

    if (zzb.types.isStringNotEmpty(this.zaction.data)) {
      const arrData = zzb.dom.findSelectorTargets(this.$elem, this.zaction.data);
      if (arrData && arrData[0].$elem) {
        this.$data = arrData[0].$elem;
        this.forceIgnoreZData = this.$data === 'none';

        if (!this.forceIgnoreZData) {
          if (this.$data.nodeName.toLowerCase() === 'form') {
            this.isForm = true;
            this.formData = new FormData(this.$data);
          }
        } else {
          this.$data = null;
          this.formData = null;
        }
      } else {
        console.warn('No matching selector found for zaction.data:', this.zaction.data);
      }
    }
  }

  bld_resolveZDialog() {
    this.zref = zzb.types.merge(zzb.dom.getAttributes(this.$elem, /^zref-/, 5), this.zref);
    this.zdlg = zzb.types.merge(zzb.dom.getAttributes(this.$elem, /^zdlg-/, 5), this.zdlg);

    if (zzb.types.isStringNotEmpty(this.zaction.dlg)) {
      const arrDlg = zzb.dom.findSelectorTargets(this.$elem, this.zaction.dlg);
      if (arrDlg && arrDlg[0].$elem) {
        const $dlgElem = arrDlg[0].$elem;
        this.zdlg = zzb.types.merge(zzb.dom.getAttributes($dlgElem, /^zdlg-/, 5), this.zdlg);
        this.zaction = zzb.types.merge(zzb.dom.getAttributes($dlgElem, /^za-/, 3), this.zaction);

        if (!this.zurl) {
          this.zurl = zzb.dom.findZUrl($dlgElem, true);
        }
      }
    }
  }

  bld_resolveInjects() {
    if (this.forceIgnoreZInject || this.arrInjects) return;

    if (zzb.types.isStringNotEmpty(this.zaction.inject)) {
      const arrInjects = zzb.dom.findSelectorTargets(this.$elem, this.zaction.inject);
      if (arrInjects !== 'none') {
        this.arrInjects = arrInjects;
      } else {
        this.forceIgnoreZInject = true;
        this.arrInjects = null;
      }
    }
  }
}

function buildZClosest($elem, obj = null, isFirstZAction = false, zaExtraHandler = null) {
  if (!$elem) return null;

  const isFirstCall = !obj;
  const builder = isFirstCall ? new ZBuilder($elem) : obj;

  builder.$elem = $elem;

  builder.bld_mergeAttributes();
  if (isFirstCall) builder.bld_addViewPort();
  builder.bld_resolveZUrl(isFirstCall, isFirstZAction);
  builder.bld_resolveZData();
  if (isFirstCall || isFirstZAction) builder.bld_resolveZDialog();
  builder.bld_resolveInjects();

  const notOnZaction = isFirstCall && !$elem.classList.contains('zaction') &&
    zaExtraHandler !== 'za-post-action';

  if (notOnZaction) {
    const $parentZ = $elem.closest('.zaction');
    return buildZClosest($parentZ, builder, notOnZaction, zaExtraHandler);
  }

  const closest = zzb.dom.getAttributeElse($elem, 'zclosest', null);
  if (closest) {
    const $target = $elem.closest(closest);
    if ($target) return buildZClosest($target, builder);
  }

  return builder;
}

class ZActionEvent {
  constructor(ev) {
    this.ev = ev;
    this.zcall = ev?.target?.getAttribute('zcall') || null;
    this._options = null;
    this._runAJAX = null;
    this.reservePH = [':event', ':mod', ':zid', ':zidParent', ':blobName'];
  }

  isMouseDown() {
    return this.zcall === 'mousedown';
  }

  forceStopPropDef(force) {
    const shouldStop = force || this.ev?.target?.getAttribute('force-stop-prop-def') === 'true';
    if (shouldStop) {
      this.ev.preventDefault?.();
      this.ev.stopPropagation?.();
    }
    return shouldStop;
  }

  getZEvent() {
    return this.getOptions()?.zaction?.event ?? null;
  }

  hasZEvent() {
    const event = this.getZEvent();
    return zzb.types.isStringNotEmpty(event);
  }

  isValid() {
    return !!this.ev?.target && this.hasZEvent();
  }

  isZUrl() {
    return zzb.types.isStringNotEmpty(this.getOptions()?.zurl);
  }

  runAJAX(options, callback) {
    this.getOptions();
    if (!options || !this._runAJAX) {
      callback?.(null, new Error('_runAJAX not defined'));
    } else {
      this._runAJAX(options, callback);
    }
  }

  runInjects(response) {
    const injects = this.getOptions().arrInjects;
    const dInjects = response?.rob?.first?.()?.dInjects;
    if (injects && dInjects) {
      runInjects(injects, dInjects);
    }
  }

  getOptions() {
    if (this._options) return this._options;

    const target = this.ev?.target;
    if (!target) return (this._options = null);

    const built = zzb.zaction.buildZClosest(target, null, null, this.ev.zaExtraHandler);

    if (!built) {
      this._options = null;
      return null;
    }

    this._options = built;
    const opts = this._options;

    if (!opts.forceIgnoreZData && opts.$data) {
      opts.zaction.zid ??= zzb.dom.getAttributeElse(opts.$data, 'za-zid', null);
      opts.zaction.zidParent ??= zzb.dom.getAttributeElse(opts.$data, 'za-zid-parent', null);
      opts.zurl ??= zzb.dom.findZUrl(opts.$data, true);
    }

    if (!opts.forceIgnoreZUrl && zzb.types.isStringNotEmpty(opts.zurl)) {
      for (const ph of this.reservePH) {
        if (opts.zurl.includes(ph)) {
          const key = ph.slice(1);
          const val = opts.zaction[key];
          if (!zzb.types.isStringNotEmpty(val)) {
            throw new Error(`Missing required placeholder '${ph}' in zurl`);
          }
          opts.zurl = opts.zurl.replace(ph, val);
        }
      }
    }

    opts.zaction.pageOn = zzb.strings.parseIntOrZero(opts.zaction.pageOn);
    opts.zaction.pageLimit = zzb.strings.parseIntOrZero(opts.zaction.pageLimit);
    opts.zaction.method ||= 'postJSON';

    switch (opts.zaction.method) {
      case 'getJSON':
        this._runAJAX = zzb.ajax.getJSON;
        break;
      case 'postFORM':
        this._runAJAX = zzb.ajax.postFORM;
        break;
      default:
        this._runAJAX = zzb.ajax.postJSON;
    }

    opts.zdlg.tryDialog = zzb.types.isObject(opts.zdlg) && Object.keys(opts.zdlg).length > 0;

    if (
      zzb.types.isStringNotEmpty(opts.zaction.loopType) &&
      !opts.forceIgnoreZInject &&
      opts.arrInjects
    ) {
      if (opts.zaction.loopInjectSkipInject === 'true') {
        opts.zaction.loopType = null;
      } else {
        opts.hasLoopType = true;
      }
    }

    return opts;
  }

  buildAJAXOptions() {
    this.getOptions();
    const opts = this._options;
    const ajaxOptions = { url: opts.zurl };
    const myInterval = zzb.time.getInterval(opts.zinterval.id);
    const hasCache = myInterval && myInterval.hasCache();
    let doSetCache = false;

    if (myInterval && !opts.zinterval.noClick) {
      myInterval.setCache(null);
    }

    switch (opts.zaction.method) {
      case 'postJSON':
        if (!opts.forceIgnoreZData) {
          if (opts.isForm) {
            ajaxOptions.body = hasCache
              ? myInterval.getCache()
              : zzb.dom.formDataToJson(opts.$data);

            // Optionally merge zdata if needed, otherwise you can skip this merge
            if (opts.zdata) {
              ajaxOptions.body = zzb.types.merge(ajaxOptions.body, opts.zdata);
            }
          }
        }
        ajaxOptions.body = ajaxOptions.body || {};
        ajaxOptions.body.zaction = opts.zaction;
        break;

      case 'postFORM':
        ajaxOptions.body = hasCache ? myInterval.getCache() : opts.formData;
        doSetCache = !hasCache;
        break;
    }

    if (doSetCache && myInterval) {
      myInterval.setCache(ajaxOptions.body);
    }

    if (zzb.types.isStringNotEmpty(opts.zaction.expectType)) {
      ajaxOptions.expectType = opts.zaction.expectType;
    }

    return ajaxOptions;
  }
}

_zaction.prototype.ZActionEvent = ZActionEvent;

_zaction.prototype.newZAction = function (ev) {
  const zact = new ZActionEvent(ev);
  return zact;
};

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
  if (!zaction.isValid()) {
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

      // Load and init elements inside modal body
      zzb.zaction.loadZInputs($elem)
      if (zzb.zui) {
        zzb.zui.onElemInit($elem)
      }
      zzb.zaction.addEventListeners('.zaction', results.js.actionHandler, $elem)

      // Gather all triggers inside modal-body
      let $ztElems = $elem.querySelectorAll('[ztrigger]')
      let validBodyTriggers = []
      if ($ztElems) {
        $ztElems.forEach(function($ztElem) {
          let trigger = $ztElem.getAttribute('ztrigger')
          if (!allowedTriggers.includes(trigger)) {
            console.log('no match of ztrigger handler "', trigger + '"' )
          } else {
            // Assign loop-type info if needed
            if (zaction.getOptions().hasLoopType) {
              if (!zzb.types.isStringNotEmpty($ztElem.getAttribute('za-loop-type'))) {
                $ztElem.setAttribute('za-loop-type', zaction.getOptions().zaction.loopType)
                $ztElem.setAttribute('za-loop-inject-skip-inject', "false")
              }
            }
            $ztElem.addEventListener('ztrigger-dialog-button', function(ev){
              zzb.zaction.actionHandler(ev, ev.detail.altHandler, function(drr, err) {
                handleActionResults(drr, err, ev.detail.dialog)
              })
            })
          }
          validBodyTriggers.push(trigger)
        })
      }

      // Filter DOM buttons in modal-footer: keep only those with valid triggers or defaultSafeTrigger
      const defaultSafeTrigger = 'cancel'
      if ($buttons && $buttons.length > 0) {
        $buttons.forEach($btn => {
          const trig = $btn.getAttribute('ztrigger')?.toLowerCase()
          if (!trig) {
            console.warn('Button in footer is missing ztrigger, removing')
            $btn.remove()
            return
          }
          const isAllowed = (trig === defaultSafeTrigger) || validBodyTriggers.includes(trig)
          if (!isAllowed) {
            console.warn(`Removing modal-footer button with ztrigger="${trig}" – no matching .zaction`)
            $btn.remove()
          }
        })
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
  if ($elems && $elems.length > 0){
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

  if ($parent.tagName && $parent.classList.contains('zinput')) {
    zzb.zaction.detectFieldChanges($parent)
  } else {
    const $elems = $parent.querySelectorAll('.zinput')
    if ($elems && $elems.length > 0) {
      $elems.forEach(zzb.zaction.detectFieldChanges)
    }
  }
}

_zaction.prototype.detectFieldChanges = function($elem) {
  const fnToggle = function ($toggler, useDisabled, noChange) {
    if (noChange) {
      useDisabled ? $toggler.disabled = true : $toggler.classList.add('d-none')
    } else {
      useDisabled ? $toggler.disabled = false : $toggler.classList.remove('d-none')
    }
  }

  const fnUpdateToggler = function(id, $toggler, useDisabled) {
    let noChange = true
    for (const [key, value] of Object.entries(cacheZInputs[id].changes)) {
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

  let id = $elem.getAttribute('id')
  if (!zzb.types.isStringNotEmpty(id)) {
    id = zzb.uuid.newV4().replace(/-/g, '')
    $elem.setAttribute('id', id)
  }

  let $toggler = document.getElementById($elem.getAttribute('ztoggler'))
  if (zzb.types.isObject($toggler)) {
    $toggler.setAttribute('zref-zinput-ptr', id)
    const useDisabled = $toggler.getAttribute('ztoggler-display') === 'disabled'
    fnToggle($toggler, useDisabled, true)

    cacheZInputs[id] = { originals: {}, changes: {} }

    const $fields = $elem.querySelectorAll('.zinput-field')
    $fields.forEach(function($field) {
      const fldName = $field.getAttribute('name')
      if (!zzb.types.isStringNotEmpty(fldName)) return

      const fldType = fnFindFieldType($field)
      cacheZInputs[id].originals[fldName] = (fldType === 'checkbox' || fldType === 'radio')
        ? $field.checked + ''
        : $field.value

      const zInputEvent = $field.getAttribute('zinput-event') || 'input'
      const handler = function (e) {
        const isEqual = (fldType === 'checkbox' || fldType === 'radio')
          ? cacheZInputs[id].originals[fldName] === this.checked + ''
          : cacheZInputs[id].originals[fldName] === this.value

        cacheZInputs[id].changes[fldName] = isEqual
        fnUpdateToggler(id, $toggler, useDisabled)
      }

      $field.addEventListener(zInputEvent, handler)
    })
  }
}


/**
 * DOMContentLoaded bootstrap for initializing Zazzy ZAction and ZUI.
 *
 * This listener is triggered once the DOM is fully parsed and ready.
 * It defines a `bootstrap()` function that sets up `.zaction` handlers
 * and invokes `zzb.zui.onZUIReady()` for core UI logic.
 *
 * To customize the startup flow (e.g. register custom handlers or delay
 * initialization), define a global `window.zzbReady(bootstrap)` function
 * on your page *before* this library is loaded. That function will receive
 * the `bootstrap` callback and can perform pre-initialization work before
 * finally invoking `bootstrap()` manually.
 *
 * Example use:
 * ```html
 * <script>
 *   window.zzbReady = function (bootstrap) {
 *     zzb.zaction.registerHandler({ id: 'vedDispatch', handler: handleCustom });
 *     zzb.zui.onZLoadSection(null, true); // optional custom load logic
 *     bootstrap(); // complete the standard setup
 *   };
 * </script>
 * <script src="/dist/zzb.ui.js"></script>
 * ```
 */
document.addEventListener('DOMContentLoaded', function () {
  const bootstrap = () => {
    if (zzb.zaction && zzb.zaction.addEventListeners) {
      zzb.zaction.addEventListeners('.zaction');
      zzb.zaction.runZLoadActions();
    }

    if (zzb.zui && typeof zzb.zui.onZUIReady === 'function') {
      zzb.zui.onZUIReady();
    }
  };

  if (typeof window.zzbReady === 'function') {
    try {
      window.zzbReady(bootstrap);
    } catch (e) {
      console.warn('zzbReady() threw error; falling back to default bootstrap.', e);
      bootstrap();
    }
  } else {
    bootstrap();
  }
}, false); // Always use `false` for bubble-phase listening

exports.j = _zaction

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

/***/ 204:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// _zui
// ---------------------------------------------------

/**
 * ZUI (Zazzy UI) utility class
 * Handles viewport detection, splitter/cache handling, and element initialization
 */
const _zui = function () {
  this.zsplitters = {}                  // Stores splitter states
  this.elemIniters = []                 // Initialization callbacks for UI elements
  this.defaultRWidth = 576              // Default responsive width fallback (e.g., for mobile detection)
  this.handlers = []                    // General event or mutation handlers
  this.breakpoints = {                  // Optional named breakpoints
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1400
  }
}

/**
 * Returns the default responsive width.
 * @returns {number}
 */
_zui.prototype.getDefaultRWidth = function () {
  return this.defaultRWidth
}

/**
 * Returns the current viewport width.
 * @returns {number} - Max of window.innerWidth and document.clientWidth
 */
function getViewportWidth () {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
}

/**
 * Checks if the viewport width is greater than a given breakpoint.
 * Accepts numeric or string alias (e.g., 'md').
 *
 * @param {number|string} rsize - Target responsive width or breakpoint alias.
 * @returns {boolean}
 */
_zui.prototype.isViewportGTRSize = function (rsize) {
  const bp = this.breakpoints

  if (typeof rsize === 'string' && bp[rsize]) {
    rsize = bp[rsize]
  }

  if (!zzb.types.isNumber(rsize) || rsize <= 0) {
    rsize = this.defaultRWidth
  }

  return getViewportWidth() > rsize
}

/**
 * Gets current viewport label (e.g., 'xs', 'sm', 'md', etc.) based on breakpoints.
 * @returns {string}
 */
_zui.prototype.getViewportLabel = function () {
  const width = getViewportWidth()
  const bp = this.breakpoints

  if (width <= bp.xs) return 'xs'
  if (width <= bp.sm) return 'sm'
  if (width <= bp.md) return 'md'
  if (width <= bp.lg) return 'lg'
  return 'xl'
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
      let zuiC = zzb.dom.cache.get('zuiC', { mode: 'persist' }) || { zsplitter: {} }
      zuiC.zsplitter[zsplitter.id] = zsplitter
      zzb.dom.cache.set('zuiC', zuiC, { mode: 'persist' })
    } catch (e) {
      console.log(e)
    }
  }
}

function createZSplitterToggle($resizer, $targetSide, setStaticWidth, setCacheZSplitter) {
  // Defensive: return no-op if elements are missing
  if (!$targetSide || !$resizer || typeof setStaticWidth !== 'function' || typeof setCacheZSplitter !== 'function') {
    return function () {}
  }

  return function(state) {
    let idxWidthStatic = 0

    switch (state) {
      case 'open':
        idxWidthStatic = 0
        $resizer.classList.remove('d-none')
        $targetSide.classList.remove('d-none')
        setCacheZSplitter(state)
        setStaticWidth()
        break
      case 'close':
        $targetSide.style.width = 0
        idxWidthStatic = -1
        $resizer.classList.remove('d-none')
        $targetSide.classList.remove('d-none')
        setCacheZSplitter(state)
        break
      case 'dismiss':
        idxWidthStatic = -1
        $resizer.classList.add('d-none')
        $targetSide.classList.add('d-none')
        break
    }

    zzb.zui.triggerZSplitterResize()
  }
}

function normalizeWidths(widths) {
  return widths.map(w => {
    return (!w || typeof w !== 'string') ? w : (/^\d+$/.test(w) ? `${w}px` : w)
  })
}

_zui.prototype.initZSplitter = function ($resizer, direction, arrToggableWidths) {
  const zsplitter = this.zsplitter.loadConfig($resizer)
  this.zsplitter.normalizeConfig(zsplitter)

  if (!arrToggableWidths) arrToggableWidths = []
  else if (!Array.isArray(arrToggableWidths)) arrToggableWidths = arrToggableWidths.split(',')

  const widths = this.zsplitter.normalizeWidths(arrToggableWidths)
  const $target = direction === 'left' ? $resizer.previousElementSibling : $resizer.nextElementSibling
  const $alt = direction === 'left' ? $resizer.nextElementSibling : $resizer.previousElementSibling
  const idxRef = { current: 0 }

  if (!zzb.types.isStringNotEmpty($resizer.id)) {
    $resizer.id = `zsplitter${Object.keys(this.zsplitters).length}${direction}`
  }

  const setWidth = () =>
    this.zsplitter.setStaticWidth(widths, idxRef.current, $target, $alt, $resizer)
  const setCache = (state) =>
    this.zsplitter.updateCache(zsplitter, setWidth, state)

  setWidth()
  this.zsplitter.applyInitialVisibility(zsplitter, widths, $resizer, $target, idxRef)
  this.zsplitter.attachTogglers($resizer, widths, idxRef, setWidth, setCache, $target)
  this.zsplitter.attachDragHandlers($resizer, direction, $target, $alt)

  const obj = this.getZSplitter($resizer.id)
  obj.toggle = createZSplitterToggle($resizer, $target, setWidth, setCache)
  this.setZSplitter($resizer.id, obj)
}

_zui.prototype.zsplitter = {

  loadConfig($resizer) {
    let config = zzb.dom.getAttributes($resizer, /^zsplitter-/, 10)
    config.id = $resizer.getAttribute('id')

    const usingCache = zzb.types.isStringNotEmpty(config.id)
    if (!usingCache) return config

    const zuiC = zzb.dom.cache.get('zuiC', { mode: 'persist' }) || { zsplitter: {} }
    if (!zuiC.zsplitter[config.id]) {
      zuiC.zsplitter[config.id] = config
      zzb.dom.cache.set('zuiC', zuiC, { mode: 'persist' })
    } else {
      config = zuiC.zsplitter[config.id]
    }
    return config
  },

  normalizeConfig(config) {
    if (config.show !== 'open' && config.show !== 'close') {
      config.show = null
    }
    if (zzb.types.isStringNotEmpty(config.rsize)) {
      config.rsize = Number(config.rsize)
    }
    if (!zzb.types.isNumber(config.rsize) || config.rsize < 0) {
      config.rsize = zzb.zui.getDefaultRWidth()
    }
  },

  normalizeWidths(widths) {
    return widths.map(w =>
      (!w || typeof w !== 'string') ? w : (/^\d+$/.test(w) ? `${w}px` : w)
    )
  },

  setStaticWidth(widths, idx, $target, $alt, $resizer) {
    if (widths.length === 0) return
    const raw = widths[idx]
    const isPercent = raw.endsWith('%')
    const parentWidth = $resizer.parentNode.getBoundingClientRect().width
    $resizer.getBoundingClientRect()
    const resizerWidth = $resizer.offsetWidth || 6

    if (!isPercent) {
      $target.style.width = raw
    } else {
      try {
        const pct = parseFloat(raw)
        const maxAvailable = parentWidth - resizerWidth
        $target.style.width = `${(pct / 100) * maxAvailable}px`
      } catch (e) {
        console.warn('Failed to set width', e)
        $target.style.width = '200px'
      }
    }
  },

  updateCache(config, setWidth, state) {
    if (zzb.types.isStringNotEmpty(config.id)) {
      config.show = state
      const zuiC = zzb.dom.cache.get('zuiC', { mode: 'persist' }) || { zsplitter: {} }
      zuiC.zsplitter[config.id] = config
      zzb.dom.cache.set('zuiC', zuiC, { mode: 'persist' })
    }
  },

  applyInitialVisibility(config, widths, $resizer, $target, idxRef) {
    const doReveal = widths.length > 0
    const doOpenClose = config.show === 'open' || config.show === 'close'

    if (doOpenClose) {
      if (config.show === 'close') {
        $target.style.width = 0
        idxRef.current = -1
      }
      $resizer.classList.toggle('d-none', !doReveal)
      $target.classList.toggle('d-none', !doReveal)
    }
  },

  attachTogglers($resizer, widths, idxRef, setWidth, setCache, $target) {
    $resizer.querySelectorAll('[zsplitter-toggable]').forEach(($btn) => {
      $btn.addEventListener('click', (ev) => {
        ev.preventDefault()
        idxRef.current++
        if (idxRef.current < widths.length) {
          setCache('open')
          setWidth()
        } else if (idxRef.current === widths.length) {
          setCache('close')
          idxRef.current = -1
          $target.style.width = '0'
        }
        zzb.zui.triggerZSplitterResize()
      }, false)
    })
  },

  attachDragHandlers($resizer, direction, $target, $alt) {
    let x = 0, y = 0, initialWidth = 0

    const onMouseDown = (e) => {
      if (e.target.closest('[zsplitter-toggable]')) return
      x = e.clientX
      y = e.clientY
      initialWidth = $target.getBoundingClientRect().width

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const onMouseMove = (e) => {
      const dx = e.clientX - x
      const dmod = direction === 'left' ? 1 : -1
      const containerWidth = $resizer.parentNode.getBoundingClientRect().width
      const newWidth = ((initialWidth + dx * dmod) * 100) / containerWidth
      $target.style.width = `${newWidth}%`

      $resizer.style.cursor = 'col-resize'
      document.body.style.cursor = 'col-resize'
      $target.style.userSelect = 'none'
      $target.style.pointerEvents = 'none'
      $alt.style.userSelect = 'none'
      $alt.style.pointerEvents = 'none'

      zzb.zui.triggerZSplitterResize()
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      $resizer.style.removeProperty('cursor')
      document.body.style.removeProperty('cursor')
      $target.style.removeProperty('user-select')
      $target.style.removeProperty('pointer-events')
      $alt.style.removeProperty('user-select')
      $alt.style.removeProperty('pointer-events')

      zzb.zui.triggerZSplitterResize()
    }

    $resizer.addEventListener('mousedown', onMouseDown)
  }
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

_zui.prototype.destroyZSplitter = function(id) {
  const splitter = this.zsplitters[id];
  if (splitter) {
    delete this.zsplitters[id];
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
          zzb.zui.initZSplitter($elem, 'left', attr.nodeValue)
          return true
        case 'zsplitter-right':
          zzb.zui.initZSplitter($elem, 'right', attr.nodeValue)
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
        this.elemIniters[ii] = initer
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
                if (zzb.types.isStringNotEmpty(vInput)) {
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

_zui.prototype.__registerBuiltins = function () {
  if (this.isRegisteredBuiltins) {
    return
  }

  this.isRegisteredBuiltins = true

  this.setElemIniter({
    name: 'zuiTableFilter',
    fn: function ($root) {
      const filterInput = $root.querySelector('.zui-tablecard-filter') || document.querySelector('.zui-tablecard-filter')
      const table = $root.querySelector('.zui-tablecard-table')
      const cardContainer = $root.querySelector('.zui-tablecard-cards')

      if (!table && !cardContainer) return

      const tableRows = table ? table.querySelectorAll('tbody tr') : []
      const cardRows = cardContainer ? cardContainer.querySelectorAll('.zui-tablecard-card') : []

      // Hook up filter if input exists
      if (filterInput) {
        function filterRecs(query) {
          const q = query.toLowerCase()
          if (tableRows) {
            tableRows.forEach(row => {
              row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none'
            })
          }
          if (cardRows) {
            cardRows.forEach(card => {
              card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none'
            })
          }
        }

        filterInput.addEventListener('input', function () {
          filterRecs(this.value)
        })

        if (table || cardContainer) {
          const currentValue = filterInput.value.trim()
          if (currentValue.length > 0) {
            filterRecs(currentValue)
          }
        }
      }

      if (table) {
        const headers = table.querySelectorAll('thead th')

        // Determine unique key for sort state tracking
        const tableKey = table.getAttribute('id') || table.dataset.sortKey || '__default_table__'

        // Ensure sort state exists in memory cache
        if (!zzb.dom.cache.get(tableKey, { mode: 'mem' })) {
          zzb.dom.cache.set(tableKey, { index: null, direction: 1 }, { mode: 'mem' });
        }
        const sortState = zzb.dom.cache.get(tableKey, { mode: 'mem' });

        headers.forEach((header, index) => {
          header.addEventListener('click', () => {
            const sortType = header.getAttribute('zui-sort-type') || 'text'
            const tbody = table.querySelector('tbody')
            if (!tbody) return
            const rows = Array.from(tbody.querySelectorAll('tr'))
            if (!rows || rows.length === 0) return

            // Toggle or set new sort direction
            if (sortState.index === index) {
              sortState.direction *= -1
            } else {
              sortState.index = index
              sortState.direction = -1 // change to 1 if first click should not sort
            }

            const direction = sortState.direction

            // Clear old sort classes
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'))
            // Add sort indicator class
            header.classList.add(direction === 1 ? 'sort-asc' : 'sort-desc')

            // Then sort using updated direction
            const sortedRows = rows.sort((a, b) => {
              const aCell = a.children[index]
              const bCell = b.children[index]
              return compareTableCells(aCell, bCell, sortType) * direction
            })

            // Update cache
            zzb.dom.cache.set(tableKey, sortState, { mode: 'mem' });

            // Re-append in sorted order
            sortedRows.forEach(row => tbody.appendChild(row))
          })
        })

        // Reapply previous sort if any
        if (sortState.index !== null) {
          const sortHeader = headers[sortState.index]
          if (sortHeader) {
            const sortType = sortHeader.getAttribute('zui-sort-type') || 'text'
            const tbody = table.querySelector('tbody')
            if (!tbody) return
            const rows = Array.from(tbody.querySelectorAll('tr'))
            if (!rows || rows.length === 0) return

            // Apply sort class again
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'))
            sortHeader.classList.add(sortState.direction === 1 ? 'sort-asc' : 'sort-desc')

            const sortedRows = rows.sort((a, b) => {
              const aCell = a.children[sortState.index]
              const bCell = b.children[sortState.index]
              return compareTableCells(aCell, bCell, sortType) * sortState.direction
            })

            sortedRows.forEach(row => tbody.appendChild(row))
          }
        }
      }
    }
  })
}

/**
 * Compares two table cell elements based on a type or custom sort definition.
 * Delegates value comparison to `zzb.types.compareValues`.
 *
 * @param {HTMLElement} aCell - First cell element.
 * @param {HTMLElement} bCell - Second cell element.
 * @param {string} type - Type of comparison (e.g., 'int', 'float', 'custom:field:subtype').
 * @returns {number} - Comparison result (-1, 0, 1).
 */
function compareTableCells(aCell, bCell, type) {
  let aVal, bVal, sortType;

  if (type.startsWith('custom:')) {
    const [, field, subtype = 'text'] = type.split(':');
    sortType = subtype;
    aVal = getCustomSortValue(aCell, field);
    bVal = getCustomSortValue(bCell, field);
  } else {
    sortType = type;
    aVal = aCell?.textContent?.trim() || '';
    bVal = bCell?.textContent?.trim() || '';
  }

  return zzb.types.compareValues(aVal, bVal, sortType);
}

/**
 * Extracts a subvalue from a table cell based on a custom field.
 *
 * @param {HTMLElement} cellElem - The table cell element.
 * @param {string} sortId - The sort ID to find within the cell.
 * @returns {string} - The extracted value, or empty string.
 */
function getCustomSortValue (cellElem, sortId) {
  if (!cellElem || typeof cellElem.querySelector !== 'function') return '';
  const target = cellElem.querySelector(`[zui-sort-id="${sortId}"]`);
  return target ? target.textContent.trim() : '';
}

/**
 * Core initializer for ZUI (Zazzy UI) once the environment is ready.
 *
 * This method is invoked by the global DOM bootstrap logic, and is responsible
 * for initializing internal ZUI systems. It assumes that all required DOM elements
 * are fully loaded and available.
 *
 * Specifically:
 * - Registers built-in initializers via `__registerBuiltins()`
 * - Executes `onLoadInit()` to configure layout and preload settings
 * - Executes `onElemInit()` to apply UI logic to the current DOM
 * - Triggers `onZLoadSection()` to run dynamic actions like zintervals or zloadsection
 *
 * This should **not** attach any global event listeners directly. Use this in coordination
 * with the global `DOMContentLoaded` hook which handles deferring setup logic.
 */
_zui.prototype.onZUIReady = function () {
  if (typeof this.__registerBuiltins === 'function') {
    this.__registerBuiltins();
  }
  this.onLoadInit();
  this.onElemInit();
  this.onZLoadSection();
};

exports.T = _zui


/***/ }),

/***/ 247:
/***/ ((__unused_webpack_module, exports) => {

// ---------------------------------------------------
// time
// ---------------------------------------------------

/**
 * Time Manager that controls interval timers with customizable actions,
 * automatic starting, caching, and UI element interaction.
 */
function _time() {}

/**
 * ZazzyInterval Class
 *
 * Manages a single interval timer with customizable behavior such as:
 * - Automatic start
 * - Cache management
 * - Refresh and action on each interval
 * - Pause, unpause, and clear functionality
 */
class ZazzyInterval {
  constructor(options) {
    this.options = ZazzyInterval.getDefaults(options);
    if (this.options.autostart) {
      this.start();
    }
  }

  /**
   * Returns the default options for the interval timer.
   * Merges passed options with the defaults.
   */
  static getDefaults(options) {
    const defaultOptions = {
      interval: 60000,
      autostart: false,
      id: null,
      targetClick: null,
      datacache: false,
      action: function() { console.log('ZazzyInterval no-op'); },
      _cache: null,
      _itoken: null,
      _isPaused: false
    };

    // Merge the default options with user-provided options.
    options = zzb.types.isObject(options) ? zzb.types.merge(defaultOptions, options) : defaultOptions;
    options.autostart = options.autostart === true;

    if (!zzb.types.isStringNotEmpty(options.id)) {
      options.id = zzb.uuid.newV4();
    }

    // Ensure the action is a valid function.
    if (!zzb.types.isFunction(options.action)) {
      throw new Error('The "action" option must be a function.');
    }

    // Set default methods if not provided.
    options.new = options.new || function() {
      options._itoken = setInterval(options.refresh, options.interval);
      options._isPaused = false;
    };

    options.clear = options.clear || function(doPause) {
      if (options._itoken != null) {
        clearInterval(options._itoken);
        options._itoken = null;
        if (doPause) {
          options._isPaused = true;
        }
      }
    };

    options.unpause = options.unpause || function() {
      if (options._isPaused) {
        options._itoken = setInterval(options.refresh, options.interval);
        options._isPaused = false;
      }
    };

    options.refresh = options.refresh || function() {
      if (options._itoken != null) {
        options._isPaused = false;
        options.action && options.action();
      }
    };

    return options;
  }

  /**
   * Starts the interval timer.
   */
  start() {
    if (zzb.types.isFunction(this.options.new)) {
      this.options.new();
    }
  }

  /**
   * Clears the interval timer and optionally pauses it.
   * @param {boolean} doPause - If true, pauses the interval.
   */
  clear(doPause) {
    if (zzb.types.isFunction(this.options.clear)) {
      this.options.clear(doPause);
    }
  }

  /**
   * Unpauses the interval timer if it was paused.
   */
  unpause() {
    if (zzb.types.isFunction(this.options.unpause)) {
      this.options.unpause();
    }
  }

  /**
   * Refreshes the interval and runs the action.
   */
  refresh() {
    if (zzb.types.isFunction(this.options.refresh)) {
      this.options.refresh();
    }
  }

  /**
   * Sets the cache for this interval timer.
   * @param {object} obj - The object to store in the cache.
   */
  setCache(obj) {
    this.options._cache = this.options.datacache ? obj : null;
  }

  /**
   * Gets the cache for this interval timer.
   * @returns {object|null} - The cached object or null.
   */
  getCache() {
    return this.options.datacache ? this.options._cache : null;
  }

  /**
   * Checks if this interval timer has a cached object.
   * @returns {boolean} - True if cache exists, false otherwise.
   */
  hasCache() {
    return this.options.datacache && this.options._cache != null;
  }
}

/**
 * _time Class for managing multiple ZazzyInterval instances.
 * Provides functions to add, clear, unpause, and manage intervals.
 */
_time.prototype.ZazzyInterval = ZazzyInterval;

/**
 * Retrieves a specific interval timer by its ID.
 * @param {string} id - The ID of the interval to retrieve.
 * @returns {ZazzyInterval|null} - The interval timer or null if not found.
 */
_time.prototype.getInterval = function(id) {
  if (!this.myIntervals || !zzb.types.isStringNotEmpty(id) || !this.myIntervals[id]) {
    return null;
  }
  return this.myIntervals[id];
};

/**
 * Clears all interval timers and optionally pauses them.
 * @param {boolean} doPause - If true, pauses all intervals.
 */
_time.prototype.clearAll = function(doPause) {
  if (!this.myIntervals || !zzb.types.isObject(this.myIntervals)) {
    return;
  }
  for (const key in this.myIntervals) {
    if (this.myIntervals[key] instanceof ZazzyInterval) {
      this.myIntervals[key].clear(doPause);  // Ensure it's an instance of ZazzyInterval
    }
  }
};

/**
 * Unpauses all interval timers.
 */
_time.prototype.unpauseAll = function() {
  if (!this.myIntervals || !zzb.types.isObject(this.myIntervals)) {
    return;
  }
  for (const key in this.myIntervals) {
    this.myIntervals[key].unpause();
  }
};

/**
 * Creates a new interval timer with the given options.
 * @param {object} options - The options for the new interval timer.
 * @returns {ZazzyInterval} - The newly created ZazzyInterval instance.
 * @throws {Error} - Throws an error if the interval creation fails.
 */
_time.prototype.newInterval = function(options) {
  if (!this.myIntervals) {
    this.myIntervals = {};
  }

  if (options && options.id && zzb.types.isStringNotEmpty(options.id)) {
    if (this.myIntervals[options.id]) {
      return this.myIntervals[options.id];
    }
  }

  const myInterval = new ZazzyInterval(options);  // Ensure this is an instance of ZazzyInterval
  if (myInterval && myInterval.options && zzb.types.isStringNotEmpty(myInterval.options.id)) {
    this.myIntervals[myInterval.options.id] = myInterval;
    return myInterval;
  }

  throw new Error('Failed to create ZazzyInterval');
};

/**
 * Initializes an interval tied to a UI element.
 * The element must have the `zi-*` attributes for customization.
 * @param {HTMLElement} $elem - The DOM element to associate the interval with.
 */
_time.prototype.newUIInterval = function ($elem) {
  if (!$elem) {
    return;
  }

  // Prevent re-initialization if already initialized
  if ($elem.getAttribute('zi-inited') === 'true') {
    return; // Prevent re-initialization
  }

  // Set default ID if the element doesn't already have one
  if (!zzb.types.isStringNotEmpty($elem.getAttribute('id'))) {
    $elem.setAttribute('id', zzb.uuid.newV4());  // Generate an ID if not provided
  }

  // Set the 'zi-inited' attribute to 'true' before starting the interval
  $elem.setAttribute('zi-inited', 'true');

  // Set the targetClick to the element's ID
  const targetClick = $elem.getAttribute('id');

  // Get the interval value from the element's attributes or use default if not provided
  const interval = zzb.dom.getAttributeElse($elem, 'zi-interval', 60000);  // Default to 60000ms (1 minute)

  // Get the run limit from the element's attribute (if provided)
  const runLimit = parseInt($elem.getAttribute('zi-run-limit')) || Infinity;  // Default is no limit

  // Track the number of runs
  let runCount = 0;

  // Initialize the interval
  const intervalId = setInterval(() => {

    // Skip action if any modal is open
    if (document.querySelectorAll('.modal.show').length > 0) {
      return;
    }

    // Get the element to trigger the action
    const element = document.getElementById(targetClick);
    if (!element) {
      console.warn('Element not found:', targetClick);
      return;
    }

    // Perform the action (e.g., clicking the element)
    element.setAttribute('zi-noclick', 'true');
    element.click();

    // Increment the run count
    runCount++;

    // If the run count exceeds the run limit, stop the interval
    if (runCount >= runLimit) {
      clearInterval(intervalId);  // Stop the interval
    }
  }, interval);  // Use the interval from the element or default to 60000ms

  // Store the interval ID in the element's `zi-interval-id` attribute
  $elem.setAttribute('zi-interval-id', intervalId);

  // Optionally store the interval ID in the global `myIntervals` to track it (if necessary)
  const elementId = $elem.getAttribute('id');
  if (!this.myIntervals) {
    this.myIntervals = {};
  }

  this.myIntervals[elementId] = intervalId;
};

exports.k = _time;


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
/******/ 	var __webpack_exports__ = __webpack_require__(856);
/******/ 	
/******/ })()
;