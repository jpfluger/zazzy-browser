// ---------------------------------------------------
// _zaction
// ---------------------------------------------------

class ZActionHandler {
  constructor(options) {
    this.options = zzb.types.merge({id:null,handler:null,namespace:null}, options)
  }
  getId() {
    return this.options.id
  }
  getHandler() {
    return this.options.handler
  }
  getNameSpace() {
    return this.options.namespace
  }
  run(zaction) {
    if (this.options.handler) {
      return this.options.handler(zaction)
    }
    return false
  }
}

const _zaction = function () {
  this.handlers = []
  // Required
  // this.handlers = [
  //     new ZActionHandler({handler: zzb.zaction.actionHandler})
  // ]
}

_zaction.prototype.ZActionHandler = ZActionHandler

_zaction.prototype.registerHandler = function(options) {
  zzb.zaction.setHandler(new ZActionHandler(options))
}

_zaction.prototype.getHandlers = function() {
  return this.handlers
}

_zaction.prototype.getHandler = function(id) {
  if (!id) {
    return
  }
  for (const handler of this.handlers) {
    if (handler.getId() === id) return handler;
  }
  return null
}

_zaction.prototype.setHandler = function(handler) {
  if (!handler) {
    return
  }
  for (let ii = 0; ii < this.handlers.length; ii++) {
    if (this.handlers[ii].getId() === handler.id) {
      this.handlers[ii] = handler
      return
    }
  }
  this.handlers.push(handler)
}

// function findSelectorTargets($elem, bundle) {
//   if (!$elem) {
//     return null
//   }
//   if (!zzb.types.isStringNotEmpty(bundle)) {
//     return null
//   }
//   let arr = []
//   let ssTargets = bundle.split(',')
//   for (let mm = 0; mm < ssTargets.length; mm++) {
//
//     let bundle = ssTargets[mm]
//
//     switch (bundle) {
//       case 'self':
//         arr.push({label: 'self', $elem: $elem})
//         break
//       case 'self:':
//         arr.push({label: 'self', $elem: $elem})
//         break
//       case 'none':
//         return 'none'
//       case 'none:':
//         return 'none'
//       default:
//         // parse
//         // label.selector:#id
//         // label.selector@placement:#id
//         let split = [ bundle.substring(0, bundle.indexOf(':')), bundle.substring(bundle.indexOf(':') + 1) ]
//         if (split.length === 2) {
//           if (!zzb.types.isStringNotEmpty(split[1])) {
//             return null
//           }
//
//           let label = null
//           if (split[0].indexOf('.') > 1) {
//             // label.selector#placement
//             label = split[0].slice(0, split[0].indexOf('.'))
//             split[0] = split[0].slice(split[0].indexOf('.') + 1)
//           }
//
//           let placement = 'inner'
//           let mySelector = split[0]
//           if (split[0].indexOf('@') > 1) {
//             // label.selector#placement
//             mySelector = split[0].slice(0, split[0].indexOf('@'))
//             placement = split[0].slice(split[0].indexOf('@') + 1)
//           }
//
//           let $target = null
//           if (mySelector === 'selector' || mySelector === 's') {
//             $target = document.querySelector(split[1])
//           } else if (mySelector === 'closest' || mySelector === 'c') {
//             $target = $elem.closest(split[1])
//           } else if (mySelector === 'child' || mySelector === 'h') {
//             $target = $elem.querySelector(split[1])
//           }
//
//           if (!(placement === 'inner' || placement === 'outer')) {
//             console.log('unknown placement param inside inject; defaulting to "inner"', split)
//             placement = 'inner'
//           }
//
//           if ($target) {
//             arr.push({label: label, $elem: $target, placement: placement})
//           }
//         }
//     }
//   }
//
//   return arr
// }

_zaction.prototype.buildZClosest = function($elem, obj, isFirstZAction, zaExtraHandler) {
  return buildZClosest($elem, obj, isFirstZAction, zaExtraHandler)
}

class ZBuilder {
  constructor($elem) {
    this.$elem = $elem;
    this.zaction = {};
    this.zdata = {};
    this.zdlg = { tryDialog: false };
    this.zurl = null;
    this.$data = null;
    this.arrInjects = null;
    this.zref = {};
    this.zinterval = {
      id: $elem.getAttribute('zi-id'),
      noClick: $elem.getAttribute('zi-noclick') === 'true'
    };
    this.forceIgnoreZUrl = false;
    this.forceIgnoreZData = false;
    this.forceIgnoreZInject = false;
    this.isForm = false;
    this.formData = null;

    $elem.setAttribute('zi-noclick', 'false');
  }

  bld_mergeAttributes() {
    this.zaction = zzb.types.merge(zzb.dom.getAttributes(this.$elem, /^za-/, 3), this.zaction);
    this.zdata = zzb.types.merge(zzb.dom.getAttributes(this.$elem, /^zd-/, 3), this.zdata);
  }

  bld_addViewPort() {
    if (typeof window !== 'undefined') {
      this.zaction.viewPort = {
        window: {
          w: Math.round(window.innerWidth) || 0,
          h: Math.round(window.innerHeight) || 0
        },
        content: { w: 0, h: 0 }
      };

      const mainContainer = document.querySelector('.zwc-main-content');
      if (mainContainer) {
        const rect = mainContainer.getBoundingClientRect();
        this.zaction.viewPort.content = {
          w: Math.round(rect.width),
          h: Math.round(rect.height)
        };
      }
    }
  }

  bld_resolveZUrl(isFirstCall, isFirstZAction) {
    if (this.forceIgnoreZUrl) return;

    if (isFirstCall || isFirstZAction) {
      this.forceIgnoreZUrl = this.zaction.ignoreZurl === 'true';
    }

    if (!this.forceIgnoreZUrl && !this.zurl) {
      this.zurl = zzb.dom.findZUrl(this.$elem, true);
    }
  }

