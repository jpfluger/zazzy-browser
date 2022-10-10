var zzbLoader = require('./zzb-tester.js').zzbLoader
const request = require('supertest');

describe('test ajax', function () {
  var zzb = zzbLoader()
  var zzbServer

  before(function(done) {
    zzbServer = new (require('./zzb-tester.js')).zzbServer()
    done()
  })
  after(function(done) {
    zzbServer.stop()
    done()
  })

  it('responds to / (control-group/not-zzb)', function (done) {
    request(zzbServer.getApp())
      .get('/')
      .expect(200)
      .end(function(err, res) {
        done()
      })
  })
  it('responds to /ping (GET) (control-group/not-zzb)', function (done) {
    request(zzbServer.getApp())
      .get('/pong')
      .expect(200)
      .end(function(err, res) {
        done()
      })
  })
  it('responds to /ping (POST) where RAWRETURN=true', function (done) {
    zzb.ajax.postJSON({url: 'http://localhost:16080/ping', body: {hello: 'world'}, RAWRETURN: true}, function(rawData, err) {
      if (!err) {
        if (rawData.data.recs[0] !== 'pong') {
          err = new Error('pong not returned as string in array')
        }
      }
      done(err)
    })
  })
  it('responds to /ping (POST)', function (done) {
    zzb.ajax.postJSON({url: 'http://localhost:16080/ping', body: {hello: 'world'}}, function(drr, err) {
      if (!err) {
        if (drr.rob.recs[0] !== 'pong') {
          err = new Error('pong not returned as string in array')
        }
      }
      done(err)
    })
  })
  it('responds to /ping (POST) rob.getFirst()', function (done) {
    zzb.ajax.postJSON({url: 'http://localhost:16080/ping', body: {hello: 'world'}}, function(drr, err) {
      if (!err) {
        if (drr.rob.first() !== 'pong') {
          err = new Error('pong not returned as string in array')
        }
      }
      done(err)
    })
  })
  it('responds to /ping where RAWRETURN=true', function (done) {
    zzb.ajax.getTEXT({url: 'http://localhost:16080/ping', RAWRETURN: true}, function(drr, err) {
      if (!err) {
        if (drr.data !== 'pong') {
          err = new Error('pong not returned as string')
        }
      }
      done(err)
    })
  })
  it('responds to /ping-json', function (done) {
    zzb.ajax.getTEXT({url: 'http://localhost:16080/ping-json'}, function(drr, err) {
      if (!err) {
        if (drr.rob.recs[0] !== '{"recs":["pong"]}') {
          err = new Error('pong not returned as string in array')
        }
      }
      done(err)
    })
  })
  it('responds to /ping (POST) via expectType=text', function (done) {
    zzb.ajax.postJSON({url: 'http://localhost:16080/ping', expectType: 'text'}, function(drr, err) {
      if (!err) {
        if (drr.rob.recs[0] !== '{"recs":["pong"]}') {
          err = new Error('pong not returned as string in array')
        }
      }
      done(err)
    })
  })
  it('404 everything else (control-group/not-zzb)', function (done) {
    request(zzbServer.getApp())
      .get('/foo/bar')
      .expect(404)
      .end(function(err, res) {
        done()
      })
  })
  it('responds to /ping-status-expect-404', function (done) {
    zzb.ajax.getJSON({url: 'http://localhost:16080/ping-status-expect-404', NOCATCHFLASH: true}, function(drr, err) {
      if (err) {
        err = null
      } else {
        err = new Error('err should have been handled')
      }
      done(err)
    })
  })
  it('responds to /ping-as-err', function (done) {
    zzb.ajax.getJSON({url: 'http://localhost:16080/ping-as-err', NOCATCHFLASH: true}, function(drr, err) {
      if (err) {
        err = null
      } else if (!drr.rob.hasErrors()) {
        err = new Error('should have rob err')
      } else if (drr.rob.errs[0].message !== 'pong') {
        err = new Error('should have rob err - pong')
      }
      done(err)
    })
  })
  it('responds to /ping-as-errs-string', function (done) {
    zzb.ajax.getJSON({url: 'http://localhost:16080/ping-as-errs-string', NOCATCHFLASH: true}, function(drr, err) {
      if (err) {
        err = null
      } else if (!drr.rob.hasErrors()) {
        err = new Error('should have rob errs as string')
      } else if (drr.rob.errs[0].message !== 'pong') {
        err = new Error('should have rob errs as string - pong')
      }
      done(err)
    })
  })
  it('responds to /ping-as-errs-array', function (done) {
    zzb.ajax.getJSON({url: 'http://localhost:16080/ping-as-errs-array', NOCATCHFLASH: true}, function(drr, err) {
      if (err) {
        err = new Error('err should not have been handled')
      } else if (!drr.rob.hasErrors()) {
        err = new Error('should have rob errs in array')
      } else if (drr.rob.errs[0].message !== 'pong') {
        err = new Error('should have rob errs in array - pong')
      }
      done(err)
    })
  })
  // it('responds to /force-flash-message', function (done) {
  //   zzb.ajax.getJSON({url: 'http://localhost:16080/force-flash-message', NOCATCHFLASH: true}, function(drr, err) {
  //     if (err) {
  //       err = new Error('err should not have been handled')
  //     } else if (!zzb.types.isStringNotEmpty(drr.data.message)) {
  //       err = new Error('should have data.message')
  //     }
  //     done(err)
  //   })
  // })
})