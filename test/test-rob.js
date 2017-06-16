/* global describe, it */
var zzbLoader = require('../src/zzb-server.js').zzbLoader

describe('Validate zzb.rob methods', function () {
  var zzb = zzbLoader()
  var sPig = 'The pig smelled the mushrooms.'

  describe('Expected properties: createError (mimics but is non-Error type)', function () {
    it('should have default type === error and isErr === true', function (done) {
      var err = null
      var robErr = zzb.rob.createError({message: sPig})
      if (robErr.type !== 'error') {
        err = new Error('robErr.type is not error but ' + robErr.type)
      } else if (robErr.isErr !== true) {
        err = new Error('robErr.isErr is false when it should be true')
      }
      done(err)
    })

    it('should have type === emerg and isErr === true', function (done) {
      var err = null
      var robErr = zzb.rob.createError({type: 'emerg', message: sPig})
      if (robErr.type !== 'emerg') {
        err = new Error('robErr.type is not emerg but ' + robErr.type)
      } else if (robErr.isErr !== true) {
        err = new Error('robErr.isErr is false when it should be true')
      }
      done(err)
    })

    it('should have type === info and isErr === false', function (done) {
      var err = null
      var robErr = zzb.rob.createError({type: 'info', message: sPig})
      if (robErr.type !== 'info') {
        err = new Error('robErr.type is not info but ' + robErr.type)
      } else if (robErr.isErr !== false) {
        err = new Error('robErr.isErr is true when it should be false')
      }
      done(err)
    })

    it('should have correct message', function (done) {
      var err = null
      var robErr = zzb.rob.createError({message: sPig})
      if (robErr.message !== sPig) {
        err = new Error('robErr.message does not have the expected message')
      }
      done(err)
    })

    it('should have default stack trace of empty', function (done) {
      var err = null
      var robErr = zzb.rob.createError({message: sPig})
      if (zzb.types.isNonEmptyString(robErr.stack)) {
        err = new Error('robErr.stack exists when it should not')
      }
      done(err)
    })

    it('should have stack trace', function (done) {
      var err = null
      var robErr = zzb.rob.createError({message: sPig, stack: (new Error()).stack})
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
      var robErr = zzb.rob.createError(sPig, {type: 'crit'})
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
        var robErr = zzb.rob.createError([{message: sPig}])
        if (robErr) {
          err = new Error('robErr should not have been created')
        }
      } catch (ex) {
        // good :)
      }
      done(err)
    })
  })
})
