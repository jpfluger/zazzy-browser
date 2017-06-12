var util = require('util')
var _ = require('lodash')
var zzbLoader = require('../src/zzb-server.js').zzbLoader

describe('Validate zzb-server defaults', function () {
  // using defaults
  var zzb = zzbLoader()
  var sPig = 'The pig smelled the mushrooms.'

  describe('Is loaded: zzNode', function () {
    it('Can create new', function (done) {
      var err = null
      if (!zzb.zzNode) {
        err = new Error('zzNode is not defined')
      }
      done(err)
    })
  })

  describe('Is loaded: types', function () {
    it('should recognize non-empty strings', function (done) {
      var err = null
      if (!zzb.types.isNonEmptyString(sPig)) {
        err = new Error('failed zzb.types.isNonEmptyString')

      }
      done(err)
    })
  })

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

  describe('Is loaded: strings', function () {
    it('should format string correctly using parameter of strings', function (done) {
      var err = null
      var template = 'The {0} smelled the {1}.'
      var newString = zzb.strings.format(template, 'pig', 'mushrooms')
      if (newString !== sPig) {
        err = new Error('newString not equal to the control string')
      }
      done(err)
    })
    it('should format string correctly using array of strings', function (done) {
      var err = null
      var template = 'The {0} smelled the {1}.'
      var values = ['pig', 'mushrooms']
      var newString = zzb.strings.format(template, values)
      if (newString !== sPig) {
        err = new Error('newString not equal to the control string')
      }
      done(err)
    })
    it('should format string correctly using an object of strings', function (done) {
      var err = null
      var template = 'The {subject} smelled the {directObject}.'
      var values = {subject: 'pig', directObject: 'mushrooms'}
      var newString = zzb.strings.format(template, values)
      if (newString !== sPig) {
        err = new Error('newString not equal to the control string')
      }
      done(err)
    })
  })
})

describe('Validate zzb-server defaults using zzs object (non-default)', function () {

  var sPig = 'The pig smelled the mushrooms.'

  global.zzs = new function() {
    this.getPig = function () {
      return sPig
    }
  }

  zzbLoader({name: 'zzs', overwriteCached: true})

  describe('Prior zzs function', function () {
    it('getPig is defined', function (done) {
      var err = null
      if (zzs.getPig() !== sPig) {
        err = new Error('getPig function not defined')
      }
      done(err)
    })
  })

  describe('Is loaded: zzNode', function () {
    it('Can create new', function (done) {
      var err = null
      if (!zzs.zzNode) {
        err = new Error('zzNode is not defined')
      }
      done(err)
    })
  })

  describe('Is loaded: types', function () {
    it('should recognize non-empty strings', function (done) {
      var err = null
      if (!zzs.types.isNonEmptyString(sPig)) {
        err = new Error('failed zzb.types.isNonEmptyString')

      }
      done(err)
    })
  })

  describe('Is loaded: uuid', function () {
    it('should create uuid v4', function (done) {
      var err = null
      var uuid = zzb.uuid.newV4()
      if (!zzs.uuid.isV4(uuid)) {
        err = new Error('expected uuid4 but got something else')
      }
      done(err)
    })
  })

  describe('Is loaded: strings', function () {
    it('should format string correctly using parameter of strings', function (done) {
      var err = null
      var template = 'The {0} smelled the {1}.'
      var newString = zzs.strings.format(template, 'pig', 'mushrooms')
      if (newString !== sPig) {
        err = new Error('newString not equal to the control string')
      }
      done(err)
    })
    it('should format string correctly using array of strings', function (done) {
      var err = null
      var template = 'The {0} smelled the {1}.'
      var values = ['pig', 'mushrooms']
      var newString = zzs.strings.format(template, values)
      if (newString !== sPig) {
        err = new Error('newString not equal to the control string')
      }
      done(err)
    })
    it('should format string correctly using an object of strings', function (done) {
      var err = null
      var template = 'The {subject} smelled the {directObject}.'
      var values = {subject: 'pig', directObject: 'mushrooms'}
      var newString = zzs.strings.format(template, values)
      if (newString !== sPig) {
        err = new Error('newString not equal to the control string')
      }
      done(err)
    })
  })
})
