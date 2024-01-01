// ---------------------------------------------------
// dom
// ---------------------------------------------------

function _dom () {}

_dom.prototype.hasUIHover = function () {
  return (!window.matchMedia("(hover: none)").matches)
}

_dom.prototype.hasElement = function ($elem) {
  return ($elem)
}

_dom.prototype.setAttribute = function ($elem, key, value) {
  // $modal.querySelector('.modal-header button[data-bs-dismiss]').setAttribute('aria-label', button.label)
  if ($elem) {
    if (zzb.types.isObject($elem)) {
      $elem.setAttribute(key, value)
    } else if (zzb.types.isArray($elem)) {
      $elem.forEach(function($e) {
        $e.setAttribute(key, value)
      })
    }
  }
}

_dom.prototype.getAttributeElse = function ($elem, name, elseValue) {
  if (elseValue === undefined || elseValue === null) {
    elseValue = null
  }
  if (!$elem) {
    return elseValue
  }
  let value = $elem.getAttribute(name)
  if (zzb.types.isStringNotEmpty(value)) {
    return value
  }
  return elseValue
}

_dom.prototype.getAttributes = function ($elem, regex, camelCaseStrip) {
  if (!$elem || !regex) {
    return {}
  }
  if (!zzb.types.isNumber(camelCaseStrip)) {
    camelCaseStrip = -1
  }
  let data = {};
  [].forEach.call($elem.attributes, function(attr) {
    if (regex.test(attr.name)) {
      if (camelCaseStrip <= 0) {
        data[attr.name] = attr.value
      } else {
        // Creates camel case of the attrib, stripping off the "data-", which is the first 5 characters.
        // "data-method" transforms to "method"
        // "data-prop-sub" transforms to "propSub"
        let camelCaseName = attr.name.substr(camelCaseStrip).replace(/-(.)/g, function ($0, $1) {
          return $1.toUpperCase()
        })
        data[camelCaseName] = attr.value
      }
    }
  })
  return data
}

exports.dom = _dom
