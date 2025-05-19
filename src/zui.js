// ---------------------------------------------------
// _zui
// ---------------------------------------------------

/**
 * ZUI (Zazzy UI) utility class
 * Handles viewport detection, splitter/cache handling, and element initialization
 */
const _zui = function () {
  this.zsplitters = {}                  // Stores splitter states
  this.elemIniters = []                 // Initialization callbacks for UI elements
  this.defaultRWidth = 576              // Default responsive width fallback (e.g., for mobile detection)
  this.handlers = []                    // General event or mutation handlers
  this.breakpoints = {                  // Optional named breakpoints
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1400
  }
}

/**
 * Returns the default responsive width.
 * @returns {number}
 */
_zui.prototype.getDefaultRWidth = function () {
  return this.defaultRWidth
}

/**
 * Returns the current viewport width.
 * @returns {number} - Max of window.innerWidth and document.clientWidth
 */
function getViewportWidth () {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
}

/**
 * Checks if the viewport width is greater than a given breakpoint.
 * Accepts numeric or string alias (e.g., 'md').
 *
 * @param {number|string} rsize - Target responsive width or breakpoint alias.
 * @returns {boolean}
 */
_zui.prototype.isViewportGTRSize = function (rsize) {
  const bp = this.breakpoints

  if (typeof rsize === 'string' && bp[rsize]) {
    rsize = bp[rsize]
  }

  if (!zzb.types.isNumber(rsize) || rsize <= 0) {
    rsize = this.defaultRWidth
  }

  return getViewportWidth() > rsize
}

/**
 * Gets current viewport label (e.g., 'xs', 'sm', 'md', etc.) based on breakpoints.
 * @returns {string}
 */
_zui.prototype.getViewportLabel = function () {
  const width = getViewportWidth()
  const bp = this.breakpoints

  if (width <= bp.xs) return 'xs'
  if (width <= bp.sm) return 'sm'
  if (width <= bp.md) return 'md'
  if (width <= bp.lg) return 'lg'
  return 'xl'
}

_zui.prototype.registerZSplitterResize = function (options) {
  let handler = new zzb.zaction.ZActionHandler(options)
  for (let ii = 0; ii < this.handlers.length; ii++) {
    if (this.handlers[ii].getId() === handler.id) {
      this.handlers[ii] = handler
      return
    }
  }
  this.handlers.push(handler)
}

_zui.prototype.triggerZSplitterResize = function () {
  for (let ii = 0; ii < this.handlers.length; ii++) {
    this.handlers[ii].getHandler()()
  }
}

function setZUICacheZSplitter(zsplitter) {
  if (zsplitter && zzb.types.isStringNotEmpty(zsplitter.id)) {
    try {
      let zuiC = zzb.dom.cache.get('zuiC', { mode: 'persist' }) || { zsplitter: {} }
      zuiC.zsplitter[zsplitter.id] = zsplitter
      zzb.dom.cache.set('zuiC', zuiC, { mode: 'persist' })
    } catch (e) {
      console.log(e)
    }
  }
}

function createZSplitterToggle($resizer, $targetSide, setStaticWidth, setCacheZSplitter) {
  // Defensive: return no-op if elements are missing
  if (!$targetSide || !$resizer || typeof setStaticWidth !== 'function' || typeof setCacheZSplitter !== 'function') {
    return function () {}
  }

  return function(state) {
    let idxWidthStatic = 0

    switch (state) {
      case 'open':
        idxWidthStatic = 0
        $resizer.classList.remove('d-none')
        $targetSide.classList.remove('d-none')
        setCacheZSplitter(state)
        setStaticWidth()
        break
      case 'close':
        $targetSide.style.width = 0
        idxWidthStatic = -1
        $resizer.classList.remove('d-none')
        $targetSide.classList.remove('d-none')
        setCacheZSplitter(state)
        break
      case 'dismiss':
        idxWidthStatic = -1
        $resizer.classList.add('d-none')
        $targetSide.classList.add('d-none')
        break
    }

    zzb.zui.triggerZSplitterResize()
  }
}

function normalizeWidths(widths) {
  return widths.map(w => {
    return (!w || typeof w !== 'string') ? w : (/^\d+$/.test(w) ? `${w}px` : w)
  })
}