  bld_resolveZData() {
    if (this.forceIgnoreZData || this.$data) return;

    if (zzb.types.isStringNotEmpty(this.zaction.data)) {
      const arrData = zzb.dom.findSelectorTargets(this.$elem, this.zaction.data);
      if (arrData && arrData[0].$elem) {
        this.$data = arrData[0].$elem;
        this.forceIgnoreZData = this.$data === 'none';

        if (!this.forceIgnoreZData) {
          if (this.$data.nodeName.toLowerCase() === 'form') {
            this.isForm = true;
            this.formData = new FormData(this.$data);
          }
        } else {
          this.$data = null;
          this.formData = null;
        }
      } else {
        console.warn('No matching selector found for zaction.data:', this.zaction.data);
      }
    }
  }

  bld_resolveZDialog() {
    this.zref = zzb.types.merge(zzb.dom.getAttributes(this.$elem, /^zref-/, 5), this.zref);
    this.zdlg = zzb.types.merge(zzb.dom.getAttributes(this.$elem, /^zdlg-/, 5), this.zdlg);

    if (zzb.types.isStringNotEmpty(this.zaction.dlg)) {
      const arrDlg = zzb.dom.findSelectorTargets(this.$elem, this.zaction.dlg);
      if (arrDlg && arrDlg[0].$elem) {
        const $dlgElem = arrDlg[0].$elem;
        this.zdlg = zzb.types.merge(zzb.dom.getAttributes($dlgElem, /^zdlg-/, 5), this.zdlg);
        this.zaction = zzb.types.merge(zzb.dom.getAttributes($dlgElem, /^za-/, 3), this.zaction);

        if (!this.zurl) {
          this.zurl = zzb.dom.findZUrl($dlgElem, true);
        }
      }
    }
  }

  bld_resolveInjects() {
    if (this.forceIgnoreZInject || this.arrInjects) return;

    if (zzb.types.isStringNotEmpty(this.zaction.inject)) {
      const arrInjects = zzb.dom.findSelectorTargets(this.$elem, this.zaction.inject);
      if (arrInjects !== 'none') {
        this.arrInjects = arrInjects;
      } else {
        this.forceIgnoreZInject = true;
        this.arrInjects = null;
      }
    }
  }
}

function buildZClosest($elem, obj = null, isFirstZAction = false, zaExtraHandler = null) {
  if (!$elem) return null;

  const isFirstCall = !obj;
  const builder = isFirstCall ? new ZBuilder($elem) : obj;

  builder.$elem = $elem;

  builder.bld_mergeAttributes();
  if (isFirstCall) builder.bld_addViewPort();
  builder.bld_resolveZUrl(isFirstCall, isFirstZAction);
  builder.bld_resolveZData();
  if (isFirstCall || isFirstZAction) builder.bld_resolveZDialog();
  builder.bld_resolveInjects();

  const notOnZaction = isFirstCall && !$elem.classList.contains('zaction') &&
    zaExtraHandler !== 'za-post-action';

  if (notOnZaction) {
    const $parentZ = $elem.closest('.zaction');
    return buildZClosest($parentZ, builder, notOnZaction, zaExtraHandler);
  }

  const closest = zzb.dom.getAttributeElse($elem, 'zclosest', null);
  if (closest) {
    const $target = $elem.closest(closest);
    if ($target) return buildZClosest($target, builder);
  }

  return builder;
}

class ZActionEvent {
  constructor(ev) {
    this.ev = ev;
    this.zcall = ev?.target?.getAttribute('zcall') || null;
    this._options = null;
    this._runAJAX = null;
    this.reservePH = [':event', ':mod', ':zid', ':zidParent', ':blobName'];
  }

  isMouseDown() {
    return this.zcall === 'mousedown';
  }

  forceStopPropDef(force) {
    const shouldStop = force || this.ev?.target?.getAttribute('force-stop-prop-def') === 'true';
    if (shouldStop) {
      this.ev.preventDefault?.();
      this.ev.stopPropagation?.();
    }
    return shouldStop;
  }

  getZEvent() {
    return this.getOptions()?.zaction?.event ?? null;
  }

  hasZEvent() {
    const event = this.getZEvent();
    return zzb.types.isStringNotEmpty(event);
  }

  isValid() {
    return !!this.ev?.target && this.hasZEvent();
  }

  isZUrl() {
    return zzb.types.isStringNotEmpty(this.getOptions()?.zurl);
  }

  canRunZVal() {
    return (this._options && this._options.$data && this._options.zaction && this._options.zaction.doZval === "true")
  }

  runAJAX(options, callback) {
    this.getOptions();
    if (!options || !this._runAJAX) {
      callback?.(null, new Error('_runAJAX not defined'));
    } else {
      this._runAJAX(options, callback);
    }
  }

  runInjects(response) {
    const injects = this.getOptions().arrInjects;
    const dInjects = response?.rob?.first?.()?.dInjects;
    if (injects && dInjects) {
      runInjects(injects, dInjects);
    }
  }

