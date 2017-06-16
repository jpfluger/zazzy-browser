// client only
var $ = require('jQuery')

// client or server
var _ = require('lodash')

// ---------------------------------------------------
// _ajax
// ---------------------------------------------------

function _ajax () {
  this.ajax = function (options) {
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

          if (!jqXHR.responseJSON) {
            // html or some other data type was returned
            data = {recs: [data]}
          } else {
            // always redirect, if present
            if (data.redirect && data.redirect.length > 0) {
              window.location.href = data.redirect
              return
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
                data.error = zzb.rob.sanitizeErrors(data.error)
                data.error = null
              } else if (data.errs) {
                data.errs = zzb.rob.sanitizeErrors(data.errs)
                data.err = null
              }
            }

            // Records are ALWAYS an array
            if (!data.ISROBRECS) {
              if (data.recs) {
                data.recs = zzb.rob.sanitizeRecords(data.rec)
              } else if (data.rec) {
                data.recs = zzb.rob.sanitizeRecords(data.rec)
                data.rec = null
              } else {
                // pass in self
                data.recs = zzb.rob.sanitizeRecords(data)
              }
            }
          }

          data.first = function () {
            return (data.recs && Array.isArray(data.recs) && data.recs.length > 0 ? data.recs[0] : null)
          }
          data.find = function (key, value) {
            var hit = null
            _.each(data.recs, function (rec) {
              if (rec && zzb.types.isObject(rec) && !Array.isArray(rec) && rec[key] === value) {
                hit = rec
                return false
              }
            })
            return hit
          }
          data.length = function () {
            return (data.recs && Array.isArray(data.recs) ? data.recs.length : 0)
          }

          resolve(data)
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          // if (jqXHR.responseJSON) {
          //  if (data.redirect) {
          //    return window.location.href = data.redirect
          //  }
          // }
          reject(errorThrown)
          console.log(errorThrown)
        })
    })
  }
}

// sometimes a request is made for an html snippet but json is returned
// this is why dataType is commented out here b/c the calling function isn't certain what type of data will return
_ajax.prototype.get = function (options) {
  options.type = 'GET'
  options.contentType = 'application/json; charset=UTF-8'
  options.data = JSON.stringify(options.data)
  return this.ajax(options)
}

_ajax.prototype.getJSON = function (options) {
  options.type = 'GET'
  options.dataType = 'json'
  options.contentType = 'application/json; charset=UTF-8'
  options.data = JSON.stringify(options.data)
  return this.ajax(options)
}

_ajax.prototype.postJSON = function (options) {
  options.type = 'POST'
  options.dataType = 'json'
  options.contentType = 'application/json; charset=UTF-8'
  options.data = JSON.stringify(options.data)
  return this.ajax(options)
}

exports.ajax = _ajax
