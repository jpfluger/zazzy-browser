// client only
var $ = require('jQuery')

// client or server
var _ = require('lodash')

// ---------------------------------------------------
// _forms
// ---------------------------------------------------

var _forms = function() {}

var renderHtml_Popover = function (errs, options) {

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
      arrHtml.push(zzb.strings.format('<div>{0}</div>', err.message))
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

var afterHtmlAdded_Popover = function (reho) {
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
    renderErrorHtml: renderHtml_Popover,
    afterHtmlAdded: afterHtmlAdded_Popover,
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

module.exports.forms = _forms
