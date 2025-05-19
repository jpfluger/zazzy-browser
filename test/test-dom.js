/* global describe, it */
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')
const { expect } = require('chai')

const zzbLoader = require('./zzb-tester.js').zzbLoader

describe('Validate zzb.dom methods', function () {
  const zzb = zzbLoader()

  describe('zzb.dom.setPath', function () {
    it('should set a nested object value', function () {
      const obj = {}
      zzb.dom.setPath(obj, 'user.name', 'Alice')
      expect(obj.user.name).to.equal('Alice')
    })

    it('should set a nested array index value', function () {
      const obj = {}
      zzb.dom.setPath(obj, 'items[0].title', 'Item 1')
      expect(obj.items[0].title).to.equal('Item 1')
    })

    it('should create structure for array with implicit index', function () {
      const obj = {}
      zzb.dom.setPath(obj, 'values[]', 'test')
      expect(obj.values).to.equal('test')
    })
  })

  describe('zzb.dom.formDataToJson (manual form)', function () {
    it('should parse form with zf-type hints and convert to nested JSON', function () {
      const form = document.createElement('form')

      const input1 = document.createElement('input')
      input1.name = 'user.name'
      input1.value = 'Charlie'
      input1.setAttribute('zf-type', 'string')
      form.appendChild(input1)

      const input2 = document.createElement('input')
      input2.name = 'user.age'
      input2.value = '30'
      input2.setAttribute('zf-type', 'int')
      form.appendChild(input2)

      const input3 = document.createElement('input')
      input3.name = 'user.subscribed'
      input3.value = 'yes'
      input3.setAttribute('zf-type', 'bool')
      form.appendChild(input3)

      const result = zzb.dom.formDataToJson(form)

      expect(result).to.deep.equal({
        user: {
          name: 'Charlie',
          age: 30,
          subscribed: true
        }
      })
    })

    it('should return null when value is empty and zf-type includes null', function () {
      const form = document.createElement('form')

      const input = document.createElement('input')
      input.name = 'meta.optional'
      input.value = ''
      input.setAttribute('zf-type', 'string|null')
      form.appendChild(input)

      const result = zzb.dom.formDataToJson(form)
      expect(result.meta.optional).to.equal(null)
    })
  })

  describe('zzb.dom.formDataToJson from dom-formdata.html', function () {
    let formElem

    before(function (done) {
      const htmlPath = path.join(__dirname, 'dom-formdata.html')
      const html = fs.readFileSync(htmlPath, 'utf8')
      const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' })

      dom.window.addEventListener('load', () => {
        formElem = dom.window.document.getElementById('exampleForm')
        done()
      })

      // Fallback in case 'load' doesn't fire
      setTimeout(() => {
        if (!formElem) {
          formElem = dom.window.document.getElementById('exampleForm')
          done()
        }
      }, 300)
    })

    it('should match expected parsed output from HTML fixture', function () {
      const parsed = zzb.dom.formDataToJson(formElem)

      const expected = {
        ColA: 'Hello',
        ColB: 42,
        ColC: 3.14,
        ColD: true,
        ColE: ['one', 'two'],
        ColF: ['a', 'b'],
        ColG: {
          Nest1: 'nested',
          Nest2: 99,
          Nest3: {
            Nest3b: ['x', 'y'],
            Nest3c: [null, 200],
            Nest3d: [
              {
                Nest4a: {
                  Nest5a: 'deep',
                  Nest5b: 9.81
                }
              }
            ]
          }
        },
        ColH1: null,
        ColH2: null,
        ColH3: 'something',
        ColH4: '',
        ColI: 'forced',
        ColJ1: null,
        ColJ2: 42,
        ColJ3: 0,
        ColJ4: null,
        ColJ5: 3.14,
        ColJ6: 0,
        ColJ7: null,
        ColJ8: true,
        ColJ9: false,
        ColJ10: true
      }

      expect(parsed).to.deep.equal(expected)
    })
  })

  describe('Validate zzb.dom attribute-related methods', function () {
    describe('zzb.dom.hasUIHover', function () {
      it('should return a boolean', function () {
        const result = zzb.dom.hasUIHover()
        expect(result).to.be.a('boolean')
      })
    })

    describe('zzb.dom.hasElement', function () {
      it('should return true for a valid element', function () {
        const div = document.createElement('div')
        expect(Boolean(zzb.dom.hasElement(div))).to.equal(true)
        expect(zzb.dom.hasElement(div)).to.be.true
      })

      it('should return false for null', function () {
        expect(Boolean(zzb.dom.hasElement(null))).to.equal(false)
        expect(zzb.dom.hasElement(null)).to.be.false
      })
    })

    describe('zzb.dom.setAttribute', function () {
      it('should set attribute on a single element', function () {
        const el = document.createElement('div')
        zzb.dom.setAttribute(el, 'data-test', '123')
        expect(el.getAttribute('data-test')).to.equal('123')
      })

      it('should set attribute on a NodeList', function () {
        const el1 = document.createElement('div')
        const el2 = document.createElement('div')
        zzb.dom.setAttribute([el1, el2], 'data-test', 'xyz')
        expect(el1.getAttribute('data-test')).to.equal('xyz')
        expect(el2.getAttribute('data-test')).to.equal('xyz')
      })
    })

    describe('zzb.dom.getAttributeElse', function () {
      it('should return attribute value if exists', function () {
        const el = document.createElement('div')
        el.setAttribute('data-key', 'value')
        const val = zzb.dom.getAttributeElse(el, 'data-key', 'fallback')
        expect(val).to.equal('value')
      })

      it('should return fallback if attribute is missing', function () {
        const el = document.createElement('div')
        const val = zzb.dom.getAttributeElse(el, 'non-exist', 'fallback')
        expect(val).to.equal('fallback')
      })

      it('should return fallback if element is null', function () {
        const val = zzb.dom.getAttributeElse(null, 'data-key', 'fallback')
        expect(val).to.equal('fallback')
      })
    })

    describe('zzb.dom.getAttributes', function () {
      it('should return matching attributes', function () {
        const el = document.createElement('div')
        el.setAttribute('data-foo', 'bar')
        el.setAttribute('data-baz', 'qux')
        const attrs = zzb.dom.getAttributes(el, /^data-/)
        expect(attrs).to.deep.equal({
          'data-foo': 'bar',
          'data-baz': 'qux'
        })
      })

      it('should return camelCase keys when enabled', function () {
        const el = document.createElement('div')
        el.setAttribute('data-user-name', 'Alice')
        el.setAttribute('data-account-id', '123')
        const attrs = zzb.dom.getAttributes(el, /^data-/, 5)
        expect(attrs).to.deep.equal({
          userName: 'Alice',
          accountId: '123'
        })
      })
    })
  })

  describe('Validate zzb.dom.findSelectorTargets', function () {
    const zzb = zzbLoader()

    let container, baseElem

    beforeEach(() => {
      container = document.createElement('div')
      container.innerHTML = `
      <div id="wrapper">
        <div class="inner" id="target1"></div>
        <div class="inner" id="target2"></div>
        <div class="inner" id="child"><span class="child-text">Child</span></div>
      </div>
    `
      document.body.appendChild(container)
      baseElem = container.querySelector('#child')
    })

    afterEach(() => {
      container.remove()
    })

    it('should return self reference', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, 'self')
      expect(result).to.be.an('array')
      expect(result[0].label).to.equal('self')
      expect(result[0].$elem).to.equal(baseElem)
    })

    it('should return "none" string', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, 'none')
      expect(result).to.equal('none')
    })

    it('should resolve selector by document.querySelector', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, 'selector:#target1')
      expect(result[0].$elem.id).to.equal('target1')
    })

    it('should resolve closest element', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, 'closest:#wrapper')
      expect(result[0].$elem.id).to.equal('wrapper')
    })

    it('should resolve child element', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, 'child:.child-text')
      expect(result[0].$elem.classList.contains('child-text')).to.be.true
    })

    it('should apply label and placement', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, 'alert.closest@outer:#wrapper')
      expect(result[0].label).to.equal('alert')
      expect(result[0].placement).to.equal('outer')
      expect(result[0].$elem.id).to.equal('wrapper')
    })

    it('should fallback to "inner" on unknown placement', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, 'x.closest@bogus:#wrapper')
      expect(result[0].placement).to.equal('inner')
    })

    it('should return null for invalid string', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, '')
      expect(result).to.equal(null)
    })

    it('should skip unresolvable selectors', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, 'selector:#does-not-exist')
      expect(result.length).to.equal(0)
    })

    it('should resolve multiple entries', () => {
      const result = zzb.dom.findSelectorTargets(baseElem, 'self, selector:#target2')
      expect(result.length).to.equal(2)
      expect(result[0].label).to.equal('self')
      expect(result[1].$elem.id).to.equal('target2')
    })
  })

  describe('Validate zzb.dom.findZUrl', function () {
    const zzb = zzbLoader()

    it('should return value from zurl attribute', function () {
      const el = document.createElement('a')
      el.setAttribute('zurl', '/my-zurl')
      const result = zzb.dom.findZUrl(el)
      expect(result).to.equal('/my-zurl')
    })

    it('should fallback to href when zurl is missing', function () {
      const el = document.createElement('a')
      el.setAttribute('href', '/my-link')
      const result = zzb.dom.findZUrl(el)
      expect(result).to.equal('/my-link')
    })

    it('should fallback to action when zurl and href are missing', function () {
      const el = document.createElement('form')
      el.setAttribute('action', '/submit-here')
      const result = zzb.dom.findZUrl(el)
      expect(result).to.equal('/submit-here')
    })

    it('should fallback to src when element is not an image', function () {
      const el = document.createElement('script')
      el.setAttribute('src', '/scripts.js')
      const result = zzb.dom.findZUrl(el)
      expect(result).to.equal('/scripts.js')
    })

    it('should NOT use src for <img>', function () {
      const el = document.createElement('img')
      el.setAttribute('src', '/image.png')
      const result = zzb.dom.findZUrl(el)
      expect(result).to.equal('')
    })

    it('should return empty string if no valid attribute found', function () {
      const el = document.createElement('div')
      const result = zzb.dom.findZUrl(el)
      expect(result).to.equal('')
    })

    it('should return null if no valid attribute found and returnNull = true', function () {
      const el = document.createElement('div')
      const result = zzb.dom.findZUrl(el, true)
      expect(result).to.equal(null)
    })

    it('should return empty string if zurl is "#"', function () {
      const el = document.createElement('a')
      el.setAttribute('zurl', '#')
      const result = zzb.dom.findZUrl(el)
      expect(result).to.equal('')
    })

    it('should return null if zurl is "#" and returnNull = true', function () {
      const el = document.createElement('a')
      el.setAttribute('zurl', '#')
      const result = zzb.dom.findZUrl(el, true)
      expect(result).to.equal(null)
    })
  })
  describe('Validate zzb.dom.cache (in-memory and persistent)', function () {
    const zzb = zzbLoader()
    const memMode = { mode: 'mem' }
    const persistMode = { mode: 'persist', rootKey: 'testZuiCache' }

    afterEach(function () {
      zzb.dom.cache.clear({ ...memMode })
      zzb.dom.cache.clear({ ...persistMode })
    })

    describe('In-memory mode', function () {
      it('should store and retrieve a value', function () {
        zzb.dom.cache.set('myKey', 'myValue', memMode)
        const result = zzb.dom.cache.get('myKey', memMode)
        expect(result).to.equal('myValue')
      })

      it('should return null for non-existent key', function () {
        const result = zzb.dom.cache.get('missingKey', memMode)
        expect(result).to.equal(null)
      })

      it('should delete a single key', function () {
        zzb.dom.cache.set('temp', '123', memMode)
        zzb.dom.cache.clear({ key: 'temp', ...memMode })
        expect(zzb.dom.cache.get('temp', memMode)).to.equal(null)
      })

      it('should clear all memory cache', function () {
        zzb.dom.cache.set('a', 1, memMode)
        zzb.dom.cache.set('b', 2, memMode)
        zzb.dom.cache.clear(memMode)
        expect(zzb.dom.cache.get('a', memMode)).to.equal(null)
        expect(zzb.dom.cache.get('b', memMode)).to.equal(null)
      })
    })

    describe('Persistent (localStorage) mode', function () {
      it('should store and retrieve a value from localStorage', function () {
        zzb.dom.cache.set('theme', 'dark', persistMode)
        const result = zzb.dom.cache.get('theme', persistMode)
        expect(result).to.equal('dark')
      })

      it('should return null if key does not exist in localStorage', function () {
        const result = zzb.dom.cache.get('nonexistent', persistMode)
        expect(result).to.equal(null)
      })

      it('should delete a single key from localStorage', function () {
        zzb.dom.cache.set('tempKey', 'value', persistMode)
        zzb.dom.cache.clear({ key: 'tempKey', ...persistMode })
        const result = zzb.dom.cache.get('tempKey', persistMode)
        expect(result).to.equal(null)
      })

      it('should clear entire persistent cache (localStorage)', function () {
        zzb.dom.cache.set('x', 1, persistMode)
        zzb.dom.cache.set('y', 2, persistMode)
        zzb.dom.cache.clear(persistMode)
        expect(zzb.dom.cache.get('x', persistMode)).to.equal(null)
        expect(zzb.dom.cache.get('y', persistMode)).to.equal(null)
      })

      it('should not interfere with unrelated localStorage keys', function () {
        localStorage.setItem('unrelated', JSON.stringify({ foo: 'bar' }))
        zzb.dom.cache.set('demo', 42, persistMode)
        zzb.dom.cache.clear(persistMode)
        const unrelated = JSON.parse(localStorage.getItem('unrelated'))
        expect(unrelated.foo).to.equal('bar')
        localStorage.removeItem('unrelated')
      })
    })

    describe('Edge cases', function () {
      it('should return null if key is undefined', function () {
        const result = zzb.dom.cache.get(undefined, memMode)
        expect(result).to.equal(null)
      })

      it('should do nothing if setting undefined key', function () {
        zzb.dom.cache.set(undefined, 'value', memMode)
        expect(zzb.dom.cache.get(undefined, memMode)).to.equal(null)
      })

      it('should do nothing if clearing undefined mode', function () {
        zzb.dom.cache.clear({ key: 'x' }) // defaults to mem
        expect(zzb.dom.cache.get('x')).to.equal(null)
      })
    })
  })
})
