// client or server
var _ = require('lodash')

// ---------------------------------------------------
// _uib (UI Bootstrap)
// ---------------------------------------------------

var _uib = function () {}

/**
 * zzb.uib.createPanelGroup
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), classPanelGroup: '', innerHtml: ''}
 * @returns {String}
 */
_uib.prototype.createPanelGroup = function (options) {
  options = _.merge({ id: zzb.uuid.newV4(), classPanelGroup: '', innerHtml: '' }, options)
  var template = '<div id="panelGroup_{id}" class="panel-group {classPanelGroup}">{innerHtml}</div>'
  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanelBody
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), classPanelBody: '', innerHtml: ''}
 * @returns {String}
 */
_uib.prototype.createPanelBody = function (options) {
  options = _.merge({ id: zzb.uuid.newV4(), classPanelBody: '', innerHtml: '' }, options)
  var template = '<div id="panelBody_{id}" class="panel-body {classPanelBody}">{innerHtml}</div>'
  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanel
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), className: '', attributesExtra: '',
 *                                              classPanelHeading: '', name: '',
 *                                              classPanelBody: '', innerHtml: ''
 * @returns {String}
 */
_uib.prototype.createPanel = function (options) {
  options = _.merge({
    id: zzb.uuid.newV4(),
    className: '',
    attributesExtra: '',
    classPanelHeading: '',
    name: '',
    classPanelBody: '',
    innerHtml: ''
  }, options)

  var template = '<div id="panel_{id}" class="panel panel-default {className}" {attributesExtra}>' +
    '<div class="panel-heading {classPanelHeading}>">' +
    '{name}' +
    '</div>' +
    '<div id="panelBody_{id}" class="panel-body {classPanelBody}">' +
    this.createPanelBody(options) + // '<div class="panel-body">{innerHtml}</div>'
    '</div>' +
    '</div>'
  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanel
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), className: '', attributesExtra: '', name: '',
 *                                              classPanelBody: '', innerHtml: '',
 *                                              isPanelCollapsed: false}, classNamePanelCollapsed: '',
 *                                              titleHtmlExtra: '', titleHtmlExtraRight: ''}
 * @returns {String}
 */
_uib.prototype.createPanelCollapsible = function (options) {
  options = _.merge({
    id: zzb.uuid.newV4(),
    className: '',
    attributesExtra: '',
    name: '',
    classPanelBody: '',
    innerHtml: '',
    isPanelCollapsed: false,
    classNamePanelCollapsed: '',
    titleHtmlExtra: '',
    titleHtmlExtraRight: ''
  }, options)

  if (options.isPanelCollapsed) {
    options._panelCollapsedClass1 = 'collapsed'
    options._panelCollapsedClass2 = ''
  } else {
    options._panelCollapsedClass1 = ''
    options._panelCollapsedClass2 = 'in'
  }

  var template = '<div id="panel_{id}" class="panel panel-default {className}" {attributesExtra}>' +
    '<div class="panel-heading">' +
    '<h4 class="panel-title">' +
    '{titleHtmlExtra}<a data-toggle="collapse" data-target="#panelCollapse_{id}" href="#panelCollapse_{id}" class="{_panelCollapsedClass1}{classNamePanelCollapsed}">' +
    '{name}' +
    '</a> {titleHtmlExtraRight}' +
    '</h4>' +
    '</div>' +
    '<div id="panelCollapse_{id}" class="panel-collapse collapse {_panelCollapsedClass2}">' +
    this.createPanelBody(options) + // '<div class="panel-body">{innerHtml}</div>'
    '</div>' +
    '</div>'

  // var test = _.formatObj(template, uie)
  // console.log(test)
  // return test
  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanelBegin
 *
 * @param options A ui-element where options = {id: zzb.uuid.newV4(), className: '', attributesExtra: '', name: '',
 *                                              classPanelBody: '', innerHtml: '',
 *                                              isPanelCollapsed: false}, classNamePanelCollapsed: '',
 *                                              titleHtmlExtra: '', titleHtmlExtraRight: ''}
 * @returns {String}
 */
_uib.prototype.createPanelCollapsibleBegin = function (options) {
  options = _.merge({
    id: zzb.uuid.newV4(),
    className: '',
    attributesExtra: '',
    name: '',
    classPanelBody: '',
    innerHtml: '',
    isPanelCollapsed: false,
    classNamePanelCollapsed: '',
    titleHtmlExtra: '',
    titleHtmlExtraRight: ''
  }, options)

  if (options.isPanelCollapsed) {
    options._panelCollapsedClass1 = 'collapsed'
    options._panelCollapsedClass2 = ''
  } else {
    options._panelCollapsedClass1 = ''
    options._panelCollapsedClass2 = 'in'
  }

  var template = '<div class="panel panel-default {className}" id="panel_{id}" {attributesExtra}>' +
    '<div class="panel-heading">' +
    '<h4 class="panel-title">' +
    '{titleHtmlExtra}<a data-toggle="collapse" data-target="#panelCollapse_{id}" href="#panelCollapse_{id}" class="{_panelCollapsedClass1}{classNamePanelCollapsed}">' +
    '{name}' +
    '</a> {titleHtmlExtraRight}' +
    '</h4>' +
    '</div>' +
    '<div id="panelCollapse_{id}" class="panel-collapse collapse {_panelCollapsedClass2}">' +
    '<div class="panel-body" id="panelBody_{id}">'

  return zzb.strings.format(template, options) // _.formatObj(template, uie)
}

/**
 * zzb.uib.createPanelEnd
 *
 * @returns {String}
 */
_uib.prototype.createPanelCollapsibleEnd = function () {
  return '</div></div></div>'
}

exports.uib = _uib
