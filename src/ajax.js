// client only
var $ = require('jQuery')

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