  getOptions() {
    if (this._options) return this._options;

    const target = this.ev?.target;
    if (!target) return (this._options = null);

    const built = zzb.zaction.buildZClosest(target, null, null, this.ev.zaExtraHandler);

    if (!built) {
      this._options = null;
      return null;
    }

    this._options = built;
    const opts = this._options;

    if (!opts.forceIgnoreZData && opts.$data) {
      opts.zaction.zid ??= zzb.dom.getAttributeElse(opts.$data, 'za-zid', null);
      opts.zaction.zidParent ??= zzb.dom.getAttributeElse(opts.$data, 'za-zid-parent', null);
      opts.zurl ??= zzb.dom.findZUrl(opts.$data, true);
    }

    if (!opts.forceIgnoreZUrl && zzb.types.isStringNotEmpty(opts.zurl)) {
      for (const ph of this.reservePH) {
        if (opts.zurl.includes(ph)) {
          const key = ph.slice(1);
          const val = opts.zaction[key];
          if (!zzb.types.isStringNotEmpty(val)) {
            throw new Error(`Missing required placeholder '${ph}' in zurl`);
          }
          opts.zurl = opts.zurl.replace(ph, val);
        }
      }
    }

    opts.zaction.pageOn = zzb.strings.parseIntOrZero(opts.zaction.pageOn);
    opts.zaction.pageLimit = zzb.strings.parseIntOrZero(opts.zaction.pageLimit);
    opts.zaction.method ||= 'postJSON';

    switch (opts.zaction.method) {
      case 'getJSON':
        this._runAJAX = zzb.ajax.getJSON;
        break;
      case 'postFORM':
        this._runAJAX = zzb.ajax.postFORM;
        break;
      default:
        this._runAJAX = zzb.ajax.postJSON;
    }

    opts.zdlg.tryDialog = zzb.types.isObject(opts.zdlg) && Object.keys(opts.zdlg).length > 0;

    if (
      zzb.types.isStringNotEmpty(opts.zaction.loopType) &&
      !opts.forceIgnoreZInject &&
      opts.arrInjects
    ) {
      if (opts.zaction.loopInjectSkipInject === 'true') {
        opts.zaction.loopType = null;
      } else {
        opts.hasLoopType = true;
      }
    }

    return opts;
  }

  buildAJAXOptions() {
    this.getOptions();
    const opts = this._options;
    const ajaxOptions = { url: opts.zurl };
    const myInterval = zzb.time.getInterval(opts.zinterval.id);
    const hasCache = myInterval && myInterval.hasCache();
    let doSetCache = false;

    if (myInterval && !opts.zinterval.noClick) {
      myInterval.setCache(null);
    }

    switch (opts.zaction.method) {
      case 'postJSON':
        if (!opts.forceIgnoreZData) {
          if (opts.isForm) {
            ajaxOptions.body = hasCache
              ? myInterval.getCache()
              : zzb.dom.formDataToJson(opts.$data);

            // Optionally merge zdata if needed, otherwise you can skip this merge
            if (opts.zdata) {
              ajaxOptions.body = zzb.types.merge(ajaxOptions.body, opts.zdata);
            }
          }
        }
        ajaxOptions.body = ajaxOptions.body || {};
        ajaxOptions.body.zaction = opts.zaction;
        break;

      case 'postFORM':
        ajaxOptions.body = hasCache ? myInterval.getCache() : opts.formData;
        doSetCache = !hasCache;
        break;
    }

    if (doSetCache && myInterval) {
      myInterval.setCache(ajaxOptions.body);
    }

    if (zzb.types.isStringNotEmpty(opts.zaction.expectType)) {
      ajaxOptions.expectType = opts.zaction.expectType;
    }

    return ajaxOptions;
  }
}

_zaction.prototype.ZActionEvent = ZActionEvent;

_zaction.prototype.newZAction = function (ev) {
  const zact = new ZActionEvent(ev);
  return zact;
};

// Three means to run handlers
// 1. Use built-in handlers. Defaults are in _zaction.prototype.actionHandler, including hooks to the `zurl` system
// 2. Pass-in an unregistered handler for designated selectors only.
// 3. Pre-register a handler to be called every time. Registration happens prior to calling addEventListeners.
_zaction.prototype.addEventListeners = function(selector, unregisteredHandler, $parent) {

  // Since querySelectorAll errors on an empty string, simply return when selector is empty.
  if (!zzb.types.isStringNotEmpty(selector)) {
    return
  }

  // The parent element to user for the selector
  if (!$parent) {
    $parent = document
  }

  let $elems = $parent.querySelectorAll(selector)
  $elems.forEach(function($elem) {

    if ($elem.getAttribute('za1x') === "true") {
      return
    }

    let zcall = $elem.getAttribute('zcall')
    if (!zzb.types.isStringNotEmpty(zcall)) {
      zcall = 'click'
    }

    // Disallow zaction to be set twice on the the same element.
    // Optionally limit to when .zaction has a $parent parameter.
    //if (!$parent) {
    $elem.setAttribute('za1x', 'true')
    //}

    $elem.addEventListener(zcall, function(ev) {
      zzb.zaction.actionHandler(ev, unregisteredHandler, null)
    })
  })
}

_zaction.prototype.actionHandler = function(ev, unregisteredHandler, callback) {
  let zaction = zzb.zaction.newZAction(ev)
  if (!zaction.isValid()) {
    throw new Error('failed to create new zaction from event')
  }

  // Check if propagation and defaults should be stopped otherwise
  // individual handler zevents will handle any stopping of propagation/defaults
  zaction.forceStopPropDef()

  // If any unregistered or system handlers handles the action, then stop processing
  let isHandled = false

  // Try any unregistered handler first
  if (unregisteredHandler) {
    isHandled = unregisteredHandler(zaction, callback)
    if (isHandled === true) {
      return
    }
  }

  // Handle the running of any 3rd-party zactions. Doing so allows the 3rd
  // party to override any built-in event handler functions, such as for "za-*"
  let handlers = zzb.zaction.getHandlers()
  for (let ii = 0; ii < handlers.length; ii++) {
    isHandled = handlers[ii].run(zaction, callback)
    if (isHandled === true) {
      return
    }
  }

  if (zaction.isZUrl()) {
    zzb.zaction.handleZUrl(zaction, callback)
  }
  // else {
  //     switch (zaction.getOptions().zaction.event) {
  //         case '':
  //             break
  //         default:
  //             break
  //     }
  // }
}

function runZFormUpdate(zaction, rob) {
  if (!zaction || !rob) {
    return
  }
  if (rob.hasRecords() && zaction.getOptions().$data && zaction.getOptions().isForm && zaction.getOptions().$data.elements.length > 0) {
    try {
      for (const [key, value] of Object.entries(rob.first())) {
        const field = zaction.getOptions().$data.elements.namedItem(key)
        if (field !== undefined && zzb.types.isObject(field)) {
          field.value = value
        }
      }
    } catch(e) {
      console.log('failed runZFormUpdate', e)
    }
  }
}

