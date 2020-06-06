/* global describe, it, zzs */
var zzbLoader = require('../src/zzb-server.js').zzbLoader
var expect = require('chai').expect

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
      var values = { subject: 'pig', directObject: 'mushrooms' }
      var newString = zzb.strings.format(template, values)
      if (newString !== sPig) {
        err = new Error('newString not equal to the control string')
      }
      done(err)
    })
  })

  describe('Is loaded: perms', function () {
    // attr = [canRead, canCreate, canUpdate, canDelete, canExecute]
    var permObj1 = {
      module1: 'C',
      module2: 'CRUDX',
      module3: ''
    }
    var permArr1 = ['module1:C', 'module2:CRUDX', 'module3']

    it('should create one perm object', function (done) {
      var pos = zzb.perms.getPermObject('test:CRUDX')
      expect(pos).to.not.equal(null)
      expect(pos.key).to.equal('test')
      expect(pos.perm).to.equal('CRUDX')
      expect(pos.toPermkey()).to.equal('test:CRUDX')
      done()
    })
    it('should create one perm object minus available', function (done) {
      var pos = zzb.perms.getPermObject('test:CRUDX', 'C')
      expect(pos).to.not.equal(null)
      expect(pos.key).to.equal('test')
      expect(pos.perm).to.equal('C')
      expect(pos.toPermkey()).to.equal('test:C')
      done()
    })
    it('should create one perm object (test:CRUD) merged with existing minus available', function (done) {
      var pos = zzb.perms.getPermObject('test:CR', null, 'test:UD')
      expect(pos).to.not.equal(null)
      expect(pos.key).to.equal('test')
      expect(pos.perm).to.equal('CRUD')
      expect(pos.toPermkey()).to.equal('test:CRUD')
      done()
    })
    it('should create one perm object (test:CUD) merged with existing minus available', function (done) {
      var pos = zzb.perms.getPermObject('test:C', 'CRUDX', 'test:UD')
      expect(pos).to.not.equal(null)
      expect(pos.key).to.equal('test')
      expect(pos.perm).to.equal('CUD')
      expect(pos.toPermkey()).to.equal('test:CUD')
      done()
    })
    it('should create one perm object (test:CUD) merged with existing minus available and duplicate perm (UUDD)', function (done) {
      var pos = zzb.perms.getPermObject('test:C', 'CRUDX', 'test:UUDD')
      expect(pos).to.not.equal(null)
      expect(pos.key).to.equal('test')
      expect(pos.perm).to.equal('CUD')
      expect(pos.toPermkey()).to.equal('test:CUD')
      done()
    })
    it('should create one perm object (test:C) merged with existing minus available', function (done) {
      var pos = zzb.perms.getPermObject('test:CRUDX', 'C', 'test:UD')
      expect(pos).to.not.equal(null)
      expect(pos.key).to.equal('test')
      expect(pos.perm).to.equal('C')
      expect(pos.toPermkey()).to.equal('test:C')
      done()
    })
    it('should match (test:C) using pos', function (done) {
      var pos = zzb.perms.getPermObject('test:C', 'CRUDX', 'test:UD')
      expect(zzb.perms.hasMatch('test:C', pos)).to.equal(true)
      done()
    })
    it('should match (test:C) using string', function (done) {
      expect(zzb.perms.hasMatch('test:C', 'test:CUD')).to.equal(true)
      done()
    })
    it('should match (test:C) using object of pos', function (done) {
      expect(zzb.perms.hasMatch('module1:C', zzb.perms.getPermObjectFromPermkeys(permObj1))).to.equal(true)
      done()
    })
    it('should match (test:C) using object of strings', function (done) {
      expect(zzb.perms.hasMatch('module1:C', permObj1)).to.equal(true)
      done()
    })
    it('should match (test:C) using array of pos', function (done) {
      expect(zzb.perms.hasMatch('module1:C', zzb.perms.getPermObjectFromPermkeys(permArr1))).to.equal(true)
      done()
    })
    it('should match (test:C) using array of string', function (done) {
      expect(zzb.perms.hasMatch('module1:C', permArr1)).to.equal(true)
      done()
    })
    it('should not match (test:X)', function (done) {
      var pos = zzb.perms.getPermObject('test:C', 'CRUDX', 'test:UD')
      expect(zzb.perms.hasMatch('test:X', pos)).to.equal(false)
      done()
    })
    it('should not match (test:C) using string', function (done) {
      expect(zzb.perms.hasMatch('test:C', 'test:X')).to.equal(false)
      done()
    })
    it('should not match (test:X) using object of pos', function (done) {
      expect(zzb.perms.hasMatch('module1:X', zzb.perms.getPermObjectFromPermkeys(permObj1))).to.equal(false)
      done()
    })
    it('should not match (test:X) using object of strings', function (done) {
      expect(zzb.perms.hasMatch('module1:X', permObj1)).to.equal(false)
      done()
    })
    it('should not match (test:X) using array of pos', function (done) {
      expect(zzb.perms.hasMatch('module1:X', zzb.perms.getPermObjectFromPermkeys(permArr1))).to.equal(false)
      done()
    })
    it('should not match (test:X) using array of string', function (done) {
      expect(zzb.perms.hasMatch('module1:X', permArr1)).to.equal(false)
      done()
    })
    it('should create three permkeys from object', function (done) {
      var pos = zzb.perms.getPermObjectFromPermkeys(permObj1)
      expect(pos).to.not.equal(null)
      expect(Object.keys(pos).length).to.equal(3)
      // module1
      expect(pos.module1.attr.canRead).to.equal(true)
      expect(pos.module1.attr.canCreate).to.equal(false)
      expect(pos.module1.attr.canUpdate).to.equal(false)
      expect(pos.module1.attr.canDelete).to.equal(false)
      expect(pos.module1.attr.canExecute).to.equal(false)
      // module2
      expect(pos.module2.attr.canRead).to.equal(true)
      expect(pos.module2.attr.canCreate).to.equal(true)
      expect(pos.module2.attr.canUpdate).to.equal(true)
      expect(pos.module2.attr.canDelete).to.equal(true)
      expect(pos.module2.attr.canExecute).to.equal(true)
      // module3
      expect(pos.module3.attr.canRead).to.equal(false)
      expect(pos.module3.attr.canCreate).to.equal(false)
      expect(pos.module3.attr.canUpdate).to.equal(false)
      expect(pos.module3.attr.canDelete).to.equal(false)
      expect(pos.module3.attr.canExecute).to.equal(false)
      done()
    })
    it('should create three permkeys from array', function (done) {
      var pos = zzb.perms.getPermObjectFromPermkeys(permArr1)
      expect(pos).to.not.equal(null)
      expect(Object.keys(pos).length).to.equal(3)
      // module1
      expect(pos.module1.attr.canRead).to.equal(true)
      expect(pos.module1.attr.canCreate).to.equal(false)
      expect(pos.module1.attr.canUpdate).to.equal(false)
      expect(pos.module1.attr.canDelete).to.equal(false)
      expect(pos.module1.attr.canExecute).to.equal(false)
      // module2
      expect(pos.module2.attr.canRead).to.equal(true)
      expect(pos.module2.attr.canCreate).to.equal(true)
      expect(pos.module2.attr.canUpdate).to.equal(true)
      expect(pos.module2.attr.canDelete).to.equal(true)
      expect(pos.module2.attr.canExecute).to.equal(true)
      // module3
      expect(pos.module3.attr.canRead).to.equal(false)
      expect(pos.module3.attr.canCreate).to.equal(false)
      expect(pos.module3.attr.canUpdate).to.equal(false)
      expect(pos.module3.attr.canDelete).to.equal(false)
      expect(pos.module3.attr.canExecute).to.equal(false)
      done()
    })
    it('should return attr without error', function (done) {
      var pos = zzb.perms.getPermObjectFromPermkeys(permArr1)
      expect(pos).to.not.equal(null)
      expect(Object.keys(pos).length).to.equal(3)
      // unknown
      expect(zzb.perms.getPO(pos, 'unknown').attr.canRead).to.equal(false)
      expect(zzb.perms.getPO(pos, 'unknown').attr.canCreate).to.equal(false)
      expect(zzb.perms.getPO(pos, 'unknown').attr.canUpdate).to.equal(false)
      expect(zzb.perms.getPO(pos, 'unknown').attr.canDelete).to.equal(false)
      expect(zzb.perms.getPO(pos, 'unknown').attr.canExecute).to.equal(false)
      // module1
      expect(zzb.perms.getPO(pos, 'module1').attr.canRead).to.equal(true)
      expect(zzb.perms.getPO(pos, 'module1').attr.canCreate).to.equal(false)
      expect(zzb.perms.getPO(pos, 'module1').attr.canUpdate).to.equal(false)
      expect(zzb.perms.getPO(pos, 'module1').attr.canDelete).to.equal(false)
      expect(zzb.perms.getPO(pos, 'module1').attr.canExecute).to.equal(false)
      // module2
      expect(zzb.perms.getPO(pos, 'module2').attr.canRead).to.equal(true)
      expect(zzb.perms.getPO(pos, 'module2').attr.canCreate).to.equal(true)
      expect(zzb.perms.getPO(pos, 'module2').attr.canUpdate).to.equal(true)
      expect(zzb.perms.getPO(pos, 'module2').attr.canDelete).to.equal(true)
      expect(zzb.perms.getPO(pos, 'module2').attr.canExecute).to.equal(true)
      // module3
      expect(zzb.perms.getPO(pos, 'module3').attr.canRead).to.equal(false)
      expect(zzb.perms.getPO(pos, 'module3').attr.canCreate).to.equal(false)
      expect(zzb.perms.getPO(pos, 'module3').attr.canUpdate).to.equal(false)
      expect(zzb.perms.getPO(pos, 'module3').attr.canDelete).to.equal(false)
      expect(zzb.perms.getPO(pos, 'module3').attr.canExecute).to.equal(false)
      done()
    })
  })

  describe('Is loaded: rob', function () {
    it('should createError', function (done) {
      var err = null
      var robErr = zzb.rob.createError({ message: sPig })
      if (robErr.message !== sPig) {
        err = new Error('unexpected robErr.message')
      }
      done(err)
    })
  })
})

describe('Validate zzb-server defaults using zzs object (non-default)', function () {
  var sPig = 'The pig smelled the mushrooms.'

  global.zzs = new function () {
    this.getPig = function () {
      return sPig
    }
  }()

  zzbLoader({ name: 'zzs', overwriteCached: true })

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
      var values = { subject: 'pig', directObject: 'mushrooms' }
      var newString = zzs.strings.format(template, values)
      if (newString !== sPig) {
        err = new Error('newString not equal to the control string')
      }
      done(err)
    })
  })

  describe('Is loaded: rob', function () {
    it('should createError', function (done) {
      var err = null
      var robErr = zzs.rob.createError({ message: sPig })
      if (robErr.message !== sPig) {
        err = new Error('unexpected robErr.message')
      }
      done(err)
    })
  })
})
