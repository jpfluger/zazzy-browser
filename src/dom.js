// ---------------------------------------------------
// dom
// ---------------------------------------------------

function _dom () {}

/**
 * Checks if the current device supports hover interactions (e.g., mouse).
 *
 * @returns {boolean} - True if hover is supported; false otherwise.
 */
_dom.prototype.hasUIHover = function () {
  return (!window.matchMedia("(hover: none)").matches)
}

/**
 * Determines if a DOM element reference exists.
 *
 * @param {Element|null|undefined} $elem - The DOM element or reference.
 * @returns {boolean} - True if the element exists; false otherwise.
 */
_dom.prototype.hasElement = function ($elem) {
  return !!$elem
}

/**
 * Sets an attribute on a DOM element or a list of DOM elements.
 *
 * @param {Element|Element[]} $elem - A single DOM element or an array of elements.
 * @param {string} key - The attribute name to set.
 * @param {string} value - The attribute value to assign.
 */
_dom.prototype.setAttribute = function ($elem, key, value) {
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

/**
 * Retrieves an attribute from a DOM element, returning a fallback if not found or empty.
 *
 * @param {Element|null} $elem - The DOM element.
 * @param {string} name - The attribute name to retrieve.
 * @param {*} elseValue - The fallback value to return if the attribute is missing or empty.
 * @returns {*} - The attribute value or the fallback.
 */
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

/**
 * Extracts all attributes from a DOM element matching a regex, optionally converting names to camelCase.
 *
 * @param {Element} $elem - The DOM element.
 * @param {RegExp} regex - A regular expression to filter attributes (e.g., /^data-/).
 * @param {number} [camelCaseStrip=-1] - If > 0, strips the prefix and converts the rest to camelCase.
 * @returns {Object} - A key-value map of matched attributes.
 */
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
        let camelCaseName = attr.name.substr(camelCaseStrip).replace(/-(.)/g, function ($0, $1) {
          return $1.toUpperCase()
        })
        data[camelCaseName] = attr.value
      }
    }
  })
  return data
}


/**
 * Sets a deeply nested value in an object based on a dot-notated path.
 * Supports array notation like `foo[0].bar`.
 *
 * Examples:
 *   setPath(obj, 'user.name', 'Alice')
 *   setPath(obj, 'items[0].title', 'Item 1')
 *
 * @param {Object} obj - The object to update.
 * @param {string} path - Dot-notated path (supports array syntax).
 * @param {*} value - The value to assign at the target path.
 */
_dom.prototype.setPath = function(obj, path, value) {
  let current = obj;
  const pathParts = zzb.types.toString(path).split(".");

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const arrayMatch = part.match(/^(\w+)\[(\d*)\]$/);

    let key = part;
    let isArray = false;
    let arrayIndex = 0;

    if (arrayMatch) {
      isArray = true;
      key = arrayMatch[1];
      arrayIndex = arrayMatch[2] === "" ? null : parseInt(arrayMatch[2], 10);
    }

    if (i === pathParts.length - 1) {
      if (isArray) {
        if (!zzb.types.isArray(current[key])) current[key] = [];
        if (arrayIndex !== null) {
          while (current[key].length <= arrayIndex) {
            current[key].push(null);
          }
          current[key][arrayIndex] = value;
        } else {
          current[key] = value;
        }
      } else {
        current[key] = value;
      }
    } else {
      if (isArray) {
        if (!zzb.types.isArray(current[key])) current[key] = [];
        if (!zzb.types.isObject(current[key][0])) current[key][0] = {};
        current = current[key][0];
      } else {
        if (!zzb.types.isObject(current[key])) current[key] = {};
        current = current[key];
      }
    }
  }
}

/**
 * Converts a form element's input into a deeply nested JSON object.
 * Uses zf-* attributes to determine types, arrays, and nullability.
 *
 * - Supports nested paths like `user.name`
 * - Handles custom types via `zf-type` (e.g., "int", "[]bool|null")
 * - Reads value overrides from `zf-cval`
 *
 * @param {HTMLFormElement} formElem - The form element to serialize.
 * @returns {Object} - A deeply nested JSON object.
 */