_zaction.prototype.runZValidate = function(zaction, rob, hideOnly) {
  runZValidate(zaction, rob, hideOnly)
}

function runZValidate(zaction, rob, hideOnly) {
  if (!zaction || !zaction.canRunZVal()) {
    return
  }
  try {
    let hasAny = (rob && rob.listErrs && (rob.hasErrors() || rob.hasMessages))
    let $elems = zaction.getOptions().$data.querySelectorAll('.zval')
    $elems.forEach(function($elem) {
      let isInPlace = $elem.classList.contains('zval-in-place')
      if (isInPlace) {
        $elem.classList.remove('is-valid')
        $elem.classList.remove('is-invalid')
      } else {
        $elem.classList.add('d-none')
      }
      if (!hideOnly && rob) {
        // find the name of the element
        let zval = zzb.dom.getAttributes($elem, /^zval-/, 5)
        if (!zzb.types.isStringNotEmpty(zval.name)) {
          if (isInPlace) {
            zval.name = zzb.dom.getAttributeElse($elem, 'name')
          }
        }
        // Are there matching error or message fields in rob?
        // Why an array? Remember, there could be multiple error/messages returned for a single field name.
        let arrAny = []
        if (hasAny && zzb.types.isStringNotEmpty(zval.name)) {
          arrAny = rob.listErrs.getAnyByName(zval.name)
        }
        // Handle the results
        if (arrAny.length === 0) {
          if (isInPlace) {
            $elem.classList.add('is-valid')
          }
        } else {
          if (isInPlace) {
            $elem.classList.add('is-invalid')
          } else {
            let html = zzb.rob.renderList({targets: arrAny, format: 'html'})
            if (zzb.types.isStringNotEmpty(html)) {
              $elem.innerHTML = html
              $elem.classList.remove('d-none')
            }
          }
        }
      }
      return true
    })
  } catch(e) {
    console.log('failed runZValidate', e)
  }
}

// format = button1|button2|theme-name
function splitDlgTheme(target) {
  if (!zzb.types.isStringNotEmpty(target)) {
    return null
  }
  let ss = target.split('|')
  let dlgTheme = {
    type: zzb.dialogs.ZazzyDialog.TYPE_NONE
  }
  if (ss.length > 0) {
    if (zzb.types.isStringNotEmpty(ss[0])) {
      dlgTheme.button1 = {
        label: ss[0],
        ztrigger: ss[0].toLowerCase(),
        type: zzb.dialogs.ZazzyDialog.TYPE_SECONDARY
      }
    }
  }
  if (ss.length > 1) {
    if (zzb.types.isStringNotEmpty(ss[1])) {
      dlgTheme.button2 = {
        label: ss[1],
        ztrigger: ss[1].toLowerCase(),
        type: zzb.dialogs.ZazzyDialog.TYPE_PRIMARY
      }
    }
  }
  if (ss.length > 2) {
    if (zzb.types.isStringNotEmpty(ss[2])) {
      switch (ss[2]) {
        case 'default':
          break;
        default:
          dlgTheme.type = ss[2]
          if (dlgTheme.button2) {
            dlgTheme.button2.type = dlgTheme.type
          }
          break;
      }
    }
  }
  return dlgTheme
}

