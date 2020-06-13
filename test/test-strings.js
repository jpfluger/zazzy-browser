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

  describe('zzb.strings.sizeToHumanReadable', function () {
    it('should equal 1.0 KiB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(1024)
      if (compare !== '1.0 KiB') {
        err = new Error('size human readable is "' + compare + '" but should be "1.0 KiB"')
      }
      done(err)
    })
    it('should equal 1.0 KB - base 1000', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(1024, true)
      if (compare !== '1.0 kB') {
        err = new Error('size human readable is "' + compare + '" but should be "1.0 kB"')
      }
      done(err)
    })
    it('should equal 0 B - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(0, false)
      if (compare !== '0 B') {
        err = new Error('size human readable is "' + compare + '" but should be "0 B"')
      }
      done(err)
    })
    it('should equal 0 B - base 1000', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(0, true)
      if (compare !== '0 B') {
        err = new Error('size human readable is "' + compare + '" but should be "0 B"')
      }
      done(err)
    })
    it('should equal 512 B - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(512, false)
      if (compare !== '512 B') {
        err = new Error('size human readable is "' + compare + '" but should be "512 B"')
      }
      done(err)
    })
    it('should equal 512 B - base 1000', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(512, true)
      if (compare !== '512 B') {
        err = new Error('size human readable is "' + compare + '" but should be "512 B"')
      }
      done(err)
    })
    it('should equal 4.7 MiB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(4915200, false)
      if (compare !== '4.7 MiB') {
        err = new Error('size human readable is "' + compare + '" but should be "4.7 MiB"')
      }
      done(err)
    })
    it('should equal 4.9 MB - base 1000', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(4915200, true)
      if (compare !== '4.9 MB') {
        err = new Error('size human readable is "' + compare + '" but should be "4.9 MB"')
      }
      done(err)
    })
    it('should equal 10.5 GiB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000, false)
      if (compare !== '10.5 GiB') {
        err = new Error('size human readable is "' + compare + '" but should be "10.5 GiB"')
      }
      done(err)
    })
    it('should equal 11.3 GB - base 1000', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000, true)
      if (compare !== '11.3 GB') {
        err = new Error('size human readable is "' + compare + '" but should be "11.3 GB"')
      }
      done(err)
    })
    it('should equal 91.5 TiB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900, false)
      if (compare !== '91.5 TiB') {
        err = new Error('size human readable is "' + compare + '" but should be "91.5 TiB"')
      }
      done(err)
    })
    it('should equal 100.6 TB - base 1000', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900, true)
      if (compare !== '100.6 TB') {
        err = new Error('size human readable is "' + compare + '" but should be "100.6 TB"')
      }
      done(err)
    })
    it('should equal 885.7 PiB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911, false)
      if (compare !== '885.7 PiB') {
        err = new Error('size human readable is "' + compare + '" but should be "885.7 PiB"')
      }
      done(err)
    })
    it('should equal 997.2 PB - base 1000', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911, true)
      if (compare !== '997.2 PB') {
        err = new Error('size human readable is "' + compare + '" but should be "997.2 PB"')
      }
      done(err)
    })
    it('should equal 2.6 EiB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3, false)
      if (compare !== '2.6 EiB') {
        err = new Error('size human readable is "' + compare + '" but should be "2.6 EiB"')
      }
      done(err)
    })
    it('should equal 3.0 EB - base 1000', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3, true)
      if (compare !== '3.0 EB') {
        err = new Error('size human readable is "' + compare + '" but should be "3.0 EB"')
      }
      done(err)
    })
  })

  describe('zzb.strings.millisecondsTimeToHumanReadable', function () {
    it('should equal 1h 11m 24.68s', function (done) {
      var err = null
      var compare = zzb.strings.millisecondsTimeToHumanReadable(4284675)
      if (compare !== '1h 11m 24.68s') {
        err = new Error('milliseconds human readable is "' + compare + '" but should be "1h 11m 24.68s"')
      }
      done(err)
    })
    it('should equal 18d 9h 2m 24.95s', function (done) {
      var err = null
      var compare = zzb.strings.millisecondsTimeToHumanReadable(1587744948)
      if (compare !== '18d 9h 2m 24.95s') {
        err = new Error('milliseconds human readable is "' + compare + '" but should be "18d 9h 2m 24.95s"')
      }
      done(err)
    })
  })
})
