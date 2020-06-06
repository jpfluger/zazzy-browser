/* global describe, it */
var zzbLoader = require('../src/zzb-server.js').zzbLoader

describe('Validate zzb.string methods', function () {
  var zzb = zzbLoader()

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

  var sPig2 = 'Piggy, you have 2 mushrooms'
  var sPigTemplateNumber = '{0}, you have {1} mushroom{2}'
  var sPigTemplateNamed = '{name}, you have {number} mushroom{ending}'
  var sPigTemplateNamedDeep = '{ob1.name}, you have {number} mushroom{ob2.objsub1.ending}'

  describe('zzb.strings.format', function () {
    it('should match template-number from strings', function (done) {
      var err = null
      var compare = zzb.strings.format(sPigTemplateNumber, 'Piggy', 2, 's')
      if (compare !== sPig2) {
        err = new Error('failed match from strings')
      }
      done(err)
    })
    it('should match template-number from array', function (done) {
      var err = null
      var compare = zzb.strings.format(sPigTemplateNumber, ['Piggy', 2, 's'])
      if (compare !== sPig2) {
        err = new Error('failed match from strings')
      }
      done(err)
    })
    it('should match template-named from object', function (done) {
      var err = null
      var compare = zzb.strings.format(sPigTemplateNamed, { name: 'Piggy', number: 2, ending: 's' })
      if (compare !== sPig2) {
        err = new Error('failed match from strings')
      }
      done(err)
    })
    it('should deep-match template-named from object', function (done) {
      var err = null
      var compare = zzb.strings.format(sPigTemplateNamedDeep, { ob1: { name: 'Piggy' }, number: 2, ob2: { objsub1: { ending: 's' } } })
      if (compare !== sPig2) {
        err = new Error('failed match from strings')
      }
      done(err)
    })
  })
})