function splitDlgButton(target) {
  if (!zzb.types.isStringNotEmpty(target)) {
    return null
  }
  let ss = target.split('|')
  if (ss.length === 0) {
    return null
  }
  let but = {}
  if (ss.length > 0) {
    but.label = ss[0]
  }
  if (ss.length > 1) {
    but.type = ss[1]
  }
  if (ss.length > 2) {
    but.ztrigger = ss[2]
  }
  return but
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
function jsonEval(srcObj, zaction){
  let options = null
  if (zzb.types.isStringNotEmpty(srcObj)) {
    options = Function('"use strict";return (' + srcObj + ')')(zaction);
  }
  return zzb.types.merge({actionHandler: null, onAccept: null, buttons: null}, options)
}

function findZTriggerDialog($elem, jsSvr) {
  if (!$elem) {
    return null
  }

  let ztrigger = zzb.dom.getAttributeElse($elem, 'ztrigger')
  if (!ztrigger) {
    return null
  }

  let $trigger = $elem.closest('.modal-content').querySelector('.modal-body [ztrigger="' + ztrigger + '"]')
  if (!$trigger) {
    throw new Error('failed to locate modal ztrigger="' + ztrigger + '"')
  }

  let objZT = {
    altHandler: null,
    $trigger: $trigger
  }
  if (jsSvr && zzb.types.isObject(jsSvr.ztriggers)) {
    objZT.altHandler = jsSvr.ztriggers[ztrigger]
  }

  return objZT
}

function handleDialog(zaction, callback, results) {
  function handleActionResults(drr, err, $dialog) {
    if (err) {
      return
    }
    // console.log('ztrigger', drr, err)
    if (zzb.types.isStringNotEmpty(zaction.getOptions().zdlg.postSave)) {
      fnPostSave(zaction.getOptions().zdlg.postSave)
      // let ss = zaction.getOptions().zdlg.postSave.split(':')
      // if (ss.length === 2) {
      //   let $target = document.querySelector(ss[1])
      //   if ($target) {
      //     if ($target.getAttribute('za1x2') !== 'true') {
      //       $target.setAttribute('za1x2', 'true')
      //       $target.addEventListener('za-post-action', function(ev){
      //         zzb.zaction.actionHandler(ev, null, null)
      //       })
      //     }
      //     //console.log('ztrigger', ev.detail, err, zaction)
      //     let ev = new CustomEvent('za-post-action')
      //     ev.zaExtraHandler = 'za-post-action'
      //     $target.dispatchEvent(ev)
      //   }
      // }
    } else if (zaction.getOptions().hasLoopType) {
      runInjects(zaction.getOptions().arrInjects, drr.rob.first().dInjects)
      // Old method is not an array
      // zaction.getOptions().$inject.innerHTML = drr.rob.first().html
      // zzb.zaction.addEventListeners('.zaction', null, zaction.getOptions().$inject)
      // zzb.zaction.runZLoadActions(zaction.getOptions().$inject)
    }
    if ($dialog) {
      $dialog.close()
    }
  }

  results = zzb.types.merge({html: null, js: {title: null, altTitle: null, body: null, type: null, buttons: null, noHeaderCloseButton: false, focus: true, keyboard: true}}, (results) ? results : {})

  let dlgOptions = {
    title: '',
    body: '',
    onShow: function(ev) {

      let $elem = ev.target.querySelector('.modal-body')
      if (!$elem) {
        return
      }

      if (zzb.dom.getAttributeElse($elem, '_zdinit', '') === 'true') {
        return
      }

      let $buttons = ev.target.querySelectorAll('.modal-footer [ztrigger]')
      let allowedTriggers = []
      if ($buttons) {
        $buttons.forEach(function($button) {
          allowedTriggers.push($button.getAttribute('ztrigger'))
        })
      }

      // Load and init elements inside modal body
      zzb.zaction.loadZInputs($elem)
      if (zzb.zui) {
        zzb.zui.onElemInit($elem)
      }
      zzb.zaction.addEventListeners('.zaction', results.js.actionHandler, $elem)

      // Gather all triggers inside modal-body
      let $ztElems = $elem.querySelectorAll('[ztrigger]')
      let validBodyTriggers = []
      if ($ztElems) {
        $ztElems.forEach(function($ztElem) {
          let trigger = $ztElem.getAttribute('ztrigger')
          if (!allowedTriggers.includes(trigger)) {
            console.log('no match of ztrigger handler "', trigger + '"' )
          } else {
            // Assign loop-type info if needed
            if (zaction.getOptions().hasLoopType) {
              if (!zzb.types.isStringNotEmpty($ztElem.getAttribute('za-loop-type'))) {
                $ztElem.setAttribute('za-loop-type', zaction.getOptions().zaction.loopType)
                $ztElem.setAttribute('za-loop-inject-skip-inject', "false")
              }
            }
            $ztElem.addEventListener('ztrigger-dialog-button', function(ev){
              zzb.zaction.actionHandler(ev, ev.detail.altHandler, function(drr, err) {
                handleActionResults(drr, err, ev.detail.dialog)
              })
            })
          }
          validBodyTriggers.push(trigger)
        })
      }

      // Filter DOM buttons in modal-footer: keep only those with valid triggers or defaultSafeTrigger
      const defaultSafeTrigger = 'cancel'
      if ($buttons && $buttons.length > 0) {
        $buttons.forEach($btn => {
          const trig = $btn.getAttribute('ztrigger')?.toLowerCase()
          if (!trig) {
            console.warn('Button in footer is missing ztrigger, removing')
            $btn.remove()
            return
          }
          const isAllowed = (trig === defaultSafeTrigger) || validBodyTriggers.includes(trig)
          if (!isAllowed) {
            console.warn(`Removing modal-footer button with ztrigger="${trig}" – no matching .zaction`)
            $btn.remove()
          }
        })
      }

      zzb.dom.setAttribute($elem, '_zdinit', 'true')

      if ($elem.classList.contains('d-none')) {
        $elem.classList.remove('d-none')
      }
    },
    onShown: null,
    onHide: null,
    onHidden: null,
    buttons: [
      zzb.dialogs.ZazzyDialog.getButtonDefaults({
        type: zzb.dialogs.ZazzyDialog.TYPE_SECONDARY,
        label: 'Cancel',
        ztrigger: 'cancel',
        action: function (dialog, ev) {
          dialog.close()
        }
      }),
      zzb.dialogs.ZazzyDialog.getButtonDefaults({
        type: zzb.dialogs.ZazzyDialog.TYPE_PRIMARY,
        label: 'Ok',
        ztrigger: 'ok',
        action: function (dialog, ev) {
          if (zaction.getZEvent() === 'zurl-confirm') {
            zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
              handleActionResults(drr, err, dialog)
            })
          } else {
            let objZT = findZTriggerDialog(this)
            if (!objZT && !objZT.$trigger) {
              dialog.close()
            } else {
              objZT.$trigger.dispatchEvent(new CustomEvent('ztrigger-dialog-button', {detail: {dialog: dialog, evOriginal: ev, altHandler: objZT.altHandler}}))
            }
          }
        }
      })
    ]
  }

  dlgOptions.title = findDlgAjaxValue(zaction, results, 'title', 'altTitle', false)
  dlgOptions.body = findDlgAjaxValue(zaction, results, 'body', null, true)
  dlgOptions.type = findDlgAjaxValue(zaction, results, 'type', 'altType', false)
  dlgOptions.classBackdrop = findDlgAjaxValue(zaction, results, 'classBackdrop', 'altClassBackdrop', false)
  dlgOptions.classDialog = findDlgAjaxValue(zaction, results, 'class', 'altClass', false)
  dlgOptions.dataBackdrop = ''
  dlgOptions.classWidthMod = findDlgAjaxValue(zaction, results, 'classWidthMod', 'altClassWidthMod', false)
  dlgOptions.classFullscreenMod = findDlgAjaxValue(zaction, results, 'classFullscreenMod', 'altClassFullscreenMod', false)
  dlgOptions.isScrollable = findDlgAjaxValue(zaction, results, 'isScrollable', 'altIsScrollable', false) === 'true'
  dlgOptions.isFullscreen = findDlgAjaxValue(zaction, results, 'isFullscreen', 'altIsFullscreen', false) === 'true'
  dlgOptions.isNoFooter = findDlgAjaxValue(zaction, results, 'isNoFooter', 'altIsNoFooter', false) === 'true'
  dlgOptions.noHeaderCloseButton = (zaction.getOptions().zdlg.noHeaderCloseButton === 'true' || results.js.noHeaderCloseButton === true)
  dlgOptions.noFocus = (zaction.getOptions().zdlg.noFocus === 'true' || results.js.noFocus === true)
  dlgOptions.noKeyboard = (zaction.getOptions().zdlg.noKeyboard === 'true' || results.js.noKeyboard === true)

  let dlgTheme = null
  dlgTheme = findDlgAjaxValue(zaction, results, 'theme', 'altTheme', false)
  dlgTheme = (zzb.types.isStringNotEmpty(dlgTheme) ? splitDlgTheme(dlgTheme) : null)

  // The server can reply with its own set of buttons
  // but it may be easier to define overrides on the element.
  // See syntax for 'zdlg-buttons'
  if (zzb.types.isArrayHasRecords(results.js.buttons)) {
    dlgOptions.buttons = results.js.buttons

    // dialog themes
    if (dlgTheme) {
      if (dlgTheme.type && !zzb.types.isStringNotEmpty(dlgOptions.type)) {
        dlgOptions.type = dlgTheme.type
      }
      // The question is if we allow the client to override any server theme buttons?
      // Currently, no. Reason for having server buttons is to have a length !== 2.
      // Future use cases will help determine a better implementation.
    }
  } else {
    // dialog themes
    if (dlgTheme) {
      if (dlgTheme.type && !zzb.types.isStringNotEmpty(dlgOptions.type)) {
        dlgOptions.type = dlgTheme.type
      }
      function setButton(but, ii) {
        dlgOptions.buttons[ii].label = but.label
        dlgOptions.buttons[ii].ztrigger = but.ztrigger.toLowerCase()
        dlgOptions.buttons[ii].type = but.type
      }
      if (dlgTheme.button2) {
        setButton(dlgTheme.button2, 1)
      } else {
        dlgOptions.buttons.splice(1)
      }
      if (dlgTheme.button1) {
        setButton(dlgTheme.button1, 0)
      } else {
        dlgOptions.buttons.splice(0)
      }
    }

    // Individual button overrides
    let ovBut = zaction.getOptions().zdlg.buttons
    if (zzb.types.isStringNotEmpty(ovBut)) {
      ovBut = ovBut.split(';')
      if (ovBut.length !== dlgOptions.buttons.length) {
        console.log('zdlg-buttons definition does not match default options/theme')
      } else {
        for (let ii = 0; ii < dlgOptions.buttons.length; ii++) {
          let but = splitDlgButton(ovBut[ii])
          if (but) {
            if (zzb.types.isStringNotEmpty(but.label)) {
              dlgOptions.buttons[ii].label = but.label
            }
            if (zzb.types.isStringNotEmpty(but.type)) {
              dlgOptions.buttons[ii].type = but.type
            }
            if (zzb.types.isStringNotEmpty(but.ztrigger)) {
              dlgOptions.buttons[ii].ztrigger = but.ztrigger
            }
          }
        }
      }
    }
  }
  zzb.dialogs.showMessage(dlgOptions)
}

