/* global describe, it */
var zzbLoader = require('../src/zzb-server.js').zzbLoader

describe('Validate zzb.rob methods', function () {
  var zzb = zzbLoader()
  var sPig = 'The pig smelled the mushrooms.'

  describe('Expected properties: createError (mimics but is non-Error type)', function () {
    it('should have default type === error and isErr === true', function (done) {
      var err = null
      var robErr = zzb.rob.createError({ message: sPig })
      if (robErr.type !== 'error') {
        err = new Error('robErr.type is not error but ' + robErr.type)
      } else if (robErr.isErr !== true) {
        err = new Error('robErr.isErr is false when it should be true')
      }
      done(err)
    })

    it('should have type === emerg and isErr === true', function (done) {
      var err = null
      var robErr = zzb.rob.createError({ type: 'emerg', message: sPig })
      if (robErr.type !== 'emergency') {
        err = new Error('robErr.type is not emergency but ' + robErr.type)
      } else if (robErr.isErr !== true) {
        err = new Error('robErr.isErr is false when it should be true')
      }
      done(err)
    })

    it('should have type === info and isErr === false', function (done) {
      var err = null
      var robErr = zzb.rob.createError({ type: 'info', message: sPig })
      if (robErr.type !== 'info') {
        err = new Error('robErr.type is not info but ' + robErr.type)
      } else if (robErr.isErr !== false) {
        err = new Error('robErr.isErr is true when it should be false')
      }
      done(err)
    })

    it('should have correct message', function (done) {
      var err = null
      var robErr = zzb.rob.createError({ message: sPig })
      if (robErr.message !== sPig) {
        err = new Error('robErr.message does not have the expected message')
      }
      done(err)
    })

    it('should have default stack trace of empty', function (done) {
      var err = null
      var robErr = zzb.rob.createError({ message: sPig })
      if (zzb.types.isNonEmptyString(robErr.stack)) {
        err = new Error('robErr.stack exists when it should not')
      }
      done(err)
    })

    it('should have stack trace', function (done) {
      var err = null
      var robErr = zzb.rob.createError({ message: sPig, stack: (new Error()).stack })
      if (!zzb.types.isNonEmptyString(robErr.stack)) {
        err = new Error('robErr.stack does not exist when it should')
      }
      done(err)
    })

    it('should create error from string (non-object)', function (done) {
      var err = null
      var robErr = zzb.rob.createError(sPig)
      if (robErr.type !== 'error') {
        err = new Error('robErr.type is not error but ' + robErr.type)
      } else if (robErr.isErr !== true) {
        err = new Error('robErr.isErr is false when it should be true')
      } else if (robErr.message !== sPig) {
        err = new Error('robErr.message does not have the expected message')
      }
      done(err)
    })

    it('should create from string (non-object) and crit object', function (done) {
      var err = null
      var robErr = zzb.rob.createError(sPig, { type: 'crit' })
      if (robErr.type !== 'crit') {
        err = new Error('robErr.type is not warning but ' + robErr.type)
      } else if (robErr.isErr !== true) {
        err = new Error('robErr.isErr is false when it should be true')
      } else if (robErr.message !== sPig) {
        err = new Error('robErr.message does not have the expected message')
      }
      done(err)
    })

    it('should throw err b/c createError param type unsupported', function (done) {
      var err = null
      try {
        var robErr = zzb.rob.createError([{ message: sPig }])
        if (robErr) {
          err = new Error('robErr should not have been created')
        }
      } catch (ex) {
        // good :)
      }
      done(err)
    })
  })

  var arrRobErrs = [
    zzb.rob.createError({ message: sPig }), // type === error
    zzb.rob.createError({ type: 'emerg', message: sPig }),
    zzb.rob.createError({ field: 'fieldABC', type: 'error', message: sPig }),
    zzb.rob.createError({ field: '_system', type: 'info', message: sPig }),
    zzb.rob.createError({ type: 'warn', message: sPig }),
    zzb.rob.createError({ field: 'fieldXYZ', type: 'info', message: sPig })
  ]
  var listErrs = zzb.rob.toListErrs(arrRobErrs)

  describe('zzb.rob.toListErrs', function () {
    it('should have errors/messages', function (done) {
      var err = null
      if (!listErrs.hasErrors()) {
        err = new Error('zzb.rob.hasErrors() should have errors')
      } else if (!listErrs.hasMessages()) {
        err = new Error('zzb.rob.hasMessages() should have messages')
      }
      done(err)
    })

    it('should have 3 errors', function (done) {
      var err = null
      if (listErrs.combinedErrors().length !== 3) {
        err = new Error('zzb.rob.combinedErrors() should equal 3 but instead has ' + listErrs.combinedErrors().length)
      } else if (listErrs.system.length !== 2) {
        err = new Error('zzb.rob.system length should be 2')
      } else if (listErrs.fields.length !== 1) {
        err = new Error('zzb.rob.fields length should be 1')
      }
      done(err)
    })

    it('should have 2 messages', function (done) {
      var err = null
      if (listErrs.combinedMessages().length !== 3) {
        err = new Error('zzb.rob.combinedErrors() should equal 3 but instead has ' + listErrs.combinedMessages().length)
      } else if (listErrs.systemMessages.length !== 2) {
        err = new Error('zzb.rob.systemMessages length should be 2')
      } else if (listErrs.fieldMessages.length !== 1) {
        err = new Error('zzb.rob.fieldMessages length should be 1')
      }
      done(err)
    })

    it('should have correct message', function (done) {
      var err = null
      for (var kk = 0; kk < listErrs.combinedErrors(); kk++) {
        if (listErrs.combinedErrors()[kk].message !== sPig) {
          err = new Error('invalid message where at ' + kk + ' in combinedErrors()')
          break
        }
      }
      if (!err) {
        for (var ii = 0; ii < listErrs.combinedErrors(); ii++) {
          if (listErrs.combinedMessages()[ii].message !== sPig) {
            err = new Error('invalid message where at ' + ii + ' in combinedErrors()')
            break
          }
        }
      }
      done(err)
    })
  })

  describe('zzb.rob.renderListErrs', function () {
    it('should have string of format=text', function (done) {
      var err = null
      var messages = zzb.rob.renderListErrs({ errs: listErrs.system })
      if (!zzb.types.isNonEmptyString(messages)) {
        err = new Error('no format of text generated')
      }
      done(err)
    })
    it('should have string of format=html-list', function (done) {
      var err = null
      var messages = zzb.rob.renderListErrs({ errs: listErrs.system, format: 'html-list' })
      if (!zzb.types.isNonEmptyString(messages)) {
        err = new Error('no format of text generated')
      }
      done(err)
    })
  })
})
