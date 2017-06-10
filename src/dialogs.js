// client only
var BootstrapDialog = require('BootstrapDialog')

// client or server
var _ = require('lodash')

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

var _dialogs = function() {}

_dialogs.prototype.showMessage = function(options) {
  options = _.merge({
    type: BootstrapDialog.TYPE_DEFAULT,
    title: '',
    message: '',
    buttonCloseName: 'Ok',
    onShown: null
  }, options)

  BootstrapDialog.show({
    type: options.type,
    title: options.title,
    message: options.message,
    onshown: options.onShown,
    buttons: [{
      label: options.buttonCloseName,
      action: function (dialogRef) {
        dialogRef.close();
      }
    }]
  });
};

_dialogs.prototype.showMessageChoice = function(options) {
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
          options.onButtonLeftClick(function(err) {
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
          options.onButtonRightClick(function(err) {
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
}

_dialogs.prototype.handleError = function(options) {
  //this.dialogs.handleError({log: 'failed to retrieve login dialog form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the login form. Please check your connection settings and try again.'})
  options = _.merge({log: null, title: '', message: null, errs: null}, options)

  if (options.log) {
    console.log(options.log)
  }

  if (options.errs) {
    if (Array.isArray(options.errs) && options.errs.length > 0 && options.errs[0]) {
      var arrHtml = []

      _.each(options.errs, function(err, index) {
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
