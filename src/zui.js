// ---------------------------------------------------
// _ajax
// ---------------------------------------------------

// FUTURE
// 1. Disable back button
//    https://stackoverflow.com/questions/12381563/how-can-i-stop-the-browser-back-button-using-javascript/34337617#34337617

var _zui = function () {
  this.zsplitters = {}
}

function initZSplitter($resizer, direction, arrToggableWidths) {
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
  if (!zzb.types.isNonEmptyString($resizer.id)) {
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
        setStaticWidth()
      } else if (idxWidthStatic === arrToggableWidths.length) {
        idxWidthStatic = -1
        $targetSide.style.width = '0'
      }

    }, false);
  })

  // Logic to auto-show (or not)
  // 1. Must have valid width (eg arrToggableWidths.length > 0)
  // 2. Use value from zsplitter-show="true" ("false").
  //    a. if not found, examine class on $resizer for 'd-none'
  //    b. if not found, examine class on $targetSide for 'd-none'
  let doShow = arrToggableWidths.length > 0
  let isClosed = false
  if (doShow) {
    let isFound = false
    for (var ii = 0; ii < $resizer.attributes.length; ii++) {
      if ($resizer.attributes[ii].nodeName === 'zsplitter-show') {
        doShow = $resizer.attributes[ii].nodeValue === 'open'
        if (!doShow) {
          isClosed = $resizer.attributes[ii].nodeValue === 'closed'
          if (isClosed) {
            doShow = true
          }
        }
        isFound = true
        break
      }
    }
    if (!isFound) {
      if ($resizer.classList.contains('d-none')) {
        doShow = false
      } else if ($targetSide.classList.contains('d-none')) {
        doShow = false
      }
    }
    if (isClosed) {
      $targetSide.style.width = 0
      idxWidthStatic = -1
    }
    if (doShow) {
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
      setStaticWidth()
    } else if (state === 'close') {
      $targetSide.style.width = 0
      idxWidthStatic = -1
      $resizer.classList.remove('d-none')
      $targetSide.classList.remove('d-none')
    } else if (state === 'dismiss') {
      idxWidthStatic = -1
      $resizer.classList.add('d-none')
      $targetSide.classList.add('d-none')
    }
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

_zui.prototype.onElemInit = function($elem) {
  if (!$elem) {
    $elem = document.body
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
        let dtAttribs = zzb.types.merge(zzb.dom.getAttributes($elem, /^zdate-/, 6), {
          value: zzb.dom.getAttributeElse($elem, 'value', null),
          locale: 'en',
          autoClose: true,
          useISOVal: zzb.dom.getAttributeElse($elem, 'zf-type', null) === 'date-iso'
        })
        dtAttribs.autoClose = zzb.strings.toBool(dtAttribs.autoClose)

        // Update the date if an input field.
        let isInput = ($elem.nodeName === 'INPUT')
        let dtCache = null

        if (zzb.types.isNonEmptyString(dtAttribs.value)) {
          dtCache = (dtAttribs.value === 'now' ? new Date() : new Date(Date.parse(dtAttribs.value)))
        }

        let name = zzb.dom.getAttributeElse($elem, 'name', null)

        zzb.zui.getLocale(dtAttribs.locale, function(myLocale) {
          let adp = new AirDatepicker($elem, {
            locale: myLocale.date,
            autoClose: dtAttribs.autoClose,
            onSelect: function (ops) {
              if (isInput) {
                //console.log(ops, dtAttribs, ops.date.toISOString(), ops.date.getTimezoneOffset())
                if (dtAttribs.useISOVal) {
                  //zzb.dom.setAttribute($elem, 'value', ops.date.toISOString())
                  if (name) {
                    // Set the cached value, which overrides the AirPicker value on form submit.
                    zzb.dom.setAttribute($elem, 'zf-cval', ops.date.toISOString())
                  }
                }
              }
            }
          })
          if (dtCache) {
            adp.selectDate(dtCache)
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