_zui.prototype.initZSplitter = function ($resizer, direction, arrToggableWidths) {
  const zsplitter = this.zsplitter.loadConfig($resizer)
  this.zsplitter.normalizeConfig(zsplitter)

  if (!arrToggableWidths) arrToggableWidths = []
  else if (!Array.isArray(arrToggableWidths)) arrToggableWidths = arrToggableWidths.split(',')

  const widths = this.zsplitter.normalizeWidths(arrToggableWidths)
  const $target = direction === 'left' ? $resizer.previousElementSibling : $resizer.nextElementSibling
  const $alt = direction === 'left' ? $resizer.nextElementSibling : $resizer.previousElementSibling
  const idxRef = { current: 0 }

  if (!zzb.types.isStringNotEmpty($resizer.id)) {
    $resizer.id = `zsplitter${Object.keys(this.zsplitters).length}${direction}`
  }

  const setWidth = () =>
    this.zsplitter.setStaticWidth(widths, idxRef.current, $target, $alt, $resizer)
  const setCache = (state) =>
    this.zsplitter.updateCache(zsplitter, setWidth, state)

  setWidth()
  this.zsplitter.applyInitialVisibility(zsplitter, widths, $resizer, $target, idxRef)
  this.zsplitter.attachTogglers($resizer, widths, idxRef, setWidth, setCache, $target)
  this.zsplitter.attachDragHandlers($resizer, direction, $target, $alt)

  const obj = this.getZSplitter($resizer.id)
  obj.toggle = createZSplitterToggle($resizer, $target, setWidth, setCache)
  this.setZSplitter($resizer.id, obj)
}

