// css styling for modal uses bootstrap4-fs-modal
// https://github.com/keaukraine/bootstrap4-fs-modal

// client or server
var _ = require('lodash')

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
    classModalHeader: ''
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

  var template = '<div class="modal {classFade} modal-fullscreen {className}" {extraAttributes} id="{id}" tabindex="-1" role="dialog" aria-labelledby="{arialabel}" aria-hidden="true">' +
    '<div class="modal-dialog{classVerticalCenter}" role="document">' +
    '<div class="modal-content">' +
    '<div class="modal-header{classModalHeader}">' +
    '<h5 class="modal-title" id="{arialabel}">{title}</h5>' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
    '<span aria-hidden="true">&times;</span>' +
    '</button>' +
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