function findDlgAjaxValue(zaction, results, key, altKey, isHtmlBody) {
  let value = ''
  let hasZActionDlg = zzb.types.isObject(zaction.getOptions().zdlg)
  if (zzb.types.isStringNotEmpty(key)) {
    if (hasZActionDlg) {
      value = zaction.getOptions().zdlg[key]
      if (zzb.types.isStringNotEmpty(value)) {
        return value
      }
    }
    if (results) {
      if (isHtmlBody) {
        if (zzb.types.isStringNotEmpty(results.html)) {
          return results.html
        }
      }
      if (results.js) {
        if (zzb.types.isStringNotEmpty(results.js[key])) {
          return results.js[key]
        }
      }
    }
  }
  if (hasZActionDlg && zzb.types.isStringNotEmpty(altKey)) {
    value = zaction.getOptions().zdlg[altKey]
    if (zzb.types.isStringNotEmpty(value)) {
      return value
    }
  }
  return ''
}

function handleZUrlDialog(zaction, callback) {
  zaction.forceStopPropDef(true)
  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }

    let results = drr.rob.first()
    results.js = jsonEval(results.js, zaction)

    handleDialog(zaction, callback, results)
  })
}

function handleZUrlConfirm(zaction, callback) {
  zaction.forceStopPropDef(true)
  handleDialog(zaction, callback, null)
}

function runInjects(arrInjects, dInjects) {
  if (arrInjects && dInjects) {
    if (zzb.types.isArray(dInjects)) {
      if (dInjects.length !== arrInjects.length) {
        console.log('inject partial success; arrInjects (len=' + arrInjects.length + ') is less than the number of dInjects (len=' + dInjects.length + ') returned')
      }
      function doInject($inject, dInject, placement) {

        // example for jsonEval
        // let results = drr.rob.first()
        // console.log(results)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
        // function jsonEval(obj) {
        //     return Function('"use strict";return (' + obj + ')')();
        // }
        //
        // results.js = jsonEval(results.js)

        // Should not be applicable here on direct $injects since they use existing zaction system
        // but jsonEval is used for creating dialog from server. If we do a jsonEval here, we may
        // need to transform it for custom action handler situation.
        //results.js = jsonEval(results.js, zaction)

        if (placement === 'outer') {
          $inject.outerHTML = dInject.html
        } else {
          $inject.innerHTML = dInject.html
        }
        if (zzb.zui) {
          zzb.zui.onElemInit($inject)
        }
        zzb.zaction.addEventListeners('.zaction', null, $inject)
        zzb.zaction.runZLoadActions($inject)
      }
      if (dInjects.length === 1) {
        doInject(arrInjects[0].$elem, dInjects[0])
      } else {
        for (let tt = 0; tt < dInjects.length; tt++) {
          if (tt < arrInjects.length) {
            for (let vv = 0; vv < arrInjects.length; vv++) {
              if (arrInjects[vv].label === dInjects[tt].label) {
                doInject(arrInjects[vv].$elem, dInjects[tt], arrInjects[vv].placement)
                break
              }
            }
          }
        }
      }
    }
  }
}

