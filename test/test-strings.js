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
    it('should equal 1 K - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(1024)
      if (compare !== '1 K') {
        err = new Error('size human readable is "' + compare + '" but should be "1 K"')
      }
      done(err)
    })
    it('should equal 1K - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(1024, 'single', true)
      if (compare !== '1K') {
        err = new Error('size human readable is "' + compare + '" but should be "1K"')
      }
      done(err)
    })
    it('should equal 0 B - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(0)
      if (compare !== '0 B') {
        err = new Error('size human readable is "' + compare + '" but should be "0 B"')
      }
      done(err)
    })
    it('should equal 0B - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(0, 'single', true)
      if (compare !== '0B') {
        err = new Error('size human readable is "' + compare + '" but should be "0B"')
      }
      done(err)
    })
    it('should equal 0 Bytes - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(0, 'full')
      if (compare !== '0 Bytes') {
        err = new Error('size human readable is "' + compare + '" but should be "0 Bytes"')
      }
      done(err)
    })
    it('should equal 0Bytes - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(0, 'full', true)
      if (compare !== '0Bytes') {
        err = new Error('size human readable is "' + compare + '" but should be "0Bytes"')
      }
      done(err)
    })
    it('should equal 512 B - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(512)
      if (compare !== '512 B') {
        err = new Error('size human readable is "' + compare + '" but should be "512 B"')
      }
      done(err)
    })
    it('should equal 512B - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(512, 'single', true)
      if (compare !== '512B') {
        err = new Error('size human readable is "' + compare + '" but should be "512B"')
      }
      done(err)
    })
    it('should equal 4.7 M - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(4915200)
      if (compare !== '4.7 M') {
        err = new Error('size human readable is "' + compare + '" but should be "4.7 M"')
      }
      done(err)
    })
    it('should equal 4.7M - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(4915200, 'single', true)
      if (compare !== '4.7M') {
        err = new Error('size human readable is "' + compare + '" but should be "4.7M"')
      }
      done(err)
    })
    it('should equal 10.5 G - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000)
      if (compare !== '10.5 G') {
        err = new Error('size human readable is "' + compare + '" but should be "10.5 G"')
      }
      done(err)
    })
    it('should equal 10.5G - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000, 'single', true)
      if (compare !== '10.5G') {
        err = new Error('size human readable is "' + compare + '" but should be "10.5G"')
      }
      done(err)
    })
    it('should equal 91.5 T - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900)
      if (compare !== '91.5 T') {
        err = new Error('size human readable is "' + compare + '" but should be "91.5 T"')
      }
      done(err)
    })
    it('should equal 91.5T - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900, 'single', true)
      if (compare !== '91.5T') {
        err = new Error('size human readable is "' + compare + '" but should be "91.5T"')
      }
      done(err)
    })
    it('should equal 885.7 P - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911)
      if (compare !== '885.7 P') {
        err = new Error('size human readable is "' + compare + '" but should be "885.7 P"')
      }
      done(err)
    })
    it('should equal 885.7P - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911, 'single', true)
      if (compare !== '885.7P') {
        err = new Error('size human readable is "' + compare + '" but should be "885.7P"')
      }
      done(err)
    })
    it('should equal 2.6 E - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3)
      if (compare !== '2.6 E') {
        err = new Error('size human readable is "' + compare + '" but should be "2.6 E"')
      }
      done(err)
    })
    it('should equal 2.6E - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3, 'single', true)
      if (compare !== '2.6E') {
        err = new Error('size human readable is "' + compare + '" but should be "2.6E"')
      }
      done(err)
    })
    it('should equal 2.6 EB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3, 'double')
      if (compare !== '2.6 EB') {
        err = new Error('size human readable is "' + compare + '" but should be "2.6 EB"')
      }
      done(err)
    })
    it('should equal 2.6EB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3, 'double', true)
      if (compare !== '2.6EB') {
        err = new Error('size human readable is "' + compare + '" but should be "2.6EB"')
      }
      done(err)
    })
    it('should equal 2.6 EiB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3, 'eic')
      if (compare !== '2.6 EiB') {
        err = new Error('size human readable is "' + compare + '" but should be "2.6 EiB"')
      }
      done(err)
    })
    it('should equal 2.6EiB - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3, 'eic', true)
      if (compare !== '2.6EiB') {
        err = new Error('size human readable is "' + compare + '" but should be "2.6EiB"')
      }
      done(err)
    })
    it('should equal 2.6 Exabyte - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3, 'full')
      if (compare !== '2.6 Exabyte') {
        err = new Error('size human readable is "' + compare + '" but should be "2.6 Exabyte"')
      }
      done(err)
    })
    it('should equal 2.6Exabyte - base 1024', function (done) {
      var err = null
      var compare = zzb.strings.sizeToHumanReadable(11304960000 * 8900 * 9911 * 3, 'full', true)
      if (compare !== '2.6Exabyte') {
        err = new Error('size human readable is "' + compare + '" but should be "2.6Exabyte"')
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
