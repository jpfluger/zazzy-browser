// css styling for modal uses bootstrap4-fs-modal
// https://github.com/keaukraine/bootstrap4-fs-modal

// client or server
var _ = require('lodash')

// ---------------------------------------------------
// BootstrapDialog
// refined port of https://github.com/nakupanda/bootstrap3-dialog (MIT LICENSE)
// ---------------------------------------------------

var ZazzyDialog = function (options) {

    this.defaultOptions = _.merge({
        id: zzb.uuid.newV4(),
        className: '',
        title: '',
        body: '',
        buttons: [],
        onShow: null,
        onShown: null,
        onHide: null,
        onHidden: null
    }, options);

    this.defaultOptions.onShow = typeof options.onShow == 'function' ? options.onShow : function () {};
    this.defaultOptions.onShown = typeof options.onShown == 'function' ? options.onShown : function () {};
    this.defaultOptions.onHide = typeof options.onHide == 'function' ? options.onHide : function () {};
    this.defaultOptions.onHidden = typeof options.onHidden == 'function' ? options.onHidden : function () {};
};

ZazzyDialog.prototype.getId = function () {
  if (!(zzb.types.isNonEmptyString(this.defaultOptions.id))) {
    this.defaultOptions.id = zzb.uuid.newV4();
  }
  return this.defaultOptions.id
}

ZazzyDialog.prototype.getClassName = function () {
  if (!(zzb.types.isNonEmptyString(this.defaultOptions.className))) {
    this.defaultOptions.className = '';
  }
  return this.defaultOptions.className
}

ZazzyDialog.prototype.getTitle = function () {
  if (!(zzb.types.isNonEmptyString(this.defaultOptions.title))) {
    this.defaultOptions.title = '';
  }
  return this.defaultOptions.title
}

ZazzyDialog.prototype.getBody = function () {
  if (!(zzb.types.isNonEmptyString(this.defaultOptions.body))) {
    this.defaultOptions.body = '';
  }
  return this.defaultOptions.body
}

ZazzyDialog.prototype.create$Modal = function () {

  var options = {
    id: this.getId(),
    arialabel: 'arialabel' + this.getId(),
    className: this.getClassName(),
    title: this.getTitle(),
    body: this.getBody()
  };

  var template = '<div class="modal fade modal-fullscreen {cssClass}" id="{id}" tabindex="-1" role="dialog" aria-labelledby="{arialabel}" aria-hidden="true">'
                 + '<div class="modal-dialog" role="document">'
                   + '<div class="modal-content">'
                     + '<div class="modal-header">'
                       + '<h5 class="modal-title" id="{arialabel}">{title}</h5>'
                         + '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
                           + '<span aria-hidden="true">&times;</span>'
                         + '</button>'
                       + '</div>'
                      + '<div class="modal-body">{body}</div>'
                      + '<div class="modal-footer">'
                      + '</div>'
                    + '</div>'
                  + '</div>'
                + '</div>';

  var $modal = $(zzb.strings.format(template, options))

  if (!(Array.isArray(this.defaultOptions.buttons))) {
    this.defaultOptions.buttons = [];
  }

  var self = this;

  _.each(this.defaultOptions.buttons, function (button, ii) {

    if (zzb.types.isNonEmptyString(button)) {
      button = self.getButtonPreset(button)
    }

    if (!(zzb.types.isObject(button))) {
      return // continue
    }

    if (!(zzb.types.isNonEmptyString(button.id))) {
      button.id = 'button-' + ii + '-' + self.getId()
    }

    var $button = $(zzb.strings.format('<button id="{id}" type="button" class="btn btn-default {className}">{name}</button>', button));
    $button.data('button', button);

    // Button action (eg onClick)
    $button.on('click', {dialog: self, $button: $button, button: button}, function (event) {
        var dialog = event.data.dialog;
        var $button = event.data.$button;
        var button = $button.data('button');
        if (typeof button.action === 'function') {
            return button.action.call($button, dialog, event);
        }
    });

    if ($modal.find('.modal-footer > button').length > 0) {
      $button.insertAfter($modal.find('.modal-footer > button').last())
    } else {
      $modal.find('.modal-footer').append($button)
    }
  });

  return $modal;
}

