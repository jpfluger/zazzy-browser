/* global describe, it, zzs */
var zzbLoader = require('./zzb-tester.js').zzbLoader
var expect = require('chai').expect

describe('Validate zzb-server defaults', function () {
  // using defaults
  var zzb = zzbLoader()
  var sPig = 'The pig smelled the mushrooms.'

  describe('Is loaded: uuid', function () {
    it('should create uuid v4', function (done) {
      var err = null
      var uuid = zzb.uuid.newV4()
      if (!zzb.uuid.isV4(uuid)) {
        err = new Error('expected uuid4 but got something else')
      }
      done(err)
    })
  })
})