_zui.prototype.zsplitter = {

  loadConfig($resizer) {
    let config = zzb.dom.getAttributes($resizer, /^zsplitter-/, 10)
    config.id = $resizer.getAttribute('id')

    const usingCache = zzb.types.isStringNotEmpty(config.id)
    if (!usingCache) return config

    const zuiC = zzb.dom.cache.get('zuiC', { mode: 'persist' }) || { zsplitter: {} }
    if (!zuiC.zsplitter[config.id]) {
      zuiC.zsplitter[config.id] = config
      zzb.dom.cache.set('zuiC', zuiC, { mode: 'persist' })
    } else {
      config = zuiC.zsplitter[config.id]
    }
    return config
  },

  normalizeConfig(config) {
    if (config.show !== 'open' && config.show !== 'close') {
      config.show = null
    }
    if (zzb.types.isStringNotEmpty(config.rsize)) {
      config.rsize = Number(config.rsize)
    }
    if (!zzb.types.isNumber(config.rsize) || config.rsize < 0) {
      config.rsize = zzb.zui.getDefaultRWidth()
    }
  },

  normalizeWidths(widths) {
    return widths.map(w =>
      (!w || typeof w !== 'string') ? w : (/^\d+$/.test(w) ? `${w}px` : w)
    )
  },

  setStaticWidth(widths, idx, $target, $alt, $resizer) {
    if (widths.length === 0) return
    const raw = widths[idx]
    const isPercent = raw.endsWith('%')
    const parentWidth = $resizer.parentNode.getBoundingClientRect().width
    $resizer.getBoundingClientRect()
    const resizerWidth = $resizer.offsetWidth || 6

    if (!isPercent) {
      $target.style.width = raw
    } else {
      try {
        const pct = parseFloat(raw)
        const maxAvailable = parentWidth - resizerWidth
        $target.style.width = `${(pct / 100) * maxAvailable}px`
      } catch (e) {
        console.warn('Failed to set width', e)
        $target.style.width = '200px'
      }
    }
  },

  updateCache(config, setWidth, state) {
    if (zzb.types.isStringNotEmpty(config.id)) {
      config.show = state
      const zuiC = zzb.dom.cache.get('zuiC', { mode: 'persist' }) || { zsplitter: {} }
      zuiC.zsplitter[config.id] = config
      zzb.dom.cache.set('zuiC', zuiC, { mode: 'persist' })
    }
  },

  applyInitialVisibility(config, widths, $resizer, $target, idxRef) {
    const doReveal = widths.length > 0
    const doOpenClose = config.show === 'open' || config.show === 'close'

    if (doOpenClose) {
      if (config.show === 'close') {
        $target.style.width = 0
        idxRef.current = -1
      }
      $resizer.classList.toggle('d-none', !doReveal)
      $target.classList.toggle('d-none', !doReveal)
    }
  },

  attachTogglers($resizer, widths, idxRef, setWidth, setCache, $target) {
    $resizer.querySelectorAll('[zsplitter-toggable]').forEach(($btn) => {
      $btn.addEventListener('click', (ev) => {
        ev.preventDefault()
        idxRef.current++
        if (idxRef.current < widths.length) {
          setCache('open')
          setWidth()
        } else if (idxRef.current === widths.length) {
          setCache('close')
          idxRef.current = -1
          $target.style.width = '0'
        }
        zzb.zui.triggerZSplitterResize()
      }, false)
    })
  },

  attachDragHandlers($resizer, direction, $target, $alt) {
    let x = 0, y = 0, initialWidth = 0

    const onMouseDown = (e) => {
      if (e.target.closest('[zsplitter-toggable]')) return
      x = e.clientX
      y = e.clientY
      initialWidth = $target.getBoundingClientRect().width

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const onMouseMove = (e) => {
      const dx = e.clientX - x
      const dmod = direction === 'left' ? 1 : -1
      const containerWidth = $resizer.parentNode.getBoundingClientRect().width
      const newWidth = ((initialWidth + dx * dmod) * 100) / containerWidth
      $target.style.width = `${newWidth}%`

      $resizer.style.cursor = 'col-resize'
      document.body.style.cursor = 'col-resize'
      $target.style.userSelect = 'none'
      $target.style.pointerEvents = 'none'
      $alt.style.userSelect = 'none'
      $alt.style.pointerEvents = 'none'

      zzb.zui.triggerZSplitterResize()
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      $resizer.style.removeProperty('cursor')
      document.body.style.removeProperty('cursor')
      $target.style.removeProperty('user-select')
      $target.style.removeProperty('pointer-events')
      $alt.style.removeProperty('user-select')
      $alt.style.removeProperty('pointer-events')

      zzb.zui.triggerZSplitterResize()
    }

    $resizer.addEventListener('mousedown', onMouseDown)
  }
}

_zui.prototype.getZSplitter = function(id) {
  let obj = this.zsplitters[id]
  if (obj) {
    return obj
  }
  return {toggle: null}
}

_zui.prototype.setZSplitter = function(id, obj) {
  if (id && obj) {
    this.zsplitters[id] = obj
  }
}

_zui.prototype.destroyZSplitter = function(id) {
  const splitter = this.zsplitters[id];
  if (splitter) {
    delete this.zsplitters[id];
  }
}

_zui.prototype.toggleZSplitterById = function(id, state) {
  let $elem = document.getElementById(id)
  if ($elem) {
    let obj = zzb.zui.getZSplitter($elem.id)
    obj.toggle(state)
  }
}

_zui.prototype.onLoadInit = function() {
  document.querySelectorAll('.zsplitter').forEach(function($elem) {
    Array.from($elem.attributes).forEach(attr => {
      switch (attr.nodeName) {
        case 'zsplitter-left':
          zzb.zui.initZSplitter($elem, 'left', attr.nodeValue)
          return true
        case 'zsplitter-right':
          zzb.zui.initZSplitter($elem, 'right', attr.nodeValue)
          return true
        default:
          break
      }
    })
  });
  zzb.zui.triggerZSplitterResize()
  document.querySelectorAll('.zuit-eo').forEach(function($elem) {
    let e1 = $elem.getAttribute('zuitEO1')
    if (zzb.types.isStringNotEmpty(e1)) {
      let e2 = $elem.getAttribute('zuitEO2')
      if (zzb.types.isStringNotEmpty(e2)) {
        $elem.innerHTML = e1 + '@' + e2
      }
    }
  });
  document.querySelectorAll('.zuit-year').forEach(function($elem) {
    $elem.innerHTML = new Date().getFullYear()
  });
}

const enLocale = {
  date: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    clear: 'Clear',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'hh:mm aa',
    firstDay: 0
  }
}

