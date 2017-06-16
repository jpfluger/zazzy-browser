// client only
var $ = require('jQuery')

// client or server
var _ = require('lodash')

// ---------------------------------------------------
// _status
//
// Gets status info (eg user, page roles)
// Various site designs set permission-based UI elements (1) on the server only, (2) on the client-only or (3) mix of both.
// This function helps a page obtain status info, if using #2 or #3
// It optionally returns a specific role and page that a user may access
// ---------------------------------------------------

// example status (aka zzbStatus)
//   {user: {isLoggedIn: false, username: null, roles: {}}, page: {path: '/'}

var _status = function () {
  this.zzbStatus = null
}

// The status can be embedded in sessionStorage or an attribute otherwise tries an ajax call.
_status.prototype.get = function (options, callback) {
  options = _.merge({path: window.location.path, role: null})

  var setSelf = (options.path === window.location.path && !options.role)

  if (setSelf) {
    if (this.zzbStatus) {
      return callback && callback(null, this.zzbStatus)
    }

    var tmpStatus = null

    // Try local storage first (if top-level page supports it) -> this function will delete it, if found
    if (typeof Storage !== 'undefined' && sessionStorage.zzbStatus) {
      try {
        // using sessionStorage (not localStorage)
        tmpStatus = JSON.parse(sessionStorage.getItem('zzbStatus'))
      } catch (err) {
        console.log('unable to parse zzbStatus from sessionStorage: ' + err)
      }

      sessionStorage.setItem('zzbStatus', null)

      if (tmpStatus) {
        this.zzbStatus = tmpStatus
        return callback && callback(null, this.zzbStatus)
      }
    }

    // status might be embedded in an attribute
    if ($('#zzbStatus').length > 0 && zzb.types.isNonEmptyString($('#zzbStatus').attr('status'))) {
      try {
        tmpStatus = JSON.parse($('#zzbStatus').attr('status'))
      } catch (err) {
        console.log('unable to parse zzbStatus from embedded attribute in #zzbStatus: ' + err)
      }
      if (tmpStatus) {
        this.zzbStatus = tmpStatus
        return callback && callback(null, this.zzbStatus)
      }
    }
  }

  // not in session storage? (best) try a server-side call to '/zzb/status'
  // REQUIRES (callback)
  // if err then returns defaults where isLoggedIn = false
  tmpStatus = {user: {isLoggedIn: false, username: null}, page: {path: window.location.pathname}}
  // remember newbies that inside .then() that "this" refrences the .then() function, so using "that" is a workaround
  var that = this

  zzb.ajax.postJSON({
    url: '/zzb/status',
    data: options
  })
  .then(function (rob) {
    if (rob.errs) {
      callback && callback(rob.errs, tmpStatus)
    } else {
      if (setSelf) {
        that.zzbStatus = rob.one()
      }
      callback && callback(null, rob.one())
    }
  })
  .catch(function (err) {
    console.log('failed to retrieve zzbStatus: using defaults')
    callback && callback(zzb.types.sanitizeErrors(err), tmpStatus)
  })
}

exports.status = _status
