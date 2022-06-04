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
      forceNoBootstrap: false
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

    // if (!this.isBootstrap) {
    //   htmlModal = '<div id="' + options.id + '" class="modal" tabIndex="-1" role="dialog" aria-hidden="true">'
    //     + '<div class="modal-dialog">'
    //     + '<div class="modal-content">'
    //     + '<div class="modal-header">'
    //     + '<h5 class="modal-title">Modal Header</h5>'
    //     + '<button type="button" data-bs-dismiss="modal" aria-label="Close">'
    //     + '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">'
    //     + '<path fill-rule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>'
    //     + '</svg>'
    //     + '</button>'
    //     + '</div>'
    //     + '<div class="modal-body">'
    //     + '<h1>My Modal</h1>'
    //     + '<button type="button" class="btn" data-bs-dismiss="modal">Close</button>'
    //     + '</div>'
    //     + '</div>'
    //     + '</div>'
    //     + '</div>'
    // } else {
    //   htmlModal = '<div class="modal fade" id="' + options.id + '" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">'
    //     + '<div class="modal-dialog">'
    //     + '<div class="modal-content">'
    //     + '<div class="modal-header">'
    //     + '<h5 class="modal-title" id="staticBackdropLabel">Modal title</h5>'
    //     + '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
    //     + '</div>'
    //     + '<div class="modal-body">'
    //     + 'some body content here'
    //     + '</div>'
    //     + '<div class="modal-footer">'
    //     + '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>'
    //     + '<button type="button" class="btn btn-primary">Understood</button>'
    //     + '</div>'
    //     + '</div>'
    //     + '</div>'
    //     + '</div>'
    // }

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

    if (zzb.types.isStringNotEmpty(options.dataBackdrop)) {
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

exports.dialogs = _dialogs