function handleZUrlReplace(zaction, callback) {
  zaction.forceStopPropDef(true)
  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }

    if (zaction.getOptions().arrInjects) {
      runInjects(zaction.getOptions().arrInjects, drr.rob.first().dInjects)
    }

    callback && callback(drr, null)
  })
}

// handleZUrlSearch is a version of handleZUrlAction that submits a form
// and handles injects. It can be used with ZazzyInterval, including smart search-caching.
function handleZUrlSearch(zaction, callback) {
  zaction.forceStopPropDef(true)
  const myInterval = zzb.time.getInterval(zaction.getOptions().zinterval.id)
  if (myInterval) {
    myInterval.clear()
  }
  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }
    if (drr && drr.rob) {
      if (!drr.rob.hasRecords()) {
        callback && callback(drr, null)
      }
      zaction.runInjects(drr)
    }
    if (myInterval) {
      myInterval.new()
    }
    callback && callback(drr, true)
  })
}

function handleZUrlAction(zaction, callback, doFormUpdate) {
  zaction.forceStopPropDef(true)
  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }

    if (drr && drr.rob) {
      runZValidate(zaction, drr.rob)
      if (drr.rob.hasErrors()) {
        callback && callback(null, new Error('validate has errors'))
        return
      }
      if (doFormUpdate === true) {
        runZFormUpdate(zaction, drr.rob)
      }
      if (zaction.getOptions().arrInjects && drr.rob.hasRecords() && drr.rob.first().dInjects) {
        runInjects(zaction.getOptions().arrInjects, drr.rob.first().dInjects)
      }
      let zref = zaction.getOptions().zref
      if (zref && zzb.types.isStringNotEmpty(zref.zinputPtr)) {
        zzb.zaction.loadZInputs(document.getElementById(zref.zinputPtr))
      }
      let za = zaction.getOptions().zaction
      if (za && zzb.types.isStringNotEmpty(za.postSave)) {
        fnPostSave(za.postSave)
      }
    }

    callback && callback(drr, null)
  })
}

const fnPostSave = function(zaSelector) {
  if (zaSelector && zzb.types.isStringNotEmpty(zaSelector)) {
    let ss = zaSelector.split(':')
    if (ss.length === 2) {
      let $target = document.querySelector(ss[1])
      if ($target) {
        if ($target.getAttribute('za1x2') !== 'true') {
          $target.setAttribute('za1x2', 'true')
          $target.addEventListener('za-post-action', function(ev){
            zzb.zaction.actionHandler(ev, null, null)
          })
        }
        //console.log('ztrigger', ev.detail, err, zaction)
        let ev = new CustomEvent('za-post-action')
        ev.zaExtraHandler = 'za-post-action'
        $target.dispatchEvent(ev)
      }
    }
  }
}

function handleZUrlBlobDownload(zaction, callback) {
  zaction.forceStopPropDef(true)

  if (!zzb.types.isStringNotEmpty(zaction.getOptions().zaction.expectType)) {
    zaction.getOptions().zaction.expectType = 'blob'
  }

  zaction.runAJAX(zaction.buildAJAXOptions(), function(drr, err) {
    if (err) {
      if (callback) {
        callback(null, err)
      }
      return
    }

    if (drr.data) {
      if (!zzb.types.isStringNotEmpty(zaction.getOptions().zaction.blobType)) {
        zaction.getOptions().zaction.blobType = 'application/octet-stream'
      }

      if (!zzb.types.isStringNotEmpty(zaction.getOptions().zaction.blobName)) {
        zaction.getOptions().zaction.blobName = 'my-file'
      }

      // const blob = new Blob([drr.first()], { type: zaction.getOptions().zaction.blobType });
      const downloadUrl = URL.createObjectURL(drr.data);
      const a = document.createElement("a");
      a.classList.add('d-none')
      a.href = downloadUrl;
      a.download = zaction.getOptions().zaction.blobName;
      document.body.appendChild(a);
      a.click();
    }

    callback && callback(drr, null)
  })
}

_zaction.prototype.handleZUrl = function(zaction, callback) {

  if (!zzb.types.isStringNotEmpty(zaction.getOptions().zurl)) {
    throw new Error('zurl not defined: tried zurl, href, action and src')
  }

  let isHandled = false
  switch (zaction.getOptions().zaction.event) {
    case 'zurl-dialog':
      handleZUrlDialog(zaction, callback)
      isHandled = true
      break
    case 'zurl-confirm': // show a confirmation dialog prior to running an action
      handleZUrlConfirm(zaction, callback)
      isHandled = true
      break
    case 'zurl-replace':
      handleZUrlReplace(zaction, callback)
      isHandled = true
      break
    case 'zurl-search':
      handleZUrlSearch(zaction, callback)
      isHandled = true
      break
    case 'zurl-action':
      handleZUrlAction(zaction, callback)
      isHandled = true
      break
    case 'zurl-field-update':
      handleZUrlAction(zaction, callback, true)
      isHandled = true
      break
    case 'zurl-blob-download':
      handleZUrlBlobDownload(zaction, callback)
      isHandled = true
      break
    case 'zurl-nav-tab':
      zaction.forceStopPropDef(true)
      if (zaction.isZUrl()) {
        isHandled = true
        let url = zaction.getOptions().zurl
        if (!(url.startsWith('http://') || url.startsWith('https://'))) {
          if (!url.startsWith('/')) {
            url = '/' + url
          }
          url = window.location.origin + url
        }
        window.open(url, '_blank');
      }
      callback && callback(null, null)
      break
    case 'zurl-nav-self':
    default:
      zaction.forceStopPropDef(true)
      if (zaction.isZUrl()) {
        isHandled = true
        window.location.href = zaction.getOptions().zurl
      }
      callback && callback(null, null)
      break
  }
  return isHandled
}

