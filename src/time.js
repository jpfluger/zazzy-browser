// ---------------------------------------------------
// time
// ---------------------------------------------------

function _time () {}

class ZazzyInterval {
  constructor(options) {
    this.options = ZazzyInterval.getZazzyDefaults(options)
    if (this.options.autostart === true) {
      this.options.new()
    }
  }
  static getZazzyDefaults(options) {
    const myInterval = {
      interval: 60000,
      autostart: false,
      id: null,
      targetClick: null,
      datacache: false,
      action: function() {console.log('ZazzyInterval no-op')}
    }
    options = (zzb.types.isObject(options) ? zzb.types.merge(myInterval, options) : myInterval)
    options.autostart = options.autostart === true
    if (!(zzb.types.isStringNotEmpty(options.id))) {
      options.id = zzb.uuid.newV4()
    }
    if (!zzb.types.isFunction(options.action)) {
      throw new Error('required action')
    }
    options._cache = null
    options._itoken = null
    if (!zzb.types.isFunction(options.new)) {
      options.new = function() {
        options._itoken = setInterval(options.refresh, this.interval)
      }
    }
    if (!zzb.types.isFunction(options.clear)) {
      options.clear = function() {
        if (options._itoken == null) {
          return
        }
        clearInterval(options._itoken)
      }
    }
    if (!zzb.types.isFunction(options.refresh)) {
      options.refresh = function() {
        if (options._itoken == null) {
          return
        }
        options.action && options.action()
        // document.getElementById("butMainSearch").click()
      }
    }
    return options
  }
  new() {
    if (zzb.types.isFunction(this.options.new)) {
      this.options.new()
    }
  }
  clear() {
    if (zzb.types.isFunction(this.options.clear)) {
      this.options.clear()
    }
  }
  refresh() {
    if (zzb.types.isFunction(this.options.refresh)) {
      this.options.refresh()
    }
  }
  setCache(obj) {
    this.options._cache = this.options.datacache ? obj : null
  }
  getCache() {
    return this.options.datacache ? this.options._cache : null
  }
  hasCache() {
    return this.options.datacache && this.options._cache
  }
}

_time.prototype.ZazzyInterval = ZazzyInterval

_time.prototype.getInterval = function (id) {
  if (!this.myIntervals || !zzb.types.isStringNotEmpty(id) || !this.myIntervals[id]) {
    return null
  }
  return this.myIntervals[id]
}

_time.prototype.clearAll = function () {
  if (!this.myIntervals || !zzb.types.isArray(this.myIntervals)) {
    return
  }
  for (let ii = 0; ii < this.myIntervals.length; ii++) {
    this.myIntervals[ii].clear()
  }
}

_time.prototype.newInterval = function (options) {
  if (!this.myIntervals) {
    this.myIntervals = {}
  }
  if (options && options.id && zzb.types.isStringNotEmpty(options.id)) {
    if (this.myIntervals[options.id]) {
      return this.myIntervals[options.id]
    }
  }
  const myInterval = new ZazzyInterval(options)
  if (myInterval && myInterval.options && zzb.types.isStringNotEmpty(myInterval.options.id)) {
    this.myIntervals[myInterval.options.id] = myInterval
    return myInterval
  }
  throw new Error('Failed to create ZazzyInterval')
}

_time.prototype.newUIInterval = function ($elem) {
  if (!$elem) {
    return
  }
  if ($elem.getAttribute('zi-inited') === 'true') {
    return
  }
  if (!zzb.types.isStringNotEmpty($elem.getAttribute('id'))) {
    $elem.setAttribute('id', zzb.uuid.newV4())
  }
  // zi-interval = The interval in milliseconds. Default is 60000 (1 minute).
  // zi-id = The name of identifying this interval object. Default is a new uuid4 value.
  // zi-autostart = [ "true" | "false" ] If true, then begin the timer immediately otherwise do not start.
  zzb.time.newInterval({
    interval: zzb.dom.getAttributeElse($elem, 'zi-interval', null),
    id: zzb.dom.getAttributeElse($elem, 'zi-id', null),
    autostart: $elem.getAttribute('zi-autostart') === 'true',
    targetClick: $elem.getAttribute('id'),
    datacache: $elem.getAttribute('zi-datacache') === 'true',
    action: function() {
      //console.log('myInterval.action', this.targetClick)
      document.getElementById(this.targetClick).setAttribute('zi-noclick', 'true');
      document.getElementById(this.targetClick).click();
    }
  })
  $elem.setAttribute('zi-inited', 'true')
}

exports.time = _time
