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
          if (zzb.types.isStringNotEmpty(data.message)) {
            noFinalResolve = true
            zzb.dialogs.showMessage({
              className: 'zzb-dialog-flash-message ' + zzb.strings.format('zzb-dialog-flash-status-{0}', rob.hasErrors() ? 'error' : 'okay'),
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
      callback(objReturn, null);
    })
    .catch(function (err) {

      let errMessage = ''
      if (err && zzb.types.isStringNotEmpty(err.message)) {
        if (options.NOCATCHLOG !== true) {
          console.log(err.message)
        }
        if (options.SHOWCATCHMESSAGE !== true) {
          errMessage = err.message
        }
      }

      // UI Dialog to display the error
      if (options.NOCATCHFLASH !== true) {
        let divErr = ''
        if (zzb.types.isStringNotEmpty(errMessage)) {
          divErr = zzb.strings.format('\n<div class="zzb-dialog-error-catch">Error: {0}</div>', errMessage)
        }
        if (zzb.types.isStringNotEmpty(options.CATCHFLASHMESSAGE)) {
          zzb.ajax.showMessageFailedAction({ message: options.CATCHFLASHMESSAGE + divErr })
        } else {
          zzb.ajax.showMessageFailedAction({ message: AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED + divErr })
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

// Sometimes a request is made for an html snippet but json is returned. The function will error if the dataType i
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
AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED = 'Communications with remote service failed unexpectedly.'
// Override by setting the value of options.CATCHFLASHMESSAGE
// AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED_NETWORK = 'Communications failed unexpectedly. This is likely a broken network connection and will resolve itself once reconnected.'
// AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED_NETWORK_VERBOSE = 'Communications failed unexpectedly. This is likely a broken network connection and will resolve itself once reconnected. Either your network is down or our server is down.'
// AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED_WITHADMIN = 'Communications failed unexpectedly. Contact the administrator should the problem persist.'
// AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED_NETWORK_WITHADMIN = 'Communications failed unexpectedly. This is likely a broken network connection and will resolve itself once reconnected. Contact the administrator should the problem persist.'

_ajax.prototype.showMessageFailedAction = function (options) {
  options = zzb.types.merge({ err: null, number: null, message: AjaxMessage.MSG_FAILED_ACTION_UNEXPECTED }, options)
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

exports.ajax = _ajax