_zui.prototype.setLocale = function(locale) {
  this.locale = locale
}

_zui.prototype.getLocale = function(locale, callback) {
  if (!callback) {
    throw new Error('no callback defined for getLocale')
  }
  if (this.locale) {
    callback(this.locale)
  } else {
    let myLocale = enLocale
    zzb.zui.setLocale(myLocale)
    callback(myLocale)
  }
}

_zui.prototype.setElemIniter = function(target) {
  let initer = zzb.types.merge({name:null, fn: null}, target)
  if (initer.name && initer.fn) {
    let isFound = false
    for (let ii = 0; ii < this.elemIniters.length; ii++) {
      if (this.elemIniters[ii].name === initer.name) {
        this.elemIniters[ii] = initer
        isFound = true
        break
      }
    }
    if (!isFound) {
      this.elemIniters.push(initer)
    }
  }
}

_zui.prototype.onElemInit = function($elem) {
  if (!$elem) {
    $elem = document.body
  }

  for (let ii = 0; ii < this.elemIniters.length; ii++) {
    this.elemIniters[ii].fn($elem)
  }

  // Autocomplete
  // Fork: https://github.com/jpfluger/bootstrap-5-autocomplete
  // Derived from: https://github.com/gch1p/bootstrap-5-autocomplete
  if (typeof Autocomplete !== 'undefined') {
    let $elems = document.querySelectorAll('.zautocomplete')
    if ($elems && $elems.length > 0) {
      $elems.forEach(function ($elem) {

        // let opts = zzb.zaction.newZClosest($elem, null, null, null)
        // opts.data = []
        // opts.locale = 'en'
        // opts.maximumItems = 7
        // opts.threshold = 3
        // let opts = zzb.types.merge(opts, zzb.dom.getAttributes($elem, /^zacom-/, 6))
        let opts = zzb.types.merge({
          data: [],
          locale: 'en',
          maximumItems: 7,
          threshold: 3,
          zurl: $elem.getAttribute('zurl'),
          zmod: $elem.getAttribute('zmod'),
        }, zzb.dom.getAttributes($elem, /^zacom-/, 6))
        if (!zzb.types.isArray(opts.data)) {
          opts.data = []
        }
        opts.maximumItems = zzb.strings.parseIntOrZero(opts.maximumItems)
        if (opts.maximumItems <= 0) {
          opts.maximumItems = 7
        }
        opts.threshold = zzb.strings.parseIntOrZero(opts.threshold)
        if (opts.threshold <= 0) {
          opts.threshold = 3
        }
        if (!zzb.types.isStringNotEmpty(opts.zurl)) {
          console.log('zautocomplete zurl not found')
          return
        }
        if (zzb.types.isStringNotEmpty(opts.zmod)) {
          opts.zurl = opts.zurl.replace(':mod', opts.zmod)
        }

        const ac = new Autocomplete($elem, {
          // data: [{label: "One", value: 1},{label: "OneOne", value: 11},{label: "Two", value: 2},{label: "Three", value: 3}],
          // maximumItems: 7,
          // threshold: 1,
          data: opts.data,
          locale: opts.locale,
          maximumItems: opts.maximumItems,
          threshold: opts.threshold,
          onSelectItem: function(label, value){
            // console.log("user selected:", label, value);
          },
          onInput: function (inData) {
            zzb.ajax.postJSON({url: opts.zurl, body: {input: inData, limit: opts.maximumItems}}, function(drr, err) {
              if (err || !drr.rob.hasRecords()) {
                return
              }
              // console.log(drr.rob.recs)
              ac.setData(drr.rob.recs)
            })
          }
        });

      })
    }
  }

  // Date/Time Picker
  // https://air-datepicker.com/
  if (typeof AirDatepicker !== 'undefined') {
    let $elems = document.querySelectorAll('.zdate-picker')
    if ($elems) {
      // Server should be in UTC. Data in value field transmitted to client is UTC, format ISO 8601.
      // https://tc39.es/ecma262/#sec-date-time-string-format
      // https://toastui.medium.com/handling-time-zone-in-javascript-547e67aa842d
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
      // Date.parse("2019-01-01") -> defaults to UTC according to ES5
      // *Best: Date.parse("2019-01-01T00:00:00.000Z") -> specifies UTC
      // Date.parse("2019-01-01T00:00:00.000+00:00") -> specifies UTC
      // Date.parse("2019-01-01T00:00:00") -> defaults to local
      $elems.forEach(function ($elem) {
        // zdate-value = If 'now', then a new Date in local time-zone is created.
        // zdate-locale = The locale to use. default is "en" (English).
        // zdate-auto-close = [ "true" | "false" ] = If false, do not automatically close the calendar pop-up after the date is selected. Default is "true".
        // zdate-use-iso-val = [ "true" | "false" ] = If false, do not use ISO dates but default to whatever the Picker selects. Default is "false" unless 'zf-type="date-iso".
        let dtAttribs = zzb.types.merge({
          value: zzb.dom.getAttributeElse($elem, 'value', null),
          locale: 'en',
          autoClose: true,
          useISOVal: zzb.dom.getAttributeElse($elem, 'zf-type', null) === 'date-iso',
          addBtnToday: true,
          addBtnClear: true,
          autoEvInput: false,
          autoEvBlur: false,
        }, zzb.dom.getAttributes($elem, /^zdate-/, 6))
        dtAttribs.autoClose = zzb.strings.toBool(dtAttribs.autoClose)
        dtAttribs.addBtnToday = zzb.strings.toBool(dtAttribs.addBtnToday)
        dtAttribs.addBtnClear = zzb.strings.toBool(dtAttribs.addBtnClear)
        dtAttribs.autoEvInput = zzb.strings.toBool(dtAttribs.autoEvInput)
        dtAttribs.autoEvBlur = zzb.strings.toBool(dtAttribs.autoEvBlur)

        let dpButtons = []
        if (dtAttribs.addBtnToday) {
          dpButtons.push('today')
        }
        if (dtAttribs.addBtnClear) {
          dpButtons.push('clear')
        }

        // Update the date if an input field.
        let isInput = ($elem.nodeName === 'INPUT')
        let dtCache = null

        const mycfval = $elem.getAttribute('zf-cval')
        if (zzb.types.isStringNotEmpty(dtAttribs.value)) {
          if (!zzb.types.isStringNotEmpty(mycfval)) {
            dtCache = (dtAttribs.value === 'now' ? new Date() : new Date(Date.parse(dtAttribs.value)))
            zzb.dom.setAttribute($elem, 'zdate-value', '')
          }
        }
        if (zzb.types.isStringNotEmpty(mycfval)) {
          dtCache = (dtAttribs.value === 'now' ? new Date() : new Date(Date.parse(mycfval)))
        }

        let name = zzb.dom.getAttributeElse($elem, 'name', null)

        zzb.zui.getLocale(dtAttribs.locale, function(myLocale) {
          let adp = new AirDatepicker($elem, {
            locale: myLocale.date,
            autoClose: dtAttribs.autoClose,
            buttons: dpButtons,
            onSelect: function (ops) {
              if (isInput) {
                //console.log(ops, dtAttribs, ops.date.toISOString(), ops.date.getTimezoneOffset())
                if (dtAttribs.useISOVal) {
                  //zzb.dom.setAttribute($elem, 'value', ops.date.toISOString())
                  if (name && ops && ops.date) {
                    // Set the cached value, which overrides the AirPicker value on form submit.
                    zzb.dom.setAttribute($elem, 'zf-cval', ops.date.toISOString())
                    // console.log(name, 'onSelect', ops.date.toISOString())
                  }
                }
              }
            }
          })
          if (dtCache) {
            adp.selectDate(dtCache)
            // console.log('adp.selectDate dtCache', dtCache)
          }
          if (!luxon) {
            if (dtAttribs.autoEvInput === true || dtAttribs.autoEvBlur === true) {
              console.log('advanced date processing using "luxon.js"')
            }
          } else {
            // Ref: https://github.com/t1m0n/air-datepicker/issues/41
            if (dtAttribs.autoEvInput === true) {
              $elem.addEventListener('input', function(evt) {
                const vInput = $elem.value
                if (zzb.types.isStringNotEmpty(vInput)) {
                  // is vInput valid?
                  let vTemp = luxon.DateTime.fromFormat(vInput, myLocale.date.dateFormat)
                  if (vTemp.isValid) {
                    // console.log('input-isValid', vTemp.toJSDate())
                    adp.selectDate(vTemp.toJSDate())
                  }
                }
              })
            }
            if (dtAttribs.autoEvBlur === true) {
              $elem.addEventListener('blur', function(evt) {
                const vPick = $elem.getAttribute('zf-cval')
                const vInput = $elem.value

                // console.log('onBlur', vPick, vInput, adp.viewDate.toISOString())

                let vTemp = luxon.DateTime.fromFormat(vInput, myLocale.date.dateFormat)
                if (!vTemp.isValid) {
                  zzb.dom.setAttribute($elem, 'zf-cval', '')
                  $elem.value = ''
                }
              })
            }
          }
        })
      })
    }
  }
}