ZazzyDialog.prototype.getButtonPreset = function (preset) {
  var button = {id: null, name: '', className: '', action: null};

  var dismiss = function(dialog, ev) {
    dialog.close()
  };

  switch(preset) {
    case 'BUTTON_CLOSE':
        button.name = 'Close';
        button.action = dismiss
        break;
    case 'BUTTON_OK':
        button.name = 'Ok';
        break;
    case 'BUTTON_YES':
        button.name = 'Yes';
        break;
    case 'BUTTON_NO':
        button.name = 'No';
        button.autoDismiss = dismiss
        break
    case 'BUTTON_CANCEL':
        button.name = 'Cancel';
        button.autoDismiss = dismiss
        break
    default:
        button = null
  }

  return button
}

ZazzyDialog.prototype.open = function () {

  if (!this.$modal) {
    this.$modal = this.create$Modal()
    var self = this

    this.$modal.appendTo('body');

    // https://getbootstrap.com/docs/4.0/components/modal/#events
    this.$modal.on('show.bs.modal', function (ev) {
      self.onShow.call(self, ev);
    });
    this.$modal.on('shown.bs.modal', function (ev) {
      self.onShown.call(self, ev);
    });
    this.$modal.on('hide.bs.modal', function (ev) {
      self.onHide.call(self, ev);
    });
    this.$modal.on('hidden.bs.modal', function (ev) {
      self.onHidden.call(self, ev);
    });
  }

  this.$modal.modal('show');
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
}

ZazzyDialog.prototype.close = function () {
  this.$modal.modal('hide');
}

ZazzyDialog.prototype.hide = function () {
  // delete dialog from the body
  this.$modal.modal('hide');
  this.$modal.modal('dispose');
  if ($('#' + this.getId()).length > 0) {
    $('#' + this.getId()).remove();    
  }
  this.$modal = null;
}


/**
 *  Some constants.
ZazzyDialog.BUTTON_CLOSE = 'BUTTON_CLOSE';
ZazzyDialog.BUTTON_OK = 'BUTTON_OK';
ZazzyDialog.BUTTON_YES= 'BUTTON_YES';
ZazzyDialog.BUTTON_NO = 'BUTTON_NO';
ZazzyDialog.BUTTON_CANCEL = 'BUTTON_CANCEL';
 */

/*
ZazzyDialog.NAMESPACE = 'zzb-bootstrap-dialog';
ZazzyDialog.TYPE_DEFAULT = 'type-default';
ZazzyDialog.TYPE_INFO = 'type-info';
ZazzyDialog.TYPE_PRIMARY = 'type-primary';
ZazzyDialog.TYPE_SUCCESS = 'type-success';
ZazzyDialog.TYPE_WARNING = 'type-warning';
ZazzyDialog.TYPE_DANGER = 'type-danger';
*/

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

var _dialogs = function () {
  this.BUTTON_CLOSE = 'BUTTON_CLOSE';
  this.BUTTON_OK = 'BUTTON_OK';
  this.BUTTON_YES= 'BUTTON_YES';
  this.BUTTON_NO = 'BUTTON_NO';
  this.BUTTON_CANCEL = 'BUTTON_CANCEL';  
}

_dialogs.prototype.modal = function (options) {
  return new ZazzyDialog(options)
}

_dialogs.prototype.showMessage = function (options) {
  options = _.merge({
    type: BootstrapDialog.TYPE_DEFAULT,
    title: '',
    message: '',
    buttonCloseName: 'Ok',
    onShown: null
  }, options)

  alert('showMessage');
  /*
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
  })*/
}

_dialogs.prototype.showMessageChoice = function (options) {

  alert('showMessageChoice');

  /*
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
  */
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
