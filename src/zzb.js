if (typeof jQuery === 'undefined') {
  throw new Error('zazzy-browser\'s JavaScript requires jQuery. jQuery must be included before zazzy-browser\'s JavaScript.')
}

if (typeof BootstrapDialog === 'undefined') {
  throw new Error('zazzy-browser\'s JavaScript requires BootstrapDialog. BootstrapDialog must be included before zazzy-browser\'s JavaScript.')
}

if (typeof _ === 'undefined') {
  throw new Error('zazzy-browser\'s JavaScript requires lodash. lodash must be included before zazzy-browser\'s JavaScript.')
}

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.zzb = factory()
}(this, (function () { 'use strict';

  function zzNodeConstructor (parent, data, pkField, parentField) {
    return new zzNode(parent, data, pkField, parentField)
  }

  function zzNode (parent, data, pkField, parentField) {
    // the parent object
    this.parent = parent

    // the data object from the server
    this.data = data

    // references to the parent-children
    this.pkField = pkField
    this.parentField = parentField

    // the fn used to create a new node
    this.nodeConstructor = zzNodeConstructor
    this.nodeItemConstructor = zzNodeConstructor

    // if this object changed, set the dirty bit
    this.isDirty = false

    if (!this.data[pkField]) {
      this.data[pkField] = null
    }

    if (!this.data[parentField]) {
      this.data[parentField] = null
    }

    if (!this.parent) {
      this.parent = null
    } else {
      if (this.parent.getId() != this.data[parentField]) {
        this.data[parentField] = this.parent.getId()
        this.isDirty = true
      }
    }

    // any children go here
    this.children = []

    this.getData = function() {
      return this.data
    }

    this.getId = function() {
      return this.data[pkField]
    }

    this.getParent = function() {
      return this.parent
    }

    this.getRoot = function() {
      if (this.parent === null) {
        return this
      } else {
        return this.parent.getRoot()
      }
    }

    this.removeChild = function(targetId) {
      if (this.children.length > 0) {
        var index = _.findIndex(this.children, function(obj){return obj.getId() === targetId})
        if (index > -1) {
          this.children.splice(index, 1)
        }
      }
    }

    this.addChild = function(data, newPKField, newParentField) {
      // already been added?
      var $this = this
      var child = _.find(this.children, function(ch) {
        return ch.getId() === data[$this.pkField]
      })
      // nope
      if (!child) {
        // instead of "new zzNode", using a generic constructor
        child = new this.nodeConstructor(this, data,
          (newPKField ? newPKField : this.pkField),
          (newParentField ? newParentField : this.parentField)
        )
        this.children.push(child)
      }
      return child
    }

    this.findChild = function(targetId, doSearchItems) {
      var hit = null
      if (this.getId() === targetId){
        hit = this
      }
      else {
        if (doSearchItems && this.items.length > 0) {
          _.each(this.items, function(item){
            if (item.getId() === targetId) {
              hit = item
              return false
            }
          })
        }
        if (!hit && this.children.length > 0) {
          _.each(this.children, function(ch){
            hit = ch.findChild(targetId, doSearchItems)
            if (hit) {
              return false
            }
          })
        }
      }
      return hit
    }

    // After much debate, decided to include an items array. It is similar to the children array
    // except that it contains objects tied to a parent tree and is not a parent object itself
    // (well, it could be but it would be self-contained within its own branch --> which may happen with "control" or "govDoc" if we allow for multi-parts to a doc or control)
    this.items = []
    // not the parent but the designated owning object
    this.itemOwner = null

    this.getItemOwner = function() {
      return this.itemOwner
    }

    this.addItem = function(data, newPKField, newParentField) {
      // already been added?
      var $this = this
      var item = _.find(this.items, function(it) {
        return it.getId() === data[$this.pkField]
      })
      // nope
      if (!item) {
        // instead of "new zzNode", using a generic constructor
        item = this.nodeItemConstructor(null, data, newPKField, newParentField)
        item.itemOwner = this
        this.items.push(item)
      }
      return item
    }

    this.removeItem = function(targetId) {
      if (this.items.length > 0) {
        var index = _.findIndex(this.items, function(obj){return obj.getId() === targetId})
        if (index > -1) {
          this.items.splice(index, 1)
        }
      }
    }

    this.findItem = function(targetId) {
      var hit = null
      if (this.items.length > 0) {
        _.each(this.items, function(item) {
          if (item.getId() === targetId) {
            hit = item
            return false
          }
        })
      }
      if (!hit && this.children.length > 0) {
        _.each(this.children, function(ch){
          hit = ch.findItem(targetId)
          if (hit) {
            return false
          }
        })
      }
      return hit
    }

    this.sortChildren = function(fn, noDeepSort) {
      if (!fn) {
        return
      }
      if (this.children.length > 0) {
        this.children.sort(fn)
        if (!noDeepSort) {
          _.each(this.children, function (child) {
            child.sortChildren(fn)
          })
        }
      }
    }

    this.sortItems = function(fn, fnChildren, noDeepSort) {
      if (!fn) {
        return
      }
      if (this.items.length > 0) {
        this.items.sort(fn)
        if (fnChildren) {
          _.each(this.items, function(item){
            if (!noDeepSort) {
              item.sortChildren(fnChildren, noDeepSort)
            }
          })
        }
      }
    }

    this.getLevelDeep = function() {
      var level = 0
      if (this.parent) {
        level = 1
        level += this.parent.getLevelDeep()
      }
      return level
    }

    this.branchCallFunction = function(fn, startRootFirst, tryItemOwner) {
      if (!startRootFirst) {
        fn && fn(this)
      }
      if (this.parent) {
        this.parent.branchCallFunction(fn,startRootFirst,tryItemOwner)
      }
      if (tryItemOwner && this.itemOwner) {
        this.itemOwner.branchCallFunction(fn, startRootFirst, tryItemOwner)
      }
      if (startRootFirst) {
        fn && fn(this)
      }
    }

    this.branchCallFunctionChildren = function(fn, tryItems) {
      fn && fn(this)
      if (this.children.length > 0) {
        _.each(this.children, function(ch){
          ch.branchCallFunctionChildren(fn, tryItems)
        })
      }
      if (tryItems && this.items.length > 0) {
        _.each(this.items, function(item) {
          item.branchCallFunctionChildren(fn, tryItems)
        })
      }
    }
  }

  function _types () {}

  _types.prototype.escapeJqueryId = function(id, prefix) {
    // ref: https://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
    prefix = (prefix == null ? '#' : prefix)
    return prefix + id.replace( /(:|\.|\[|\]|,)/g, "\\$1" )
  }

  // http://stackoverflow.com/questions/23252173/get-html-escaped-text-from-textarea-with-jquery
  _types.prototype.escapeHtml = function(unsafe) {
    if (!unsafe) {
      return ''
    } else {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    }
  }

  _types.prototype.isArray = function (o) {
    return (o && (o !== undefined) && Object.prototype.toString.call(o) === '[object Array]')
  }

  _types.prototype.isArrayHasRecords = function (o) {
    return this.isArray(o) && o.length > 0
  }

  _types.prototype.isObject = function (o) {
    return (o && (typeof o === 'object'))
  }

  _types.prototype.isNumber = function (o) {
    return !isNaN(o - 0) && o !== null && o !== "" && o !== false
  }

  _types.prototype.isNonEmptyString = function (s) {
    return (s && (typeof s === 'string') && s.trim().length > 0)
  }

  _types.prototype.isEmptyString = function (s) {
    return (s && (typeof s === 'string') && s.trim().length === 0)
  }

  _types.prototype.isString = function (s) {
    return (s && (typeof s === 'string'))
  }

  _types.prototype.isFunction = function (fn) {
    var getType = {}
    return fn && getType.toString.call(fn) === '[object Function]'
  }

  /**
   * compare
   *
   * Takes two parameters. If x equals y, the function returns 0. If x is greater than y, the function returns 1. If x is less than y, the function returns -1.
   * Useful in sorting algorithms
   * ref: http://stackoverflow.com/questions/16426774/underscore-sortby-based-on-multiple-attributes
   */
  _types.prototype.compare = function (x, y, isDesc) {
    if (x === y) {
      return 0
    }
    if (isDesc) {
      return x > y ? -1 : 1
    } else {
      return x > y ? 1 : -1
    }
  }

  // ---------------------------------------------------
  // uuid
  // ---------------------------------------------------

  var _uuid = function () {}

  /**
   * zzb.uuid.newV4
   *
   * Usage:
   *    zzb.uuid.newV4()
   * Produces:
   *    '9716498c-45df-47d2-8099-3f678446d776'
   *
   * Generates an RFC 4122 version 4 uuid
   * This is not a time-based approach, unlike uuid v1 - so don't let the use of _.now() fool you!
   * Use of _.now() has to do with collision avoidance.
   * @see http://stackoverflow.com/a/8809472
   * @returns {String} the generated uuid
   */
  _uuid.prototype.newV4 = function () {
    var d = _.now()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + _.random(16)) % 16 | 0
      d = Math.floor(d / 16)
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  }

  /**
   * zzb.uuid.isV4
   *
   * Usage:
   *    zzb.uuid.isV4(zzb.uuid.newV4())
   * Produces:
   *    true|false
   *
   * Validates a version 4 uuid string
   * @param {String} uuid - the uuid under test
   * @returns {Boolean} true if the uuid under test is a valid uuid
   **/
  _uuid.prototype.isV4 = function (uuid) {
    var re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return re.test(uuid)
  }

  /**
   * zzb.uuid.isValid
   *
   * Usage:
   *    zzb.uuid.isValid(zzb.uuid.newV4())
   * Produces:
   *    true|false
   *
   * Validates ANY version uuid string (eg v1 or v4)
   * @param {String} uuid - the uuid under test
   * @returns {Boolean} true if the uuid under test is a valid uuid
  **/
  _uuid.prototype.isValid = function (uuid) {
    var re = /^([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)$/i
    return re.test(uuid)
  }

  // ---------------------------------------------------
  // strings
  // ---------------------------------------------------

  var _strings = function() {}

  //  ValueError :: String -> Error
  var formatValueError = function(message) {
    var err = new Error(message);
    err.name = 'ValueError';
    return err;
  };

  //  defaultTo :: a,a? -> a
  var formatDefaultTo = function(x, y) {
    return y == null ? x : y;
  };

  var formatLookup = function(obj, path) {
    if (!/^\d+$/.test(path[0])) {
      path = ['0'].concat(path);
    }
    for (var idx = 0; idx < path.length; idx += 1) {
      var key = path[idx];
      obj = typeof obj[key] === 'function' ? obj[key]() : obj[key];
    }
    return obj;
  };

  // https://github.com/davidchambers/string-format
  // create :: Object -> String,*... -> String
  var formatString = function(transformers) {
    return function(template) {
      var args = Array.prototype.slice.call(arguments, 1);
      var idx = 0;
      var state = 'UNDEFINED';

      return template.replace(
        /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
        function(match, literal, key, xf) {
          if (literal != null) {
            return literal;
          }
          if (key.length > 0) {
            if (state === 'IMPLICIT') {
              throw formatValueError('cannot switch from ' +
                'implicit to explicit numbering');
            }
            state = 'EXPLICIT';
          } else {
            if (state === 'EXPLICIT') {
              throw formatValueError('cannot switch from ' +
                'explicit to implicit numbering');
            }
            state = 'IMPLICIT';
            key = String(idx);
            idx += 1;
          }
          var value = formatDefaultTo('', formatLookup(args, key.split('.')));

          if (xf == null) {
            return value;
          } else if (Object.prototype.hasOwnProperty.call(transformers, xf)) {
            return transformers[xf](value);
          } else {
            throw formatValueError('no transformer named "' + xf + '"');
          }
        }
      );
    };
  };

  _strings.prototype.format = formatString({})

  /**
   * zzb.strings.formatEmpty
   *
   * Usage:
   *   zzb.strings.formatEmpty('{a} is dead, but {{b}} is alive! {a} {c}', {a: 'ASP', b: 'FLEXIBLE NODEJS'})
   *   zzb.strings.formatEmpty('{0} is dead, but {{1}} is alive! {0} {2}', 'ASP', 'FLEXIBLE NODEJS')
   * Produces:
   *   ASP is dead, but {FLEXIBLE NODEJS} is alive! ASP
   *
   * Formats a string using words within curly brace delimiters. Escape braces by doubling-up: "{{0}}" --> {some-param}
   * Matches with an invalid object or array key are replaced by an empty string
   * @param template
   * @param options
   * @returns {String} a merging of object with the supplied template
 **/
  _strings.prototype.formatEmpty = function(template) {
    var args = Array.prototype.slice.call(arguments, 1)
    if (Array.isArray(args)) {
      return template.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
          ? args[number]
          : '' // match
          
      })
    } else {
      return template.replace(/{((?:(?=([^{}]+|{{[^}]*}}))\2)*)}/g, function(match, key) {
        // console.log(match + '  ' + key)
        return (args.length > 0 && args[0][key]) ? args[0][key] : '' // match
      })
    }
  }

  /**
   * zzb.strings.appendIfMoreThan
   *
   * Usage:
   *   zzb.strings.appendIfMoreThan('some string', '...', 3)
   * Produces
   *  som...
   *
   * Appends the supplied characters to the string if the character count of the string
   * is greater than the ifMoreCharCount parameter
   * @param str
   * @param charsToAppend
   * @param ifMoreCharCount
   * @returns {String}
   */
  _strings.prototype.appendIfMoreThan = function(str, charsToAppend, ifMoreCharCount) {
    return ((str && (str.length > ifMoreCharCount)) ? str.substring(0, ifMoreCharCount) + charsToAppend : str)
  }

  /**
   * zzb.strings.joinArrToCommas
   *
   * Usage:
   *  zzb.strings.joinArrToCommas(['a','b','c'])
   * Produces
   *  a, b, c
   *
   * Usage:
   *  _.joinArrToCommas([{name:'a',{name:'b'},{name:'c'}], 'name')
   * Produces
   *  a, b, c
   *
   * @param arr
   * @returns {String}
   */
  _strings.prototype.joinArrToCommas = function(arr, fieldName) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      return ''
    }
    return arr.map(arr, function(obj, idx){
      var comma = ''
      if (idx < (arr.index - 1)) {
        comma = ''
      }
      if (fieldName) {
        return obj[fieldName] + comma
      } else {
        return obj + comma
      }
    }).join('')
  }

  // ---------------------------------------------------
  // _ui
  // ---------------------------------------------------

  var _ui = function() {}

  /**
   * zzb.ui.createPanelGroup
   *
   * @param options A ui-element where options = {id: zzb.uuid.newV4(), classPanelGroup: '', innerHtml: ''}
   * @returns {String}
   */
  _ui.prototype.createPanelGroup = function (options) {
    options = _.merge({id: zzb.uuid.newV4(), classPanelGroup: '', innerHtml: ''}, options)
    var template = '<div id="panelGroup_{id}" class="panel-group {classPanelGroup}">{innerHtml}</div>'
    return zzb.strings.format(template, options) // _.formatObj(template, uie);
  }

  /**
   * zzb.ui.createPanelBody
   *
   * @param options A ui-element where options = {id: zzb.uuid.newV4(), classPanelBody: '', innerHtml: ''}
   * @returns {String}
   */
  _ui.prototype.createPanelBody = function (options) {
    options = _.merge({id: zzb.uuid.newV4(), classPanelBody: '', innerHtml: ''}, options)
    var template = '<div id="panelBody_{id}" class="panel-body {classPanelBody}">{innerHtml}</div>'
    return zzb.strings.format(template, options) // _.formatObj(template, uie);
  }

  /**
   * zzb.ui.createPanel
   *
   * @param options A ui-element where options = {id: zzb.uuid.newV4(), className: '', attributesExtra: '',
   *                                              classPanelHeading: '', name: '',
   *                                              classPanelBody: '', innerHtml: ''
   * @returns {String}
   */
  _ui.prototype.createPanel = function (options) {
    options = _.merge({id: zzb.uuid.newV4(), className: '', attributesExtra: '',
      classPanelHeading: '', name: '',
      classPanelBody: '', innerHtml: ''}, options)

    var template = '<div id="panel_{id}" class="panel panel-default {className}" {attributesExtra}>'
                    + '<div class="panel-heading {classPanelHeading}>">'
                      + '{name}'
                    + '</div>'
                    + '<div id="panelBody_{id}" class="panel-body {classPanelBody}">'
                      + this.createPanelBody(options) //'<div class="panel-body">{innerHtml}</div>'
                    + '</div>'
                  + '</div>'
    return zzb.strings.format(template, options) // _.formatObj(template, uie);
  }

  /**
   * zzb.ui.createPanel
   *
   * @param options A ui-element where options = {id: zzb.uuid.newV4(), className: '', attributesExtra: '', name: '',
   *                                              classPanelBody: '', innerHtml: '',
   *                                              isPanelCollapsed: false}, classNamePanelCollapsed: '',
   *                                              titleHtmlExtra: '', titleHtmlExtraRight: ''}
   * @returns {String}
   */
  _ui.prototype.createPanelCollapsible = function (options) {
    options = _.merge({id: zzb.uuid.newV4(), className: '', attributesExtra: '', name: '',
      classPanelBody: '', innerHtml: '', 
      isPanelCollapsed: false, classNamePanelCollapsed: '',
      titleHtmlExtra: '', titleHtmlExtraRight: ''}, options)

    if (options.isPanelCollapsed) {
      options._panelCollapsedClass1 ='collapsed';
      options._panelCollapsedClass2 ='';
    } else {
      options._panelCollapsedClass1 ='';
      options._panelCollapsedClass2 ='in';
    }

    var template = '<div id="panel_{id}" class="panel panel-default {className}" {attributesExtra}>'
                    + '<div class="panel-heading">'
                      + '<h4 class="panel-title">'
                        + '{titleHtmlExtra}<a data-toggle="collapse" data-target="#panelCollapse_{id}" href="#panelCollapse_{id}" class="{_panelCollapsedClass1}{classNamePanelCollapsed}">'
                          + '{name}'
                        + '</a> {titleHtmlExtraRight}'
                      + '</h4>'
                    + '</div>'
                    + '<div id="panelCollapse_{id}" class="panel-collapse collapse {_panelCollapsedClass2}">'
                      + this.createPanelBody(options) //'<div class="panel-body">{innerHtml}</div>'
                    + '</div>'
                  + '</div>'

    //var test = _.formatObj(template, uie);
    //console.log(test)
    //return test;
    return zzb.strings.format(template, options) // _.formatObj(template, uie)
  }

  /**
   * zzb.ui.createPanelBegin
   *
   * @param options A ui-element where options = {id: zzb.uuid.newV4(), className: '', attributesExtra: '', name: '',
   *                                              classPanelBody: '', innerHtml: '',
   *                                              isPanelCollapsed: false}, classNamePanelCollapsed: '',
   *                                              titleHtmlExtra: '', titleHtmlExtraRight: ''}
   * @returns {String}
   */
  _ui.prototype.createPanelCollapsibleBegin = function (options) {
    options = _.merge({id: zzb.uuid.newV4(), className: '', attributesExtra: '', name: '',
      classPanelBody: '', innerHtml: '', 
      isPanelCollapsed: false, classNamePanelCollapsed: '',
      titleHtmlExtra: '', titleHtmlExtraRight: ''}, options)

    if (options.isPanelCollapsed) {
      options._panelCollapsedClass1 ='collapsed';
      options._panelCollapsedClass2 ='';
    } else {
      options._panelCollapsedClass1 ='';
      options._panelCollapsedClass2 ='in';
    }

    var template = '<div class="panel panel-default {className}" id="panel_{id}" {attributesExtra}>'
                    + '<div class="panel-heading">'
                      + '<h4 class="panel-title">'
                        + '{titleHtmlExtra}<a data-toggle="collapse" data-target="#panelCollapse_{id}" href="#panelCollapse_{id}" class="{_panelCollapsedClass1}{classNamePanelCollapsed}">'
                        + '{name}'
                        + '</a> {titleHtmlExtraRight}'
                      + '</h4>'
                    + '</div>'
                    + '<div id="panelCollapse_{id}" class="panel-collapse collapse {_panelCollapsedClass2}">'
                      + '<div class="panel-body" id="panelBody_{id}">'

    return zzb.strings.format(template, options) // _.formatObj(template, uie)
  };

  /**
   * zzb.ui.createPanelEnd
   *
   * @returns {String}
   */
  _ui.prototype.createPanelCollapsibleEnd = function () {
    return '</div></div></div>';
  };

  // ---------------------------------------------------
  // _forms
  // ---------------------------------------------------

  var _forms = function() {}

  _forms.prototype.renderHtml_Popover = function (errs, options) {

    var arrHtml = []
    var arrPopOver = []

    // assume success
    if (!errs || errs.length === 0 || !errs[0]) {
      if (options.hideWhenNoError) {
        return {html: null, contentPopOver: null}
      } else {
        errs = [{type: 'success', message: null}]
      }
    }

    _.each(errs, function(err, index) {

      if (!err.field) {
        err.field = '_system'
      }

      if (err.field === '_system') {
        arrHtml.push(zzb.strings.format('<div">{0}</div>', err.message))
      } else {
        var typeFormat = options.typeFormats.error

        if (err.type && options.typeFormats[err.type]) {
          typeFormat = options.typeFormats[err.type]
        }

        // only once
        if (index == 0) {
          arrHtml.push(zzb.strings.format('<span class="glyphicon {0} {1}"></span>', typeFormat.glyph, typeFormat.textClass))
        }

        if (err.message && zzb.types.isNonEmptyString(err.message)) {
          arrPopOver.push(err.message)
        }
      }
    })

    return {html: arrHtml.join(' '), contentPopOver: arrPopOver.join('  ')}
  }

  _forms.prototype.afterHtmlAdded_Popover = function (reho) {
    if (reho.$elem && reho.$elem.length > 0) {
      if (reho && reho.contentPopOver && zzb.types.isNonEmptyString(reho.contentPopOver)) {
        reho.$elem.popover({
           trigger:'hover',
           animation: false,
           content: reho.contentPopOver
        });
      }
    }
  }

  _forms.prototype.displayUIErrors = function(options, callback) {

    options = _.merge({selector: null, $form: null,
      selectorField: '.zzb-form-field',
      attrFieldname: 'zzb-fieldname',
      // selectorLabel: '.zzb-form-field-label', // not used
      // selectorValue: '.zzb-form-field-value', // not used
      selectorError: '.zzb-form-field-error',
      errs: null, 
      err: null,
      hideWhenNoError: false, // this always shows the 'success' checkmark
      typeFormats: {
        error: {glyph: 'glyphicon-remove', textClass: 'text-danger', bgClass: null},
        warning: {glyph: 'glyphicon-warning', textClass: 'text-warning', bgClass: null},
        success: {glyph: 'glyphicon-ok', textClass: 'text-success', bgClass: null},
        default: null
      },
      renderErrorHtml: zzb.forms.renderHtml_Popover,
      afterHtmlAdded: zzb.forms.afterHtmlAdded_Popover,
      handleSystemErrors: null
    }, options)

    var success = false;

    if (options.renderErrorHtml) {
      
      if (options.$form) {
        options.selector = null // not required
      } else if (options.selector) {
        options.$form = $('selector')
      }

      if (!options.$form || options.$form.length === 0) {
        return callback && callback(success);
      }

      if (options.err && !Array.isArray(options.err)){
        options.errs = [zzb.rob.createError(options.err)]
        options.err = null
      } else if (options.errs && !Array.isArray(options.errs)){
        options.errs = [zzb.rob.createError(options.errs)]
        options.err = null
      }

      var eo = zzb.rob.toObject(options.errs)

      var handledSystem = false

      // errors have pre-existing placeholders that are hidden
      options.$form.find(options.selectorError).each(function (index, elemErr) {
        var $elemErr = $(elemErr)

        // what's the associated fieldname?
        var $parent = $elemErr.closest(options.selectorField)

        if ($parent.length === 0) {
          console.log('discovered an error field but could not determine the field to which it belongs (eg zzb-form-field)')
          return true
        }

        var fieldname = $parent.attr(options.attrFieldname)

        if (zzb.types.isEmptyString(fieldname)) {
          console.log('discovered an error field and its parent field (eg zzb-form-field) but the fieldname attribute is empty (eg zzb-fieldname="")')
          return true        
        }

        if (fieldname === '_system') {
          handledSystem = true
        }

        // get a reho (returned error html object)
        var reho = options.renderErrorHtml(eo[fieldname], options)

        $elemErr.html(reho.html)

        if (reho.html && zzb.types.isNonEmptyString(reho.html)) {
          $elemErr.removeClass('hidden')
        } else {
          $elemErr.addClass('hidden')
        }

        reho.fieldname = fieldname
        reho.$elem = $elemErr

        options.afterHtmlAdded && options.afterHtmlAdded(reho)
      })
    }

    if (!handledSystem && eo['_system']) {
      if (eo['_system'].length > 0 && eo['_system'][0]) {
        if (options.handleSystemErrors) {
          options.handleSystemErrors(eo['_system'], options)
        } else {
          zzb.dialogs.handleError({errs: eo['_system']})
        }
      }
    }

    callback && callback(success)
  }


