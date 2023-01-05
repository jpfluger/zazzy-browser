// ---------------------------------------------------
// _zaction
// ---------------------------------------------------

/*
Usage:
    1. Add 'zaction' to an element class to add event listeners.
       * This happens on load prior to HTML display or when new content added after.
       * Add 'no-autoload-zactions' to the body class to disable initializing zaction prior to HTML display.
    2. Add 'zload-action' to load content prior to HTML display

On the element itself:
    * `zclosest`: Navigate up the DOM to the designated element, merging in zui attributes on it. Existing zui attributes are not replaced.
    * `zcall`: Specify the DOM event. Defaults to `click` but available are what your handler specifies, such as click, mousedown, mouseup, change.

    * `zurl`: The url to send data to the server. If the path contains a reserved name (see variable `reservePH` for a list), these are replaced with their respective actions.
              Reserved placeholder list includes [':event', ':mod', ":zid", ':zidParent']. These are optional to include in zurl.
              Valid zurls are:
              * https://example.com/path/to/page
              * https://example.com/:event/:zid/:mod
              * https://example.com/path/to/page/:zidParent
              * https://example.com/path/to/pdfs/:zid/:blobName

    * `za-event`: The event to fire inside the local event handler.
                  If data is sent to the server, it is part of zaction.event.
                  Note sometimes events run that don't send data to the server (eg drag-drop).
                  Built-in events:
                  * zurl-dialog
                  * zurl-confirm // show a confirmation dialog prior to running an action
                  * zurl-replace
                  * zurl-action
                  * zurl-field-update // updates fields using json key-values
                  * zurl-blob-download
                  * zurl-nav-tab
                  * zurl-nav-self
    * `za-mod`: If used, it is sent to the server as zaction.mod (eg 'delete', 'create', 'edit', 'paginate').
    * `za-method`: The type of call to initiate with the server. Available: `getJSON`, `postJSON`. Default is `postJSON`.

    * `za-zid`: The id of an element. Optional. If used, it is sent to the server as zaction.zid.
    * `za-zid-parent`: The parent-id of an element. Optional. If used, it is sent to the server as zaction.zidParent.

    * `za-page-on`: When pagination is active, it is sent to the server as zaction.pageOn.
    * `za-page-limit`: When pagination is active, it is the number of records to show on a page.
    * `za-ignore-zurl`:  If 'true', the url is ignored but other properties are initialized.
    * `za-do-zval`:  When placed on an element (eg button for submit), results will be sent through the zval processor.

    * `za-loop-type`: If used, it is sent to the server as zaction.loopType.
    * `za-loop-inject-skip-inject`: If set to 'true' and a loopType has not been identified, forces skipping injecting html even when an inject is identified.

    * `za-data`: The data selector in the format of "label.type : id | class". The first period (".") is the label separator and the colon (":") separates the type selector.
                 * Label is optional but required when selecting multiple elements that require html injection from server ajax results.
                 * The selector has the reserved words 'none | selector | closest | self'.
                   * 'none': skips all selectors completely for the element and any ancestors.
                   * 'self': returns the current element.
                   * 'closest': selects the closest element.
                   * 'selector': selects the element, usually based on id ('#id") or class ('.class).
                 If the selected element is of type Form, a new FormData object is auto-created.
                 If the zurl, zid and zidParent are not already detected, the data element is inspected for these attributes after the zclosest hierarchy has been completed.
                 Examples.
                     za-data="none" --> IGNORE zdata for entire life of zaction.
                     za-data="self" | "self:"
                     za-data="label.selector:criteria"
                     za-data="label.closest:criteria"
                     za-data="label.selector@inner:criteria" // innerHTML. 'inner' is the default.
                     za-data="label.closest@outer:criteria" // outerHTML

    * `za-inject`: The element targeted for injection by the results of an action in a format similar to za-data.
    * `za-post-save`: The elements targeted to invoke after a normal zaction, if no errors.
                      It is similar to `zdlg-post-save` but the latter is attached to a dialog footer button whereas `za-post-save` is not.

    * `zinput`: The element having this class will have its data-state checked for any changes and, if any, then `ztoggler` gets fired.
    * `zinput-event`: Default is `input`. For example, specify `change` for a change event.
    * `zinput-field`: An `input`, `select` or `textarea` that should get an input handler. For textarea, set `zinput-event` to `change`.
    * `ztoggler`: An attribute on an element having class `zinput`.
                  It points to the id of the element that should be toggled should any changes happen to child elements having class `zinput-field`.
                  These are elements that have the `input` event fired.
    * `ztoggler-display`: `disabled` or `none`. Default is `none`. If none, the target ztoggler element will not show unless there is a data-state change.
    * `zref-zinput-ptr`: The `zinput` loader will auto-place this on the `ztoggler` element as a reference back to the `zinput` parent.
                          It is required for post-zaction functionality.

    * `za-dlg`: The selector to the element having dlg attributes in a format similar to za-data.
      * zdlg-post-save="selector" // See `za-post-save`. The version for zdlg is attached to a dialog button.
      * zdlg-title="Dialog Title" // Force this title all the title, even if the server sends a title to use.
      * zdlg-alt-title="Alternative Title" // Use this title when the server does not send a title.
      * zdlg-body="Do you want to save?" // Evaluation order is zaction.getOptions().zdlg.body (from element), results.html (from server), results.js.body (or optionally from server if results.html is empty)
      * zdlg-noHeaderCloseButton="false | true" // if 'true', the close button on the header will be hidden.
      * zdlg-type="default | none | primary | secondary | success | danger | warning| info| light | dark | link"
        * This sets the theme for the entire dialog but not the buttons, which are set by 'zdlg-theme' or 'zdlg-buttons'.
      * zdlg-alt-type="default | none | primary | secondary | success | danger | warning| info| light | dark | link" // Use the alternate type when the server does not send a theme.
      * zdlg-theme="Cancel|Save|default" // A quick way to create buttons and set the type. Use zdlg-buttons for further customization.
      * zdlg-alt-theme="Cancel|Save|default" // Use the alternate theme when the server does not send a theme.
      * zdlg-buttons='LABEL|THEME|ZTRIGGER;LABEL|THEME|ZTRIGGER'
        * The ';' separates buttons.
      * zdlg-class-backdrop="class2 class3" // Add classes to the backdrop of a .modal-dialog. The backdrop class is already "fullscreen".
      * zdlg-alt-class-backdrop="class2 class3" // Add classes to the backdrop of a .modal-dialog. The backdrop class is already "fullscreen".
      * zdlg-class="modal-fullscreen class2 class3" // Add classes to a .modal-dialog.
      * zdlg-alt-class="modal-fullscreen class2 class3" // Add classes to a .modal-dialog.
      * zdlg-class-width-mod="sm | lg | xl" // Adds optional size to dialog width, even if the server sends data to use.
      * zdlg-alt-class-width-mod="sm | lg | xl" // Use this when server does not send data.
      * zdlg-class-fullscreen-mod="sm | md | lg | xl | xxl" // Adds optional fullscreen down-sizing width, even if the server sends data to use.
      * zdlg-alt-class-fullscreen-mod="sm | md | lg | xl | xxl" // Use this when server does not send data.
      * zdlg-is-scrollable="true | false" // Adds scrollbars to dialog, even if the server sends data to use.
      * zdlg-alt-is-scrollable="true | false" // Use this when server does not send data.
      * zdlg-is-fullscreen="true | false" // Adds fullscreen to dialog, even if the server sends data to use. Optionally use in conjunction with `zdlg-class-fullscreen-mod .
      * zdlg-alt-is-fullscreen="true | false" // Use this when server does not send data.
      * zdlg-is-no-footer="true | false" // Hides the footer completely, even if the server sends data to use.
      * zdlg-alt-is-no-footer="true | false" // Use this when server does not send data.

    REMOVED: DOM Manipulation (this was tucked inside handleZUrlAction)
    * `za-post-inject-action`:  Optional action to run after injection. Current supported is 'delete' inside handleZUrlAction.
 */

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

