// ---------------------------------------------------
// _zui
// ---------------------------------------------------

// FUTURE
// 1. Disable back button
//    https://stackoverflow.com/questions/12381563/how-can-i-stop-the-browser-back-button-using-javascript/34337617#34337617

const _zui = function () {
  this.zsplitters = {}
  this.elemIniters = []
  this.defaultRWidth = 576 // default responsive width
  this.handlers = []
}

_zui.prototype.getDefaultRWdith = function () {
  return this.defaultRWidth
}

// RESPONSIVE CHECK
function getViewport () {
  // https://stackoverflow.com/a/8876069
  const width = Math.max(
    document.documentElement.clientWidth, window.innerWidth || 0
  )
  return width
  // if (width <= 576) return 576 // 'xs'
  // if (width <= 768) return 768 // 'sm'
  // if (width <= 992) return 992 // 'md'
  // if (width <= 1200) return 1200 // 'lg'
  // return 99999 // 'xl'
}

_zui.prototype.isViewportGTRSize = function (rsize) {
  if (!zzb.types.isNumber(rsize) || rsize <= 0) {
    rsize = this.defaultRWidth
  }
  return (getViewport() > rsize)
}

_zui.prototype.getZUICache = function () {
  let c = {zsplitter:{}}
  try {
    let s = localStorage.getItem('zuiC')
    if (zzb.types.isStringNotEmpty(s)) {
      let o = JSON.parse(s)
      if (zzb.types.isObject(o)) {
        // console.log('c-saved', o.zsplitter)
        return zzb.types.merge(c, o)
      }
    }
  } catch (e) {
    console.log(e)
  }
  // console.log('c-new', c)
  return c
}

_zui.prototype.setZUICache = function (zuiC) {
  localStorage.setItem('zuiC', JSON.stringify(zuiC))
}

_zui.prototype.removeZUICache = function () {
  localStorage.removeItem('zuiC')
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
      let zuiC = zzb.zui.getZUICache()
      zuiC.zsplitter[zsplitter.id] = zsplitter
      zzb.zui.setZUICache(zuiC)
    } catch (e) {
      console.log(e)
    }
  }
}

