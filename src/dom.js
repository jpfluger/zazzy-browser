// ---------------------------------------------------
// types
// ---------------------------------------------------

function _dom () {}

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

exports.dom = _dom
