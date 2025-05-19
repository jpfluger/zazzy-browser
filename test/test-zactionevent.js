/* global describe, it */
const { JSDOM } = require('jsdom')
const zzbLoader = require('./zzb-tester.js').zzbLoader
const assert = require('assert')
const { expect } = require('chai')

describe('Validate ZActionEvent', function () {
  let zzb

  before(function () {
    const dom = new JSDOM('<!doctype html><html><body></body></html>')
    global.window = dom.window
    global.document = dom.window.document
    global.HTMLElement = dom.window.HTMLElement
    global.HTMLFormElement = dom.window.HTMLFormElement
    global.FormData = dom.window.FormData
    global.CustomEvent = dom.window.CustomEvent

    if (typeof window.matchMedia !== 'function') {
      window.matchMedia = function () {
        return {
          matches: false,
          media: '',
          addListener: () => {},
          removeListener: () => {}
        }
      }
    }

    zzb = zzbLoader()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  function createZActionTestButton(attrs = {}, onClick) {
    const btn = document.createElement('button');
    btn.classList.add('zaction');

    Object.entries(attrs).forEach(([key, value]) => {
      btn.setAttribute(key, value);
    });

    document.body.appendChild(btn);

    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();       // 🛑 prevent bubbling
      ev.preventDefault();        // 🛑 stop any default action
      try {
        onClick(ev);
      } catch (err) {
        setTimeout(() => { throw err }, 0);
      }
    });

    btn.click();

    return btn;
  }

  it('should construct a valid ZActionEvent from an event with zcall and zaction.event', function () {
    const btn = document.createElement('button')
    btn.setAttribute('zcall', 'click')
    btn.setAttribute('za-event', 'testEvent')
    btn.classList.add('zaction')

    const event = new window.Event('click', { bubbles: true })
    Object.defineProperty(event, 'target', { writable: false, value: btn })

    const zaction = zzb.zaction.newZAction(event)

    assert.strictEqual(zaction.isValid(), true)
    assert.strictEqual(zaction.zcall, 'click')
    assert.strictEqual(zaction.getZEvent(), 'testEvent')
  })

  it('should return isValid false when no za-event is provided', function () {
    const div = document.createElement('div')
    const event = new window.Event('click')
    Object.defineProperty(event, 'target', { writable: false, value: div })

    const zaction = zzb.zaction.newZAction(event)
    assert.strictEqual(zaction.isValid(), false)
  })

  it('should apply placeholders in zurl from zaction object', function () {
    const a = document.createElement('a')
    a.setAttribute('zcall', 'click')
    a.setAttribute('za-event', 'submit')
    a.setAttribute('href', '/path/:zid/info')
    a.setAttribute('za-zid', 'abc123')
    a.classList.add('zaction')

    const event = new window.Event('click', { bubbles: true })
    Object.defineProperty(event, 'target', { writable: false, value: a })

    const zaction = zzb.zaction.newZAction(event)
    const opts = zaction.getOptions()

    assert.ok(opts.zurl.includes('abc123'))
    assert.ok(!opts.zurl.includes(':zid'))
  })

  it('should return isValid true when za-event is present', function () {
    createZActionTestButton({ 'za-event': 'click' }, ev => {
      const zaction = zzb.zaction.newZAction(ev)
      expect(zaction.isValid()).to.equal(true)
      expect(zaction).to.be.an.instanceof(zzb.zaction.ZActionEvent)
    })
  })

  it('should replace placeholders in zurl using zaction data', function (done) {
    createZActionTestButton(
      {
        'za-event': 'click',
        'za-zid': '123',
        'zurl': '/api/items/:zid',
      },
      (ev) => {
        try {
          const zaction = zzb.zaction.newZAction(ev);
          expect(zaction.isValid()).to.equal(true);
          const opts = zaction.getOptions();
          expect(opts.zurl).to.equal('/api/items/123');
          done();
        } catch (err) {
          done(err);
        }
      }
    );
  });

  it('should throw error when required placeholder in zurl is missing', function () {
    createZActionTestButton(
      {
        'za-event': 'click',
        //'za-zid': '123',
        'zurl': '/api/items/:zid'
      },
      ev => {
        expect(() => {
          const zaction = zzb.zaction.newZAction(ev); // 🔥 error thrown here
          zaction.getOptions();
        }).to.throw("Missing required placeholder ':zid' in zurl");      }
    )
  })

  it('should parse pageLimit and pageOn as integers', function () {
    createZActionTestButton(
      {
        'za-event': 'click',
        'za-page-limit': '50',
        'za-page-on': '3'
      },
      ev => {
        const zaction = zzb.zaction.newZAction(ev)
        const opts = zaction.getOptions()
        expect(opts.zaction.pageLimit).to.equal(50)
        expect(opts.zaction.pageOn).to.equal(3)
      }
    )
  })

  it('should assign the correct AJAX method based on za-method', function () {
    createZActionTestButton(
      {
        'za-event': 'click',
        'za-method': 'getJSON'
      },
      ev => {
        const zaction = zzb.zaction.newZAction(ev)
        expect(zaction.isValid()).to.equal(true)
        expect(zaction._runAJAX).to.equal(zzb.ajax.getJSON)
      }
    )
  })
})