_zaction.prototype.runZLoadActions = function($parent) {
  if (!$parent) {
    $parent = document
  }
  let $elems = $parent.querySelectorAll('.zload-action')
  if ($elems && $elems.length > 0){
    $elems.forEach(function($elem) {

      $elem.addEventListener('zload-action', function(ev){
        zzb.zaction.actionHandler(ev, null, null)
      })

      $elem.dispatchEvent(new CustomEvent('zload-action'))
    })
  }
  zzb.zaction.loadZInputs($parent)
  if ($parent.tagName && zzb.types.isStringNotEmpty($parent.tagName)) {
    const $autoF = $parent.querySelector('.zui-autofocus')
    if ($autoF && zzb.types.isObject($autoF)) {
      $autoF.focus()
    }
  }
  $parent.querySelectorAll('.zzb-zui-navtab-buttons').forEach(function ($btns) {
    $btns.querySelectorAll('button').forEach(function ($elem) {
      const tabTrigger = new bootstrap.Tab($elem)
      $elem.addEventListener('click', function(ev) {
        ev.preventDefault()

        if ($elem.getAttribute('za1x') === "true") {
          // console.log('tab-za1x')
          tabTrigger.show()
          return
        }

        let zevent = $elem.getAttribute('za-event')
        if (!zzb.types.isStringNotEmpty(zevent)) {
          // console.log('tab-no-za-event')
          tabTrigger.show()
          return
        }

        $elem.setAttribute('za1x', 'true')

        zzb.zaction.actionHandler(ev, null, function(drr, err) {
          if (!err) {
            // console.log('tab-click!')
            tabTrigger.show()
          }
        })
      })
    })
  })
}

const cacheZInputs = {}

_zaction.prototype.loadZInputs = function($parent) {
  if (!$parent) {
    $parent = document
  }

  if ($parent.tagName && $parent.classList.contains('zinput')) {
    zzb.zaction.detectFieldChanges($parent)
  } else {
    const $elems = $parent.querySelectorAll('.zinput')
    if ($elems && $elems.length > 0) {
      $elems.forEach(zzb.zaction.detectFieldChanges)
    }
  }
}

_zaction.prototype.detectFieldChanges = function($elem) {
  const fnToggle = function ($toggler, useDisabled, noChange) {
    if (noChange) {
      useDisabled ? $toggler.disabled = true : $toggler.classList.add('d-none')
    } else {
      useDisabled ? $toggler.disabled = false : $toggler.classList.remove('d-none')
    }
  }

  const fnUpdateToggler = function(id, $toggler, useDisabled) {
    let noChange = true
    for (const [key, value] of Object.entries(cacheZInputs[id].changes)) {
      if (value === false) {
        noChange = false
      }
    }
    fnToggle($toggler, useDisabled, noChange)
  }

  const fnFindFieldType = function($field) {
    let fldType = $field.getAttribute('type')
    return fldType ? fldType.toLowerCase() : $field.tagName.toLowerCase()
  }

  let id = $elem.getAttribute('id')
  if (!zzb.types.isStringNotEmpty(id)) {
    id = zzb.uuid.newV4().replace(/-/g, '')
    $elem.setAttribute('id', id)
  }

  let $toggler = document.getElementById($elem.getAttribute('ztoggler'))
  if (zzb.types.isObject($toggler)) {
    $toggler.setAttribute('zref-zinput-ptr', id)
    const useDisabled = $toggler.getAttribute('ztoggler-display') === 'disabled'
    fnToggle($toggler, useDisabled, true)

    cacheZInputs[id] = { originals: {}, changes: {} }

    const $fields = $elem.querySelectorAll('.zinput-field')
    $fields.forEach(function($field) {
      const fldName = $field.getAttribute('name')
      if (!zzb.types.isStringNotEmpty(fldName)) return

      const fldType = fnFindFieldType($field)
      cacheZInputs[id].originals[fldName] = (fldType === 'checkbox' || fldType === 'radio')
        ? $field.checked + ''
        : $field.value

      const zInputEvent = $field.getAttribute('zinput-event') || 'input'
      const handler = function (e) {
        const isEqual = (fldType === 'checkbox' || fldType === 'radio')
          ? cacheZInputs[id].originals[fldName] === this.checked + ''
          : cacheZInputs[id].originals[fldName] === this.value

        cacheZInputs[id].changes[fldName] = isEqual
        fnUpdateToggler(id, $toggler, useDisabled)
      }

      $field.addEventListener(zInputEvent, handler)
    })
  }
}


/**
 * DOMContentLoaded bootstrap for initializing Zazzy ZAction and ZUI.
 *
 * This listener is triggered once the DOM is fully parsed and ready.
 * It defines a `bootstrap()` function that sets up `.zaction` handlers
 * and invokes `zzb.zui.onZUIReady()` for core UI logic.
 *
 * To customize the startup flow (e.g. register custom handlers or delay
 * initialization), define a global `window.zzbReady(bootstrap)` function
 * on your page *before* this library is loaded. That function will receive
 * the `bootstrap` callback and can perform pre-initialization work before
 * finally invoking `bootstrap()` manually.
 *
 * Example use:
 * ```html
 * <script>
 *   window.zzbReady = function (bootstrap) {
 *     zzb.zaction.registerHandler({ id: 'vedDispatch', handler: handleCustom });
 *     zzb.zui.onZLoadSection(null, true); // optional custom load logic
 *     bootstrap(); // complete the standard setup
 *   };
 * </script>
 * <script src="/dist/zzb.ui.js"></script>
 * ```
 */
document.addEventListener('DOMContentLoaded', function () {
  const bootstrap = () => {
    if (zzb.zaction && zzb.zaction.addEventListeners) {
      zzb.zaction.addEventListeners('.zaction');
      zzb.zaction.runZLoadActions();
    }

    if (zzb.zui && typeof zzb.zui.onZUIReady === 'function') {
      zzb.zui.onZUIReady();
    }
  };

  if (typeof window.zzbReady === 'function') {
    try {
      window.zzbReady(bootstrap);
    } catch (e) {
      console.warn('zzbReady() threw error; falling back to default bootstrap.', e);
      bootstrap();
    }
  } else {
    bootstrap();
  }
}, false); // Always use `false` for bubble-phase listening

exports.zaction = _zaction