_zui.prototype.onZLoadSection = function($elem, isCustom) {
  if (!$elem) {
    $elem = document.body
  }
  // Have a catch22 situation.
  // Custom actions at a higher-level need to be created prior to the calling of `zloadsection`. How to resolve?
  // When `isCustom` is `false`, then run `zloadsection` otherwise run `zloadsection-custom`.
  let classZInterval = 'zinterval' + (isCustom === true ? '-custom' : '')
  $elem.querySelectorAll('.' + classZInterval).forEach(function($elem) {
    $elem.classList.remove(classZInterval)
    if ($elem.classList.contains('zaction')) {
      //console.log('clicking ' + classZInterval)
      zzb.time.newUIInterval($elem)
    }
  })
  // `zloadsection` must come after zinterval otherwise data-caching will break.
  let classZLoadSection = 'zloadsection' + (isCustom === true ? '-custom' : '')
  $elem.querySelectorAll('.' + classZLoadSection).forEach(function($elem) {
    $elem.classList.remove(classZLoadSection)
    if ($elem.classList.contains('zaction')) {
      //console.log('clicking ' + classZLoadSection)
      $elem.click()
    }
  })
}

_zui.prototype.__registerBuiltins = function () {
  if (this.isRegisteredBuiltins) {
    return
  }

  this.isRegisteredBuiltins = true

  this.setElemIniter({
    name: 'zuiTableFilter',
    fn: function ($root) {
      const filterInput = $root.querySelector('.zui-tablecard-filter') || document.querySelector('.zui-tablecard-filter')
      const table = $root.querySelector('.zui-tablecard-table')
      const cardContainer = $root.querySelector('.zui-tablecard-cards')

      if (!table && !cardContainer) return

      const tableRows = table ? table.querySelectorAll('tbody tr') : []
      const cardRows = cardContainer ? cardContainer.querySelectorAll('.zui-tablecard-card') : []

      // Hook up filter if input exists
      if (filterInput) {
        function filterRecs(query) {
          const q = query.toLowerCase()
          if (tableRows) {
            tableRows.forEach(row => {
              row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none'
            })
          }
          if (cardRows) {
            cardRows.forEach(card => {
              card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none'
            })
          }
        }

        filterInput.addEventListener('input', function () {
          filterRecs(this.value)
        })

        if (table || cardContainer) {
          const currentValue = filterInput.value.trim()
          if (currentValue.length > 0) {
            filterRecs(currentValue)
          }
        }
      }

      if (table) {
        const headers = table.querySelectorAll('thead th')

        // Determine unique key for sort state tracking
        const tableKey = table.getAttribute('id') || table.dataset.sortKey || '__default_table__'

        // Ensure sort state exists in memory cache
        if (!zzb.dom.cache.get(tableKey, { mode: 'mem' })) {
          zzb.dom.cache.set(tableKey, { index: null, direction: 1 }, { mode: 'mem' });
        }
        const sortState = zzb.dom.cache.get(tableKey, { mode: 'mem' });

        headers.forEach((header, index) => {
          header.addEventListener('click', () => {
            const sortType = header.getAttribute('zui-sort-type') || 'text'
            const tbody = table.querySelector('tbody')
            if (!tbody) return
            const rows = Array.from(tbody.querySelectorAll('tr'))
            if (!rows || rows.length === 0) return

            // Toggle or set new sort direction
            if (sortState.index === index) {
              sortState.direction *= -1
            } else {
              sortState.index = index
              sortState.direction = -1 // change to 1 if first click should not sort
            }

            const direction = sortState.direction

            // Clear old sort classes
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'))
            // Add sort indicator class
            header.classList.add(direction === 1 ? 'sort-asc' : 'sort-desc')

            // Then sort using updated direction
            const sortedRows = rows.sort((a, b) => {
              const aCell = a.children[index]
              const bCell = b.children[index]
              return compareTableCells(aCell, bCell, sortType) * direction
            })

            // Update cache
            zzb.dom.cache.set(tableKey, sortState, { mode: 'mem' });

            // Re-append in sorted order
            sortedRows.forEach(row => tbody.appendChild(row))
          })
        })

        // Reapply previous sort if any
        if (sortState.index !== null) {
          const sortHeader = headers[sortState.index]
          if (sortHeader) {
            const sortType = sortHeader.getAttribute('zui-sort-type') || 'text'
            const tbody = table.querySelector('tbody')
            if (!tbody) return
            const rows = Array.from(tbody.querySelectorAll('tr'))
            if (!rows || rows.length === 0) return

            // Apply sort class again
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'))
            sortHeader.classList.add(sortState.direction === 1 ? 'sort-asc' : 'sort-desc')

            const sortedRows = rows.sort((a, b) => {
              const aCell = a.children[sortState.index]
              const bCell = b.children[sortState.index]
              return compareTableCells(aCell, bCell, sortType) * sortState.direction
            })

            sortedRows.forEach(row => tbody.appendChild(row))
          }
        }
      }
    }
  })
}