function initZSplitter($resizer, direction, arrToggableWidths) {
  let zsplitter = zzb.dom.getAttributes($resizer, /^zsplitter-/, 10)
  zsplitter.id = $resizer.getAttribute('id')

  let usingCache = zzb.types.isStringNotEmpty(zsplitter.id)
  let isCacheNew = true
  if (usingCache) {
    let zuiC = zzb.zui.getZUICache()
    isCacheNew = (!zuiC.zsplitter[zsplitter.id])
    if (isCacheNew) {
      zuiC.zsplitter[zsplitter.id] = zsplitter
      zzb.zui.setZUICache(zuiC)
    } else {
      zsplitter = zuiC.zsplitter[zsplitter.id]
    }
  }

  if (zsplitter.show !== 'open' && zsplitter.show !== 'close') {
    zsplitter.show = null
  }

  if (zzb.types.isStringNotEmpty(zsplitter.rsize)) {
    zsplitter.rsize = Number(zsplitter.rsize)
  }
  if (!zzb.types.isNumber(zsplitter.rsize) || zsplitter.rsize < 0) {
    zsplitter.rsize = zzb.zui.getDefaultRWdith()
  }

  const setCacheZSplitter = function(state) {
    if (usingCache) {
      zsplitter.show = state
      setZUICacheZSplitter(zsplitter)
      // console.log(state)
    }
  }

  let doRSizeOpen = zzb.zui.isViewportGTRSize(zsplitter.rsize) // (getViewport() > zsplitter.rsize)
  if (usingCache && isCacheNew && !doRSizeOpen) {
    if (zsplitter.show === 'open') {
      setCacheZSplitter('close')
    }
  } else if (!usingCache && !doRSizeOpen) {
    zsplitter.show = 'close'
  }
  // console.log('responsive-check', zsplitter, 'doRSizeShow=' + doRSizeOpen)


  if (!arrToggableWidths) {
    arrToggableWidths = []
  } else if (!Array.isArray(arrToggableWidths)) {
    arrToggableWidths = arrToggableWidths.split(',')
  }
  function isCharNumber(c) {
    return c >= '0' && c <= '9';
  }
  for (let ii = 0; ii < arrToggableWidths.length; ii++) {
    if (isCharNumber(arrToggableWidths[ii].slice(-1))) {
      if (arrToggableWidths[ii] !== '') {
        arrToggableWidths[ii] += 'px'
      }
    }
  }

  // set the id, if not present
  if (!usingCache) {
    $resizer.id = 'zsplitter' + zzb.zui.getZSplitters().length + direction
  }

  // "left" or "right"
  const $targetSide = (direction === 'left' ? $resizer.previousElementSibling : $resizer.nextElementSibling)
  const $altSide = (direction === 'left' ? $resizer.nextElementSibling : $resizer.previousElementSibling)

  let idxWidthStatic = 0
  function setStaticWidth() {
    if (arrToggableWidths.length > 0) {
      if (!arrToggableWidths[idxWidthStatic].endsWith('%')) {
        $targetSide.style.width = arrToggableWidths[idxWidthStatic]
      } else {
        let pwidth = 0
        let total = 0
        try {
          let pwidth = parseFloat(arrToggableWidths[idxWidthStatic].slice(0, -1)) / 100
          let total = $resizer.getBoundingClientRect().width + $targetSide.getBoundingClientRect().width + $altSide.getBoundingClientRect().width
          // console.log($resizer.parentNode.getBoundingClientRect().width, $resizer.getBoundingClientRect().width, $targetSide.getBoundingClientRect().width, $altSide.getBoundingClientRect().width, total, total / 2, $resizer.parentNode.getBoundingClientRect().width - total)
          $targetSide.style.width = (total * pwidth) + 'px'
        } catch {
          console.log('failed to set targetSide width', pwidth, total)
          $targetSide.style.width = '200px'
        }
      }
    }
  }

  setStaticWidth()

  $resizer.querySelectorAll('[zsplitter-toggable]').forEach(function($elem) {
    $elem.addEventListener('click', function (ev) {
      ev.preventDefault();

      idxWidthStatic++

      if (idxWidthStatic < arrToggableWidths.length) {
        setCacheZSplitter('open')
        setStaticWidth()
      } else if (idxWidthStatic === arrToggableWidths.length) {
        setCacheZSplitter('close')
        idxWidthStatic = -1
        $targetSide.style.width = '0'
      }

      zzb.zui.triggerZSplitterResize()

    }, false);
  })

  // Logic to auto-show (or not)
  // 1. Must have valid width (eg arrToggableWidths.length > 0)
  // 2. Use value from zsplitter-show="true" ("false").
  //    a. if not found, examine class on $resizer for 'd-none'
  //    b. if not found, examine class on $targetSide for 'd-none'
  let doReveal = arrToggableWidths.length > 0
  let doOpenOrClose = zsplitter.show === 'open' || zsplitter.show === 'close'
  if (doOpenOrClose) {
    if (zsplitter.show === 'close') {
      $targetSide.style.width = 0
      idxWidthStatic = -1
    }
    if (doReveal) {
      $resizer.classList.remove('d-none')
      $targetSide.classList.remove('d-none')
    } else {
      $resizer.classList.add('d-none')
      $targetSide.classList.add('d-none')
    }
  }

  let obj = zzb.zui.getZSplitter($resizer.id)
  obj.toggle = function(state) {
    if (state === 'open') {
      idxWidthStatic = 0
      $resizer.classList.remove('d-none')
      $targetSide.classList.remove('d-none')
      setCacheZSplitter(state)
      setStaticWidth()
    } else if (state === 'close') {
      $targetSide.style.width = 0
      idxWidthStatic = -1
      $resizer.classList.remove('d-none')
      $targetSide.classList.remove('d-none')
      setCacheZSplitter(state)
    } else if (state === 'dismiss') {
      idxWidthStatic = -1
      $resizer.classList.add('d-none')
      $targetSide.classList.add('d-none')
    }
    zzb.zui.triggerZSplitterResize()
  }

  zzb.zui.setZSplitter($resizer.id, obj)

  // The current position of mouse
  let x = 0;
  let y = 0;
  let targetWidth = 0;

  // Handle the mousedown event
  // that's triggered when user drags the resizer
  const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    targetWidth = $targetSide.getBoundingClientRect().width;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    const dmod = (direction === 'left' ? 1 : -1)

    const newTargetWidth = ((targetWidth + dx * dmod) * 100) / $resizer.parentNode.getBoundingClientRect().width;
    $targetSide.style.width = `${newTargetWidth}%`;

    $resizer.style.cursor = 'col-resize';
    document.body.style.cursor = 'col-resize';

    $targetSide.style.userSelect = 'none';
    $targetSide.style.pointerEvents = 'none';

    $altSide.style.userSelect = 'none';
    $altSide.style.pointerEvents = 'none';

    zzb.zui.triggerZSplitterResize()
  };

  const mouseUpHandler = function () {
    $resizer.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');

    $targetSide.style.removeProperty('user-select');
    $targetSide.style.removeProperty('pointer-events');

    $altSide.style.removeProperty('user-select');
    $altSide.style.removeProperty('pointer-events');

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);

    zzb.zui.triggerZSplitterResize()
  };

  // Attach the handler
  $resizer.addEventListener('mousedown', mouseDownHandler);
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
          initZSplitter($elem, 'left', attr.nodeValue)
          return true
        case 'zsplitter-right':
          initZSplitter($elem, 'right', attr.nodeValue)
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
        this.elemIniters[ii] = intiter
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

        if (zzb.types.isStringNotEmpty(dtAttribs.value)) {
          dtCache = (dtAttribs.value === 'now' ? new Date() : new Date(Date.parse(dtAttribs.value)))
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
                    // console.log('onSelect')
                  }
                }
              }
            }
          })
          if (dtCache) {
            adp.selectDate(dtCache)
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
                if (zzb.types.isNonEmptyString(vInput)) {
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

document.addEventListener('DOMContentLoaded', function () {
  zzb.zui.onLoadInit()
  zzb.zui.onElemInit()
}, false);

exports.zui = _zui