_zaction.prototype.registerHandler = function(options) {
  zzb.setHandler(new ZActionHandler(options))
}

_zaction.prototype.getHandlers = function() {
  return this.handlers
}

_zaction.prototype.getHandler = function(id) {
  if (!id) {
    return
  }
  this.handlers.forEach(function(handler) {
    if (handler.getId() === id) {
      return handler
    }
  })
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

function findSelectorTargets($elem, bundle) {
  if (!$elem) {
    return null
  }
  if (!zzb.types.isStringNotEmpty(bundle)) {
    return null
  }
  let arr = []
  let ssTargets = bundle.split(',')
  for (let mm = 0; mm < ssTargets.length; mm++) {

    let bundle = ssTargets[mm]

    switch (bundle) {
      case 'self':
        arr.push({label: 'self', $elem: $elem})
        break
      case 'self:':
        arr.push({label: 'self', $elem: $elem})
        break
      case 'none':
        return 'none'
      case 'none:':
        return 'none'
      default:
        // parse
        // label.selector:#id
        // label.selector@placement:#id
        let split = [ bundle.substring(0, bundle.indexOf(':')), bundle.substring(bundle.indexOf(':') + 1) ]
        if (split.length === 2) {
          if (!zzb.types.isStringNotEmpty(split[1])) {
            return null
          }

          let label = null
          if (split[0].indexOf('.') > 1) {
            // label.selector#placement
            label = split[0].slice(0, split[0].indexOf('.'))
            split[0] = split[0].slice(split[0].indexOf('.') + 1)
          }

          let placement = 'inner'
          let mySelector = split[0]
          if (split[0].indexOf('@') > 1) {
            // label.selector#placement
            mySelector = split[0].slice(0, split[0].indexOf('@'))
            placement = split[0].slice(split[0].indexOf('@') + 1)
          }

          let $target = null
          if (mySelector === 'selector' || mySelector === 's') {
            $target = document.querySelector(split[1])
          } else if (mySelector === 'closest' || mySelector === 'c') {
            $target = $elem.closest(split[1])
          } else if (mySelector === 'child' || mySelector === 'h') {
            $target = $elem.querySelector(split[1])
          }

          if (!(placement === 'inner' || placement === 'outer')) {
            console.log('unknown placement param inside inject; defaulting to "inner"', split)
            placement = 'inner'
          }

          if ($target) {
            arr.push({label: label, $elem: $target, placement: placement})
          }
        }
    }
  }

  return arr
}

function buildZClosest($elem, obj, isFirstZAction, zaExtraHandler) {
  let isNew = false
  if (!obj) {
    isNew = true
    obj = {zaction:{method:null},zdata:{},zdlg:{tryDialog: false},zurl:null,$data:null,arrInjects:null,zref:{}}
  }
  if (!$elem) {
    return null
  }

  // Apply 'obj.zaction' over the top of the newest found attributes, since 'obj.zaction' overrides these.
  obj.zaction = zzb.types.merge(zzb.dom.getAttributes($elem, /^za-/, 3), obj.zaction)

  // zdata elements are the full hierarchy, from element to zclosest ancestors.
  obj.zdata = zzb.types.merge(zzb.dom.getAttributes($elem, /^zd-/, 3), obj.zdata)

  if (!obj.forceIgnoreZUrl) {
    if (isNew || isFirstZAction) {
      obj.forceIgnoreZUrl = obj.zaction.ignoreZurl === 'true'
    }
    if (!obj.forceIgnoreZUrl && !obj.zurl) {
      obj.zurl = findZUrlByAttribute($elem, true)
    }
  }

  if (!obj.forceIgnoreZData) {
    if (!obj.$data) {
      if (zzb.types.isStringNotEmpty(obj.zaction.data)) {
        let arrData = findSelectorTargets($elem, obj.zaction.data)
        if (arrData && arrData[0].$elem) {
          obj.$data = arrData[0].$elem
          obj.forceIgnoreZData = (obj.$data === 'none')
          if (obj.forceIgnoreZData) {
            obj.$data = null
            obj.formData = null
          } else {
            if (obj.$data.nodeName.toLowerCase() === 'form') {
              obj.isForm = true
              obj.formData = new FormData(obj.$data)
            }
            // Wait until the full zclosest hierarchy is completed and if
            // the following aren't found, then try with the data
            // = zurl, zid, zidParent
          }
        }
      }
    }
  }

  // The element itself can have dlg attributes and may also reference another element via 'za-dlg'.
  if (isNew || isFirstZAction) {
    obj.zref = zzb.types.merge(zzb.dom.getAttributes($elem, /^zref-/, 5), obj.zref)
    obj.zdlg = zzb.types.merge(zzb.dom.getAttributes($elem, /^zdlg-/, 5), obj.zdlg)
    // Look for any referenced dlg attributes indicated by the `za-dlg` attribute.
    if (zzb.types.isStringNotEmpty(obj.zaction.dlg)) {
      let arrDlg = findSelectorTargets($elem, obj.zaction.dlg)
      if (arrDlg && arrDlg[0].$elem) {
        obj.zdlg = zzb.types.merge(zzb.dom.getAttributes(arrDlg[0].$elem, /^zdlg-/, 5), obj.zdlg)
        // Dlgs are special cases since they disrupt the normal "zclosest" flow from child to parent.
        // With a dlg in play, it needs a change for the element to use its values, if present and if not
        // having been already defined on $elem.
        obj.zaction = zzb.types.merge(zzb.dom.getAttributes(arrDlg[0].$elem, /^za-/, 3), obj.zaction)
        // Also grab the zurl, if available, since it corresponds directly to the dialog. There is the potential
        // the $elem has on "override" in effect.
        if (!obj.zurl) {
          obj.zurl = findZUrlByAttribute(arrDlg[0].$elem, true)
        }
      }
    }
  }

  if (!obj.forceIgnoreZInject) {
    if (!obj.arrInjects) {
      if (zzb.types.isStringNotEmpty(obj.zaction.inject)) {
        obj.arrInjects = findSelectorTargets($elem, obj.zaction.inject)
        if (obj.arrInjects) {
          obj.forceIgnoreZInject = (obj.arrInjects === 'none')
          if (obj.forceIgnoreZInject) {
            obj.arrInjects = null
          }
        }
      }
    }
  }

  let notOnZaction = (isNew && !$elem.classList.contains('zaction'))
  if (isNew && zaExtraHandler === 'za-post-action') {
    notOnZaction = false
  }
  if (notOnZaction) {
    // root $elem must begin with a zaction
    obj = buildZClosest($elem.closest('.zaction'), obj, notOnZaction, zaExtraHandler)
  } else {
    // a: zclosest=div.navigate  --> div.navigate: zclosest=form --> form-info
    let closest = zzb.dom.getAttributeElse($elem, 'zclosest', null)
    if (closest) {
      let $target = $elem.closest(closest)
      if ($target) {
        obj = buildZClosest($target, obj)
      }
    }
  }

  return obj
}

_zaction.prototype.newZAction = function(ev) {
  if (!ev || !ev.target) {
    return {isValid: false}
  }

  let myZA = {
    isValid: true,
    ev: ev,
    zcall: ev.target.getAttribute('zcall'), // click, mousedown, mouseup, change
    _options: null,
    _runAJAX: null, // function
    isMouseDown: function() {
      return this.zcall === 'mousedown'
    },
    forceStopPropDef: function(doForce) {
      if (doForce || (ev.target.getAttribute('force-stop-prop-def') === "true")) {
        this.ev.preventDefault()
        this.ev.stopPropagation()
        return true
      }
      return false
    },
    getZEvent: function() {
      if (!this._options) {
        this.getOptions()
      }
      return this._options.zaction.event
    },
    hasZEvent: function() {
      return zzb.types.isStringNotEmpty(this.getZEvent())
    },
    isZUrl: function() {
      if (!this._options) {
        this.getOptions()
      }
      return zzb.types.isStringNotEmpty(this._options.zurl)
    },
    canRunZVal: function() {
      this.getOptions()
      return (this._options && this._options.$data && this._options.zaction.doZval === "true")
      // return (this._options && this._options.isForm && this._options.$data && this._options.zaction.val === "true")
    },
    runAJAX: function(options, callback) {
      // Ensure this._options has been created
      this.getOptions()

      if (!options || !this._runAJAX) {
        callback && callback(null, new Error('_runAJAX not defined'))
      } else {
        this._runAJAX(options, callback)
      }
    },
    buildAJAXOptions: function() {
      // Ensure this._options has been created
      this.getOptions()
      // Create the options bundle for the ajax call
      let ajaxOptions = {
        url: this._options.zurl
      }
      if (this._hasBody === true) {
        ajaxOptions.body = {}
        if (!this._options.forceIgnoreZData) {
          if (this._options.isForm) {
            ajaxOptions.body = zzb.types.merge(serialize(this._options.formData, this._options.$data), ajaxOptions.body)
            ajaxOptions.body = zzb.types.merge(this._options.zdata, ajaxOptions.body)
            ajaxOptions.body = objToTree(ajaxOptions.body)
            // Forms can internally have data that may override that in zaction: zid, zidParent, pageLimit, pageOn.
            // We "could" check if formData.pageLimit has a value and then replace that of zaction.pageLimit
            // but if we do this, then where do the "exceptions" end? Instead, let the server handle new pageLimit requests
            // to create new zaction.pageLimits.
            // ajaxOptions.body.data.zaction.pageLimit = ajaxOptions.body.dat
          }
        }
        ajaxOptions.body.zaction = this._options.zaction
      }

      if (zzb.types.isStringNotEmpty(this._options.zaction.expectType)) {
        ajaxOptions.expectType = this._options.zaction.expectType
      }

      return ajaxOptions
    },
    getOptions: function() {
      if (this._options) {
        return this._options
      }

      this._options = buildZClosest(this.ev.target, null, null, this.ev.zaExtraHandler)

      if (!this._options.forceIgnoreZData) {
        if (this._options.$data) {
          if (!this._options.zaction.zid) {
            this._options.zaction.zid = zzb.dom.getAttributeElse(this._options.$data, 'za-zid', null)
          }
          if (!this._options.zaction.zidParent) {
            this._options.zaction.zidParent = zzb.dom.getAttributeElse(this._options.$data, 'za-zid-parent', null)
          }
          if (!this._options.zurl) {
            this._options.zurl = findZUrlByAttribute(this._options.$data, true)
          }
        }
      }

      // Wait until full hierarchy is completed
      if (!zzb.types.isStringNotEmpty(this._options.zaction.loopType)) {
        this._options.loopType = null
      } else {
        if (!this._options.forceIgnoreZInject) {
          if (this._options.arrInjects) {
            if (this._options.zaction.loopInjectSkipInject === "true") {
              console.log(new Error('skipping za-loop-type "' + this._options.zaction.loopType + '": no arrInjects identified'))
              this._options.zaction.loopType = null
            } else {
              this._options.hasLoopType = true
            }
          }
        }
      }

      if (!zzb.types.isStringNotEmpty(this._options.zaction.method)) {
        this._options.zaction.method = 'postJSON'
      }

      // assign method
      switch (this._options.method) {
        case 'getJSON':
          this._hasBody = false
          this._runAJAX = zzb.ajax.getJSON
          break
        default:
          this._hasBody = true
          this._runAJAX = zzb.ajax.postJSON
          break
      }

      // transition from string to boolean
      if (this._options.zdlg) {
        this._options.zdlg.tryDialog = Object.keys(this._options.zdlg).length > 0
      }

      if (!this._options.forceIgnoreZUrl) {
        let zurl = this._options.zurl
        if (!zzb.types.isStringNotEmpty(zurl)) {
          // Log it but don't throw an error. There is a chance the calling program is using the zurl system
          // for other purposes, such as to retrieve arrInjects, $formdata, zid or zidParent values.
          console.log('cannot determine zurl')
          this._options.zurl = null
        } else {
          for (let ii = 0; ii < reservePH.length; ii++) {
            if (zurl.indexOf(reservePH[ii]) > -1) {
              let keyNoColon = reservePH[ii].replace(':', '')
              if (zzb.types.isStringNotEmpty(this._options.zaction[keyNoColon])) {
                zurl = zurl.replace(reservePH[ii], this._options.zaction[keyNoColon])
              } else {
                throw new Error("reserve placeholder '" + reservePH[ii] + "' not found in zurl '" + zurl + "'")
              }
            }
          }
          this._options.zurl = zurl
        }
      }

      this._options.zaction.pageOn = zzb.strings.parseIntOrZero(this._options.zaction.pageOn)
      this._options.zaction.pageLimit = zzb.strings.parseIntOrZero(this._options.zaction.pageLimit)

      return this._options
    }
  }

  if (!myZA.hasZEvent()) {
    return {isValid: false}
  }

  return myZA
}

let reservePH = [':event', ':mod', ":zid", ':zidParent', ':blobName']

function findZUrlByAttribute($elem, returnNull) {
  if (!$elem) {
    return (returnNull ? null : '')
  }
  let zurl = $elem.getAttribute('zurl')
  if (!zzb.types.isStringNotEmpty(zurl)) {
    zurl = $elem.getAttribute('href')
    if (!zzb.types.isStringNotEmpty(zurl)) {
      zurl = $elem.getAttribute('action')
      if (!zzb.types.isStringNotEmpty(zurl) && $elem.nodeName && $elem.nodeName.toLowerCase() !== 'img') {
        zurl = $elem.getAttribute('src')
      }
    }
  }
  if (!zurl || zurl === '#') {
    return (returnNull ? null : '')
  }
  return zurl
}

// https://gomakethings.com/how-to-serialize-form-data-with-vanilla-js/
// https://gomakethings.com/how-to-serialize-form-data-into-a-search-parameter-string-with-vanilla-js/
// https://stackoverflow.com/questions/41431322/how-to-convert-formdata-html5-object-to-json
function serialize (data, $elem) {
  let obj = {};
  for (let [key, value] of data) {
    if (obj[key] !== undefined) {
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    } else {
      obj[key] = value;
    }
  }
  if ($elem) {
    const keys = Object.keys(obj)
    for (let ii = 0; ii < keys.length; ii++) {
      let $field = $elem.querySelector('[name="' + keys[ii] + '"]')
      if ($field) {
        let zfType = $field.getAttribute('zf-type')

        // The cached value, if set, overrides the actual value.
        let zfCVal = zzb.dom.getAttributeElse($field, 'zf-cval', null)
        if (zfCVal) {
          if (zfType === 'date-iso' && obj[keys[ii]].trim() === '') {
            // A different datepicker object picker may have better results.
            obj[keys[ii]] = null
          } else {
            obj[keys[ii]] = zfCVal
          }
        }

        if (zzb.types.isStringNotEmpty(zfType)) {
          let forceArray = zfType.startsWith('[]')
          let type = zfType.replaceAll('[]', '')
          let elseif = (type === 'int' || type === 'float') ? 0 : ''
          if (type === 'string' && !forceArray) {
            continue
          } else if (type === 'bool') {
            elseif = false
          } else if (type === 'date-iso') {
            elseif = null
          }
          obj[keys[ii]] = zzb.strings.parseTypeElse(obj[keys[ii]], type, elseif, forceArray)
        }
      }
    }
  }
  return obj;
}

function objToTree(obj) {

  function setNode(branch, parts, level, value) {
    if (level === parts.length - 1) {
      branch[parts[level]] = value
    } else {
      if (!branch[parts[level]]) {
        branch[parts[level]] = {}
      }
      branch[parts[level]] = setNode(branch[parts[level]], parts, level + 1, value)
    }
    return branch
  }

  const keys = Object.keys(obj)
  let tree = {}
  for (let ii = 0; ii < keys.length; ii++) {
    tree = setNode(tree, keys[ii].split('.'), 0, obj[keys[ii]])
  }

  return tree
}

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
  if (zaction.isValid !== true) {
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

  results = zzb.types.merge({html: null, js: {title: null, altTitle: null, body: null, type: null, buttons: null, noHeaderCloseButton: false}}, (results) ? results : {})

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

      // Init:
      // 1. UI elements needing javascript inside modal-body
      // 2. Any action handlers
      // 3. Triggers
      //    * When the event is 'zurl-confirm', the server is not contact until AFTER confirmation.
      //      'zurl-confirm' is resolved under 'button.action' otherwise $elem is searched for triggers
      //       inside '.modal-body', which is what the logic below does.
      if ($elem) {

        zzb.zaction.loadZInputs($elem)

        if (zzb.zui) {
          zzb.zui.onElemInit($elem)
        }

        zzb.zaction.addEventListeners('.zaction', results.js.actionHandler, $elem)

        let $ztElems = $elem.querySelectorAll('[ztrigger]')
        if ($ztElems) {
          $ztElems.forEach(function($ztElem) {
            if (!allowedTriggers.includes($ztElem.getAttribute(('ztrigger')))) {
              console.log('no match of ztrigger handler "', $ztElem.getAttribute('ztrigger') + '"' )
            } else {
              // Ensure this element has a loop-type assigned from the original action.
              if (zaction.getOptions().hasLoopType) {
                if (!zzb.types.isStringNotEmpty($ztElem.getAttribute('za-loop-type'))) {
                  $ztElem.setAttribute('za-loop-type', zaction.getOptions().zaction.loopType)
                  $ztElem.setAttribute('za-loop-inject-skip-inject', "false") // true
                }
              }

              $ztElem.addEventListener('ztrigger-dialog-button', function(ev){
                zzb.zaction.actionHandler(ev, ev.detail.altHandler, function(drr, err) {
                  handleActionResults(drr, err, ev.detail.dialog)
                })
              })
            }
          })
        }
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
  if ($elems) {
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
}

const cacheZInputs = {}

_zaction.prototype.loadZInputs = function($parent) {
  if (!$parent) {
    $parent = document
  }
  const fnToggle = function ($toggler, useDisabled, noChange) {
    if (noChange) {
      useDisabled ? $toggler.disabled = true : $toggler.classList.add('d-none')
    } else {
      useDisabled ? $toggler.disabled = false : $toggler.classList.remove('d-none')
    }
  }
  const fnUpdateToggler = function(id, $toggler, useDisabled) {
    let noChange = true
    for (const [ key, value ] of Object.entries(cacheZInputs[id].changes)) {
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
  const fnDetectChanges = function($elem) {
    let id = $elem.getAttribute('id')
    if (!zzb.types.isStringNotEmpty(id)) {
      id = zzb.uuid.newV4().replace(/-/g, '')
      $elem.setAttribute('id', id)
    }
    let $toggler = document.getElementById($elem.getAttribute('ztoggler'))
    if (zzb.types.isObject($toggler)) {
      $toggler.setAttribute('zref-zinput-ptr', id)
      let useDisabled = $toggler.getAttribute('ztoggler-display') === 'disabled'
      fnToggle($toggler, useDisabled, true)
      cacheZInputs[id] = {originals:{},changes:{}}
      let $fields = $elem.querySelectorAll('.zinput-field')
      if ($fields) {
        $elem.querySelectorAll('.zinput-field').forEach(function($field) {
          const fldName = $field.getAttribute('name')
          if (zzb.types.isStringNotEmpty(fldName)) {
            const fldType = fnFindFieldType($field)
            if (fldType === 'checkbox' || fldType === 'radio') {
              cacheZInputs[id].originals[fldName] = $field.checked + ''
            } else {
              cacheZInputs[id].originals[fldName] = $field.value
            }
            let chEvent = $field.getAttribute('zinput-event')
            if (zzb.types.isStringEmpty(chEvent)) {
              chEvent = 'input'
            }
            const zInputEvent = $field.getAttribute('zinput-event')
            if (zInputEvent === 'change') {
              $field.addEventListener('change', function (e) {
                if (fldType === 'checkbox' || fldType === 'radio') {
                  cacheZInputs[id].changes[fldName] = cacheZInputs[id].originals[fldName] === this.checked + ''
                } else if (fldType === 'textarea') {
                  cacheZInputs[id].changes[fldName] = cacheZInputs[id].originals[fldName] === this.value
                } else {
                  cacheZInputs[id].changes[e.target.name] = cacheZInputs[id].originals[e.target.name] === e.target.value
                }
                fnUpdateToggler(id, $toggler, useDisabled)
              })
            } else {
              $field.addEventListener('input', function(e) {
                cacheZInputs[id].changes[e.target.name] = cacheZInputs[id].originals[e.target.name] === e.target.value
                fnUpdateToggler(id, $toggler, useDisabled)
              })
            }
          }
        })
      }
    }
  }
  if ($parent.tagName && $parent['classList'] && $parent.classList.contains('zinput')) {
    fnDetectChanges($parent)
  } else {
    let $elems = $parent.querySelectorAll('.zinput')
    if ($elems) {
      $elems.forEach(function($elem) {
        fnDetectChanges($elem)
      })
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {

  let $body = document.querySelector('body')
  if ($body) {
    if ($body.getAttribute('no-autoload-zactions') === 'true') {
      return
    }
    // $body.getAttribute('zactions-wait-check' === 'true') {
    //         // The issue is preventing multiple events to be attached to a single element.
    //         // Current solution:
    //         // 1. The attribute "za1x" (=zaction 1x only) checks if zaction has been applied to an element.
    //         //    Future: optionally inside addEventListeners, can add flag to not add the za1x check.
    //         // Other solutions:
    //         // 2. Add a timer on an interval to run addEventListeners only when other libs have finished loading,
    //         //    indicated by a conditional attribute on the body (eg proceed) or stopWait function on zaction.
    //         //    BUT #2 may not ever be needed anyways. Other libs can register handlers when their js loads which is then
    //         //    available immediately and prior to DOMContentLoaded. (script tags are processed before DOMContentLoaded)
    //         return
    // }
    zzb.zaction.addEventListeners('.zaction')
  }

  zzb.zaction.runZLoadActions()

}, false);

exports.zaction = _zaction