/**
 * Compares two table cell elements based on a type or custom sort definition.
 * Delegates value comparison to `zzb.types.compareValues`.
 *
 * @param {HTMLElement} aCell - First cell element.
 * @param {HTMLElement} bCell - Second cell element.
 * @param {string} type - Type of comparison (e.g., 'int', 'float', 'custom:field:subtype').
 * @returns {number} - Comparison result (-1, 0, 1).
 */
function compareTableCells(aCell, bCell, type) {
  let aVal, bVal, sortType;

  if (type.startsWith('custom:')) {
    const [, field, subtype = 'text'] = type.split(':');
    sortType = subtype;
    aVal = getCustomSortValue(aCell, field);
    bVal = getCustomSortValue(bCell, field);
  } else {
    sortType = type;
    aVal = aCell?.textContent?.trim() || '';
    bVal = bCell?.textContent?.trim() || '';
  }

  return zzb.types.compareValues(aVal, bVal, sortType);
}

/**
 * Extracts a subvalue from a table cell based on a custom field.
 *
 * @param {HTMLElement} cellElem - The table cell element.
 * @param {string} sortId - The sort ID to find within the cell.
 * @returns {string} - The extracted value, or empty string.
 */
function getCustomSortValue (cellElem, sortId) {
  if (!cellElem || typeof cellElem.querySelector !== 'function') return '';
  const target = cellElem.querySelector(`[zui-sort-id="${sortId}"]`);
  return target ? target.textContent.trim() : '';
}

/**
 * Core initializer for ZUI (Zazzy UI) once the environment is ready.
 *
 * This method is invoked by the global DOM bootstrap logic, and is responsible
 * for initializing internal ZUI systems. It assumes that all required DOM elements
 * are fully loaded and available.
 *
 * Specifically:
 * - Registers built-in initializers via `__registerBuiltins()`
 * - Executes `onLoadInit()` to configure layout and preload settings
 * - Executes `onElemInit()` to apply UI logic to the current DOM
 * - Triggers `onZLoadSection()` to run dynamic actions like zintervals or zloadsection
 *
 * This should **not** attach any global event listeners directly. Use this in coordination
 * with the global `DOMContentLoaded` hook which handles deferring setup logic.
 */
_zui.prototype.onZUIReady = function () {
  if (typeof this.__registerBuiltins === 'function') {
    this.__registerBuiltins();
  }
  this.onLoadInit();
  this.onElemInit();
  this.onZLoadSection();
};

exports.zui = _zui