_dom.prototype.formDataToJson = function(formElem) {
  const data = new FormData(formElem);
  const raw = {};
  const nested = {};

  for (let [key, value] of data) {
    if (raw[key] !== undefined) {
      if (!zzb.types.isArray(raw[key])) {
        raw[key] = [raw[key]];
      }
      raw[key].push(value);
    } else {
      raw[key] = value;
    }
  }

  for (const key in raw) {
    const field = formElem.querySelector(`[name="${key}"]`);
    let value = raw[key];
    let typeHint = 'string';
    let forceArray = false;
    let isNullable = false;

    if (field) {
      const zfCVal = field.getAttribute("zf-cval");
      if (zfCVal !== null) {
        value = zfCVal;
      }

      let zfType = field.getAttribute("zf-type") || "string";

      // Handle array type indicator (e.g. "[]int")
      if (zfType.startsWith("[]")) {
        forceArray = true;
        zfType = zfType.slice(2);
      }

      const typeParts = zfType.split("|").map(t => zzb.types.normalizeType(t));
      typeHint = typeParts[0];
      isNullable = typeParts.includes("null");

      const fallback = typeHint === 'integer' || typeHint === 'float'
        ? 0
        : typeHint === 'boolean'
          ? false
          : '';

      const isEmpty = value === '' || value === null || typeof value === 'undefined';

      if (isEmpty && isNullable) {
        value = null;
      } else if (zzb.types.isArray(value)) {
        value = value.map(v => zzb.strings.parseTypeElse(v, typeHint, fallback, false));
      } else {
        value = zzb.strings.parseTypeElse(value, typeHint, fallback, false);
      }
    } else {
      value = value === '' ? '' : value;
    }

    if (forceArray && !zzb.types.isArray(value)) {
      value = [value];
    }

    zzb.dom.setPath(nested, key, value);
  }

  return nested;
}

/**
 * Parses a selector bundle and resolves DOM targets relative to a base element.
 *
 * Supports:
 * - self:              returns the element itself
 * - none:              returns string 'none'
 * - selector:#id       uses document.querySelector
 * - closest:.class     uses $elem.closest
 * - child:.child       uses $elem.querySelector
 * - Supports optional label and placement: `label.selector@placement:target`
 *
 * Examples:
 *   findSelectorTargets(elem, 'self')
 *     → [ { label: 'self', $elem: elem } ]
 *
 *   findSelectorTargets(elem, 'none')
 *     → 'none'
 *
 *   findSelectorTargets(elem, 'selector:#modal')
 *     → [ { label: null, $elem: document.querySelector('#modal'), placement: 'inner' } ]
 *
 *   findSelectorTargets(elem, 'closest:.container')
 *     → [ { label: null, $elem: elem.closest('.container'), placement: 'inner' } ]
 *
 *   findSelectorTargets(elem, 'child:.inner-content')
 *     → [ { label: null, $elem: elem.querySelector('.inner-content'), placement: 'inner' } ]
 *
 *   findSelectorTargets(elem, 'alert.closest@outer:.alert-box')
 *     → [ { label: 'alert', $elem: elem.closest('.alert-box'), placement: 'outer' } ]
 *
 *   findSelectorTargets(elem, 'self, selector:#target, notice.child@inner:.message')
 *     → [ { label: 'self', $elem: elem }, { $elem: document.querySelector('#target'), ... }, { label: 'notice', $elem: ..., placement: 'inner' } ]
 *
 * @param {Element} $elem - The base DOM element.
 * @param {string} bundle - Comma-separated list of selector expressions.
 * @returns {Array|String|null} - Array of resolved targets, 'none', or null on failure.
 */
_dom.prototype.findSelectorTargets = function ($elem, bundle) {
  if (!$elem || !zzb.types.isStringNotEmpty(bundle)) {
    return null
  }

  const result = []
  const targetStrings = bundle.split(',')

  for (let entry of targetStrings) {
    entry = entry.trim()

    if (entry === 'self' || entry === 'self:') {
      result.push({ label: 'self', $elem })
      continue
    }

    if (entry === 'none' || entry === 'none:') {
      return 'none'
    }

    const colonIndex = entry.indexOf(':')
    if (colonIndex === -1) continue

    const left = entry.slice(0, colonIndex)
    const right = entry.slice(colonIndex + 1)
    if (!zzb.types.isStringNotEmpty(right)) return null

    let label = null
    let method = left
    let placement = 'inner'

    // Parse label.method@placement
    const dotIndex = method.indexOf('.')
    if (dotIndex > 0) {
      label = method.slice(0, dotIndex)
      method = method.slice(dotIndex + 1)
    }

    const atIndex = method.indexOf('@')
    if (atIndex > 0) {
      placement = method.slice(atIndex + 1)
      method = method.slice(0, atIndex)
    }

    let $target = null
    switch (method) {
      case 'selector':
      case 's':
        $target = document.querySelector(right)
        break
      case 'closest':
      case 'c':
        $target = $elem.closest(right)
        break
      case 'child':
      case 'h':
        $target = $elem.querySelector(right)
        break
      default:
        console.warn('Unknown selector method:', method)
        break
    }

    if (!(placement === 'inner' || placement === 'outer')) {
      console.warn('Unknown placement param; defaulting to "inner":', placement)
      placement = 'inner'
    }

    if ($target) {
      result.push({ label, $elem: $target, placement })
    }
  }

  return result
}

