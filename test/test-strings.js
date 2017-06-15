var util = require('util')
var _ = require('lodash')
var zzbLoader = require('../src/zzb-server.js').zzbLoader

describe('Validate zzb.string methods', function () {
  var zzb = zzbLoader()
  var sPig = 'The pig smelled mushrooms.'

  var sPigSingle = 'The pig smelled 1 mushroom.'
  var sPigPlural = 'The pig smelled 10 mushrooms.'
  var sPigTemplate = 'The pig smelled {0} {1}.'

  describe('zzb.strings.toPlural', function () {
    it('should output "mushroom"', function (done) {
      var err = null
      if (zzb.strings.toPlural('mushroom', 1) !== 'mushroom') {
        err = new Error('failed single word')
      } else if (zzb.strings.format(sPigTemplate, [1, zzb.strings.toPlural('mushroom', 1)]) !== sPigSingle) {
        err = new Error('failed single sentence')
      }
      done(err)
    })
    it('should output "mushrooms"', function (done) {
      var err = null
      if (zzb.strings.toPlural('mushroom', 10) !== 'mushrooms') {
        err = new Error('failed plural word')
      } else if (zzb.strings.format(sPigTemplate, 10, zzb.strings.toPlural('mushroom', 10)) !== sPigPlural) {
        err = new Error('failed plural sentence')
      }
      done(err)
    })
  })
})
