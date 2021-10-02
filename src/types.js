// ---------------------------------------------------
// types
// ---------------------------------------------------

function _types () {}

_types.prototype.merge = function(defaultOption, newOptions) {
  return mergeArgs(defaultOption, newOptions)
}

const mergeArgs = function (...arguments) {
  // create a new object
  let target = {};

  // deep merge the object into the target object
  const merger = (obj) => {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // if the property is a nested object
          target[prop] = mergeArgs(target[prop], obj[prop]);
        } else {
          // for regular property
          target[prop] = obj[prop];
        }
      }
    }
  };

  // iterate through all objects and
  // deep merge them with target
  for (let i = 0; i < arguments.length; i++) {
    merger(arguments[i]);
  }

  return target;
};

const merge = (...arguments) => {

  // create a new object
  let target = {};

  // deep merge the object into the target object
  const merger = (obj) => {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // if the property is a nested object
          target[prop] = merge(target[prop], obj[prop]);
        } else {
          // for regular property
          target[prop] = obj[prop];
        }
      }
    }
  };

  // iterate through all objects and
  // deep merge them with target
  for (let i = 0; i < arguments.length; i++) {
    merger(arguments[i]);
  }

  return target;
};

// http://stackoverflow.com/questions/23252173/get-html-escaped-text-from-textarea-with-jquery
_types.prototype.escapeHtml = function (unsafe) {
  if (!unsafe) {
    return ''
  } else {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}

// baseToString is a lightweight version of the lodash function baseToString.
// https://github.com/lodash/lodash/blob/0843bd46ef805dd03c0c8d804630804f3ba0ca3c/lodash.js#L4230
_types.prototype.baseToString = function(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (zzb.types.isNumber(value)) {
    var result = (trimSuffix + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }
  return ''
}

_types.prototype.toString = function (s) {
  return s == null ? '' : zzb.types.baseToString(s);
}

_types.prototype.isArray = function (o) {
  return (o && (o !== undefined) && Object.prototype.toString.call(o) === '[object Array]')
}

_types.prototype.isArrayHasRecords = function (o) {
  return zzb.types.isArray(o) && o.length > 0
}

_types.prototype.isObject = function (o) {
  return (o && (typeof o === 'object'))
}

_types.prototype.isNumber = function (o) {
  return !isNaN(o - 0) && o !== null && o !== '' && o !== false
}

// Deprecated
// Will be remove in version 3.0.0
_types.prototype.isNonEmptyString = function (s) {
  return (s && (typeof s === 'string') && s.trim().length > 0)
}

_types.prototype.isStringNotEmpty = function (s) {
  return (s && (typeof s === 'string') && s.trim().length > 0)
}

// Deprecated
// Will be remove in version 3.0.0
_types.prototype.isEmptyString = function (s) {
  return (s && (typeof s === 'string') && s.trim().length === 0)
}

_types.prototype.isStringEmpty = function (s) {
  return (s && (typeof s === 'string') && s.trim().length === 0)
}

_types.prototype.isString = function (s) {
  return (s && (typeof s === 'string'))
}

_types.prototype.isFunction = function (fn) {
  var getType = {}
  return fn && getType.toString.call(fn) === '[object Function]'
}

_types.prototype.isBoolean = function (b) {
  return (typeof b === 'boolean')
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

exports.types = _types