/**
 * Attempts to extract a URL-like value from an element by checking a prioritized list of attributes.
 * Falls back in order: zurl → href → action → src (if not an <img>).
 *
 * @param {Element} $elem - The DOM element to inspect.
 * @param {boolean} [returnNull=false] - If true, returns null instead of an empty string on failure.
 * @returns {string|null} - The found URL string or fallback value.
 */
_dom.prototype.findZUrl = function ($elem, returnNull) {
  if (!$elem || typeof $elem.getAttribute !== 'function') { returnNull ? null : '' }

  const tag = $elem.nodeName?.toLowerCase()
  const tryAttrs = ['zurl', 'href', 'action']

  // Only check 'src' if the element is not an image
  if (tag !== 'img') {
    tryAttrs.push('src')
  }

  for (const attr of tryAttrs) {
    const val = $elem.getAttribute(attr)
    if (zzb.types.isStringNotEmpty(val) && val !== '#') {
      return val
    }
  }

  return returnNull ? null : ''
}

/**
 * Unified in-memory and persistent (localStorage) cache utility for DOM-centric use cases.
 *
 * Provides a simple interface to:
 * - Get/set temporary cache in memory (`mode: 'mem'`)
 * - Persist small configuration/state values using `localStorage` (`mode: 'persist'`)
 *
 * Options:
 * - `mode`: 'mem' (default) or 'persist'
 * - `rootKey`: Used as the localStorage key root (default: 'zuiC')
 *
 * Example:
 *   _dom.cache.set('myKey', 'value')                        // memory
 *   _dom.cache.set('theme', 'dark', { mode: 'persist' })    // localStorage
 *   _dom.cache.get('theme', { mode: 'persist' })            // 'dark'
 */
const _memCache = {};

_dom.prototype.cache = {
  /**
   * Retrieves a cached value by key.
   * @param {string} key - Cache key to retrieve.
   * @param {Object} [options] - Options: { mode: 'mem' | 'persist', rootKey?: string }
   * @returns {*} - The cached value or null.
   */
  get(key, { mode = 'mem', rootKey = 'zuiC' } = {}) {
    if (!key) return null;

    if (mode === 'persist') {
      try {
        const store = JSON.parse(localStorage.getItem(rootKey) || '{}');
        return store[key] ?? null;
      } catch (e) {
        console.warn('ZUI persistent cache read error:', e);
        return null;
      }
    }

    return _memCache[key] ?? null;
  },

  /**
   * Stores a value in cache.
   * @param {string} key - Key to store under.
   * @param {*} value - Value to store.
   * @param {Object} [options] - Options: { mode: 'mem' | 'persist', rootKey?: string }
   */
  set(key, value, { mode = 'mem', rootKey = 'zuiC' } = {}) {
    if (!key) return;

    if (mode === 'persist') {
      try {
        const store = JSON.parse(localStorage.getItem(rootKey) || '{}');
        store[key] = value;
        localStorage.setItem(rootKey, JSON.stringify(store));
      } catch (e) {
        console.warn('ZUI persistent cache write error:', e);
      }
    } else {
      _memCache[key] = value;
    }
  },

  /**
   * Clears a key or all cache depending on mode.
   * @param {Object} [options] - { key?: string, mode?: 'mem' | 'persist', rootKey?: string }
   */
  clear({ key = null, mode = 'mem', rootKey = 'zuiC' } = {}) {
    if (mode === 'persist') {
      if (key) {
        try {
          const store = JSON.parse(localStorage.getItem(rootKey) || '{}');
          delete store[key];
          localStorage.setItem(rootKey, JSON.stringify(store));
        } catch (e) {
          console.warn('ZUI persistent cache clear error:', e);
        }
      } else {
        localStorage.removeItem(rootKey);
      }
    } else {
      if (key) {
        delete _memCache[key];
      } else {
        for (const k in _memCache) {
          delete _memCache[k];
        }
      }
    }
  }
};

exports.dom = _dom