/*
  self.forms.toListFromErrors = function(errs) {
    var arrHtml = [];

    if (errs && Array.isArray(errs)) {
      var arrHtmlSystem = [];
      arrHtml.push('<ul class="panelErrorList">')
      _.each(errs, function(err) {
        if (err.field === '_system') {
          arrHtmlSystem.push(err.message)
        } else if (err.field) {
          arrHtml.push(_.formatArr('<li><strong>{0}</strong>:  {1}</li>', _.capitalize(err.field.toLowerCase()), err.message))
        } else {
          arrHtmlSystem.push(err.message)
        }
      });
      if (arrHtmlSystem.length > 0) {
        arrHtml.push(_.formatArr('<li><strong>System Errors</strong>:  {0}</li>', arrHtmlSystem.join(' ')))
      }
      arrHtml.push('</ul>')
    }

    return arrHtml.join('');
  };*/


  // ---------------------------------------------------
  // _dialogs
  // ---------------------------------------------------

  /*
   BootstrapDialog.TYPE_DEFAULT,
   BootstrapDialog.TYPE_INFO,
   BootstrapDialog.TYPE_PRIMARY,
   BootstrapDialog.TYPE_SUCCESS,
   BootstrapDialog.TYPE_WARNING,
   BootstrapDialog.TYPE_DANGER
   */

  var _dialogs = function() {}

  _dialogs.prototype.showMessage = function(options) {
    options = _.merge({
      type: BootstrapDialog.TYPE_DEFAULT,
      title: '',
      message: '',
      buttonCloseName: 'Ok',
      onShown: null
    }, options)

    BootstrapDialog.show({
      type: options.type,
      title: options.title,
      message: options.message,
      onshown: options.onShown,
      buttons: [{
        label: options.buttonCloseName,
        action: function (dialogRef) {
          dialogRef.close();
        }
      }]
    });
  };

  _dialogs.prototype.showMessageChoice = function(options) {
    options = _.merge({
      type: BootstrapDialog.TYPE_DEFAULT,
      title: '',
      message: '',
      cssClass: '',
      buttonLeftName: 'Cancel',
      buttonRightName: 'Accept',
      buttonLeftCssClass: '',
      buttonRightCssClass: '',
      buttonLeftIcon: '',
      buttonRightIcon: '',
      onShown: null,
      onButtonLeftClick: null,
      onButtonRightClick: null,
      noButtons: false,
      buttons: []
    }, options)

    if (!options.noButtons) {
      options.buttons = [{
        label: options.buttonLeftName,
        cssClass: options.buttonLeftCssClass,
        icon: options.buttonLeftIcon,
        action: function (dialogRef) {
          if (!options.onButtonLeftClick) {
            dialogRef.close()
          } else {
            options.onButtonLeftClick(function(err) {
              if (!err) {
                dialogRef.close()
              }
            })
          }
        }
      },
      {
        label: options.buttonRightName,
        cssClass: options.buttonRightCssClass,
        icon: options.buttonRightIcon,
        action: function (dialogRef) {
          if (!options.onButtonRightClick) {
            dialogRef.close()
          } else {
            options.onButtonRightClick(function(err) {
              if (!err) {
                dialogRef.close()
              }
            })
          }
        }
      }]
    }

    BootstrapDialog.show({
      type: options.type,
      title: options.title,
      message: options.message,
      cssClass: options.cssClass,
      onshown: options.onShown,
      buttons: options.buttons
    })
  }

  _dialogs.prototype.handleError = function(options) {
    //zzb.dialogs.handleError({log: 'failed to retrieve login dialog form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the login form. Please check your connection settings and try again.'})
    options = _.merge({log: null, title: '', message: null, errs: null}, options)

    if (options.log) {
      console.log(options.log)
    }

    if (options.errs) {
      if (Array.isArray(options.errs) && options.errs.length > 0 && options.errs[0]) {
        var arrHtml = []

        _.each(options.errs, function(err, index) {
          if (err.message && zzb.types.isNonEmptyString(err.message)) {
            arrHtml.push(zzb.strings.format('<div>{0}</div>', err.message))
          }
        })

        if (arrHtml.length > 0) {

          if (!options.message) {
            options.message = ''
          }

          if (options.errIntro) {
            options.message += ' ' + options.errIntro
          }

          // this allows for a custom message to be prefixed, like: <strong>Error!</strong>
          options.message += ' ' + arrHtml.join('')
        }
      }
    }

    if (options.message) {
      this.showMessage({type: BootstrapDialog.TYPE_DANGER,
        title: options.title,
        message: options.message})
    }
  }

  // ---------------------------------------------------
  // rob (Return Object)
  // ---------------------------------------------------

  var _rob = function () {}

  // reduce the error array to an object
  _rob.prototype.toObject = function (errs) {
    if (!errs || !Array.isArray(errs)) {
      return {'_system': [errs]}
    }
    var eo = {}
    _.each(errs, function (err) {
      if (err) {
        if (!err.field) {
          err.field = '_system'
        }
        if (!eo[err.field]) {
          eo[err.field] = []
        }
        eo[err.field].push(err)
      }
    })
    return eo
  }

  // Creates a single ROB error object from an error, which could be in the format of a string, array or object
  _rob.prototype.createError = function (err) {
    var newErr = {type: 'error', message: null, field: null, trace: null}
    
    if (!err) {
      return newErr
    }

    if (typeof err === 'string') {
      if (zzb.types.isNonEmptyString(err)) {
        newErr.message = err
      }
    }
    else if (Array.isArray(err)) {
      console.log('bad intput in createError - cannot create an error object from an array')
      return newErr
    }
    // assume object
    else if (zzb.types.isObject(err)) { // err instanceof Error || !Array.isArray(err)) {
      // at minimum, always has this
      newErr.message = err.message
      // optional
      newErr.field = err.field || '_system'
      newErr.type = err.type || 'error'
      newErr.trace = err.trace || null
    }
    return newErr
  }

  // Sanitizes ROB error(s), which could be in the format of a string, array or object
  // Returns null or an array of errors
  _rob.prototype.sanitizeErrors = function (errs) {
    var newErrs = null
    if (!errs) {
      return newErrs
    }
    
    if (!Array.isArray(errs)) {
      newErrs = [zzb.rob.createError(errs)]
    } else if (errs.length > 0) {
      newErrs = []
      _.each(errs, function (err) {
        newErrs.push(zzb.rob.createError(err))
      })
    }

    return newErrs
  }

  // always returns an array, even if null
  _rob.prototype.sanitizeRecords = function (recs) {
    if (!recs) {
      return []
    }
    if (!Array.isArray(recs)) {
      return [recs]
    } 
    return recs
  }

  // ---------------------------------------------------
  // ajax
  // ---------------------------------------------------

  function _ajax () {
    this.ajax = function (options) {
      return new Promise(function (fulfill, reject) {
        $.ajax(options)
          .done(function (data, textStatus, jqXHR) {
            // allow an escape
            if (options.RAWRETURN) {
              return fulfill(data)
            }

            // should always have a status of some type returned
            if (!data) {
              return reject(new Error('Data returned is empty when at minimum a status is required'))
            }

            if (!jqXHR.responseJSON) {
              // html or some other data type was returned
              data = {recs: [data]}
            } else {
              // always redirect, if present
              if (data.redirect && data.redirect.length > 0) {
                return window.location.href = data.redirect
              }

              // Errors are ALWAYS an ARRAY and in an expected ROB Error format
              // format:  [ {field: null, message: null, trace: null}]
              // server-side can instruct this function to ignore sanitizing by inspecting ISROBERRORS
              if (!data.ISROBERRORS) {
                if (data.err) {
                  // an err should always be package as an array
                  // this is b/c form submissions could reply with multiple errors for different fields
                  data.errs = zzb.rob.sanitizeErrors(data.err)
                  data.err = null
                } else if (data.error) {
                  data.error = zzb.rob.sanitizeErrors(data.error)
                  data.error = null
                } else if (data.errs) {
                  data.errs = zzb.rob.sanitizeErrors(data.errs)
                  data.err = null                
                }
              }

              // Records are ALWAYS an array
              if (!data.ISROBRECS) {
                if (data.recs) {
                  data.recs = zzb.rob.sanitizeRecords(data.rec)
                } else if (data.rec) {
                  data.recs = zzb.rob.sanitizeRecords(data.rec)
                  data.rec = null
                } else {
                  // pass in self
                  data.recs = zzb.rob.sanitizeRecords(data)                  
                }
              }
            }

            data.first = function () {
              return (data.recs && Array.isArray(data.recs) && data.recs.length > 0 ? data.recs[0] : null) 
            }
            data.find = function (key, value) {
              var hit = null
              _.each(data.recs, function (rec) {
                if (rec && zzb.types.isObject(rec) && !Array.isArray(rec) && rec[key] === value) {
                  hit = rec
                  return false
                }
              })
              return hit
            }
            data.length = function () {
              return (data.recs && Array.isArray(data.recs) ? data.recs.length : 0) 
            }

            fulfill(data)
          })
          .fail(function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON) {
              if (data.redirect) {
                return window.location.href = data.redirect
              }
            }
            reject(errorThrown)
            console.log(errorThrown)
          })
      })
    }
  }

  // sometimes a request is made for an html snippet but json is returned
  // this is why dataType is commented out here b/c the calling function isn't certain what type of data will return
  _ajax.prototype.get = function (options) {
      options.type = 'GET'
      options.contentType = 'application/json; charset=UTF-8'
      options.data = JSON.stringify(options.data)
      return this.ajax(options)
  }

  _ajax.prototype.getJSON = function (options) {
      options.type = 'GET'
      options.dataType = 'json'
      options.contentType = 'application/json; charset=UTF-8'
      options.data = JSON.stringify(options.data)
      return this.ajax(options)
  }

  _ajax.prototype.postJSON = function (options) {
    options.type = 'POST'
    options.dataType = 'json'
    options.contentType = 'application/json; charset=UTF-8'
    options.data = JSON.stringify(options.data)
    return this.ajax(options)
  }

  // ---------------------------------------------------
  // zzb
  // ---------------------------------------------------

  function _zzb () {
    this.zzbStatus = null
  }

  // tree operations
  _zzb.prototype.zzNode = zzNode
  // data type operations: supplements lodash and moment
  _zzb.prototype.types = new _types()
  // uuid functions
  _zzb.prototype.uuid = new _uuid()
  // string functions
  _zzb.prototype.strings = new _strings()
  // ui functions
  _zzb.prototype.ui = new _ui()
  // form functions
  _zzb.prototype.forms = new _forms()
  // dialog functions
  _zzb.prototype.dialogs = new _dialogs()
  // rob (==return object)
  _zzb.prototype.rob = new _rob()
  // ajax helpers with promises
  _zzb.prototype.ajax = new _ajax()
  // gets status info, such as user, page, role info which has been set prior in sessionStorage otherwise try getting from the server
  _zzb.prototype.status = function (callback) {
    // Try local storage first (if top-level page supports it) -> this function will delete it, if found
    // Top-level page would have code similar to:

    if (this.zzbStatus) {
      return callback && callback(null, this.zzbStatus)
    }

    if (typeof(Storage) !== "undefined" && sessionStorage.zzbStatus) {
      var tmpStatus = null

      try {
        // using sessionStorage (not localStorage)
        tmpStatus = JSON.parse(sessionStorage.getItem('zzbStatus'))
      } catch(err) {
      }

      sessionStorage.setItem('zzbStatus', null)

      if (tmpStatus) {
        this.zzbStatus = tmpStatus
        return callback && callback(null, this.zzbStatus)
      }
    }

    // not in session storage? (best) try a server-side call to '/zzb/status'
    // REQUIRES (callback)
    // if err then returns defaults where isLoggedIn = false
    var defaultStatus = {user: {isLoggedIn: false, username: null}, page: {path: null}}
    // remember newbies that inside .then() that "this" refrences the .then() function, so using "that" is a workaround
    var that = this

    zzb.ajax.postJSON(
    {
      url: '/zzb/status',
      data: {path: window.location.path}
    })
    .then(function(rob){
      if (rob.errs) {
        callback && callback(rob.errs, defaultStatus);
      } else {
        that.zzbStatus = rob.one()
        callback && callback(null, that.zzbStatus)
      }
    })
    .catch(function(err){
      console.log('failed to retrieve zzbStatus: using defaults')
      callback && callback(zzb.types.sanitizeErrors(err), defaultStatus)
    })
  }

  return new _zzb()
})))
