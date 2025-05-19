// ---------------------------------------------------
// types
// ---------------------------------------------------

// A utility constructor providing type-checking,
// string-conversion, and object-manipulation methods.
function _types () {}

/**
 * Deeply merges two objects into a new object.
 * Properties from `newOptions` override those in `defaultOptions`.
 *
 * @param {Object} defaultOptions - The object providing default values.
 * @param {Object} newOptions - The object containing properties to override defaults.
 * @returns {Object} - A new object resulting from a deep merge of provided objects.
 */
_types.prototype.merge = function(defaultOptions, newOptions) {
  return deepMerge({}, defaultOptions, newOptions);
};

/**
 * Recursively merges multiple source objects into a target object.
 * Nested objects are merged deeply; other types overwrite directly.
 *
 * @param {Object} target - The target object to merge into.
 * @param {...Object} sources - One or more source objects.
 * @returns {Object} - The merged target object.
 */
function deepMerge(target, ...sources) {
  sources.forEach(source => {
    if (!source || typeof source !== 'object') return;
    Object.keys(source).forEach(key => {
      const value = source[key];
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        target[key] = deepMerge(target[key] || {}, value);
      } else {
        target[key] = value;
      }
    });
  });
  return target;
}

/**
 * Truncates a number to a specific number of decimal places without rounding.
 *
 * @param {number} num - The number to truncate.
 * @param {number} decimal - The number of decimal places to retain.
 * @returns {string} - The truncated number represented as a string.
 */
_types.prototype.truncate = function(num, decimal) {
  if (typeof num !== 'number' || typeof decimal !== 'number' || decimal < 0) return '';
  const numString = num.toString();
  const decimalIndex = numString.indexOf('.');
  if (decimalIndex === -1 || decimal === 0) return numString.split('.')[0];
  return numString.substring(0, decimalIndex + decimal + 1);
};

/**
 * Escapes special HTML characters in a given string to their corresponding HTML entities.
 *
 * @param {string} unsafe - The string containing potentially unsafe HTML characters.
 * @returns {string} - The safely escaped string, or empty string if input is invalid.
 */
_types.prototype.escapeHtml = function (unsafe) {
  if (typeof unsafe !== 'string') return '';
  const replacements = {
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    '\'':'&#039;'
  };
  return unsafe.replace(/[&<>"']/g, char => replacements[char]);
};

/**
 * Converts a given value to a primitive string.
 * - Returns empty string ('') if value is null or undefined.
 * - Converts numbers, booleans, objects, and other types using standard coercion.
 * - All zeros are represented simply as "0".
 *
 * @param {*} value - The value to convert to string.
 * @returns {string} - The primitive string representation.
 */
_types.prototype.baseToString = function(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return '' + value;
  }
  if (value == null) { // handles null or undefined
    return '';
  }
  return '' + value;
};

/**
 * Converts a value to a primitive string.
 * Returns empty string if value is null or undefined.
 *
 * @param {*} s - The value to convert to a string.
 * @returns {string} - The converted primitive string.
 */
_types.prototype.toString = function (s) {
  return s == null ? '' : zzb.types.baseToString(s);
};

/**
 * Checks if the provided value is an array.
 *
 * @param {*} o - The value to check.
 * @returns {boolean} - True if value is an array, false otherwise.
 */
_types.prototype.isArray = function (o) {
  return Array.isArray(o);
};

/**
 * Checks if the provided value is an array containing at least one element.
 *
 * @param {*} o - The value to check.
 * @returns {boolean} - True if the value is a non-empty array, false otherwise.
 */
_types.prototype.isArrayHasRecords = function (o) {
  return zzb.types.isArray(o) && o.length > 0;
};

/**
 * Checks if the provided value is a plain object (not an array, null, or other type).
 *
 * @param {*} o - The value to check.
 * @returns {boolean} - True if the value is a plain object, false otherwise.
 */
_types.prototype.isObject = function (o) {
  return o !== null && typeof o === 'object' && !Array.isArray(o);
};

/**
 * Checks if the provided value is a valid number (excluding NaN).
 *
 * @param {*} o - The value to check.
 * @returns {boolean} - True if the value is a valid number, false otherwise.
 */
_types.prototype.isNumber = function (o) {
  return typeof o === 'number' && !isNaN(o);
};

/**
 * Checks if the provided value is a string with non-whitespace characters.
 *
 * @param {*} s - The value to check.
 * @returns {boolean} - True if the value is a non-empty string, false otherwise.
 */
_types.prototype.isStringNotEmpty = function (s) {
  return typeof s === 'string' && s.trim().length > 0;
};

/**
 * Checks if the provided value is an empty string or contains only whitespace.
 *
 * @param {*} s - The value to check.
 * @returns {boolean} - True if the value is an empty or whitespace-only string, false otherwise.
 */
_types.prototype.isStringEmpty = function (s) {
  return typeof s === 'string' && s.trim().length === 0;
};

/**
 * Checks if the provided value is a string type.
 *
 * @param {*} s - The value to check.
 * @returns {boolean} - True if the value is a string, false otherwise.
 */
_types.prototype.isString = function (s) {
  return typeof s === 'string';
};

/**
 * Checks if the provided value is a function.
 *
 * @param {*} fn - The value to check.
 * @returns {boolean} - True if the value is a function, false otherwise.
 */
_types.prototype.isFunction = function (fn) {
  return typeof fn === 'function';
};

/**
 * Checks if the provided value is a boolean.
 *
 * @param {*} b - The value to check.
 * @returns {boolean} - True if the value is a boolean, false otherwise.
 */
_types.prototype.isBoolean = function (b) {
  return typeof b === 'boolean';
};

/**
 * Checks if a given value is a single numeric digit (0–9).
 *
 * Accepts string, number, or other types. Only returns true for:
 * - A single character string containing a digit ('0'–'9')
 * - A number between 0 and 9 inclusive with no decimals
 *
 * Examples:
 *   isDigit('5')     → true
 *   isDigit(3)       → true
 *   isDigit('a')     → false
 *   isDigit('42')    → false
 *   isDigit(null)    → false
 *   isDigit(5.5)     → false
 *
 * @param {*} val - The value to check.
 * @returns {boolean} - True if the value is a single digit, false otherwise.
 */
_types.prototype.isDigit = function (val) {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val >= 0 && val <= 9;
  }
  if (typeof val === 'string' && val.length === 1) {
    return val >= '0' && val <= '9';
  }
  return false;
};

/**
 * Compares two values and returns:
 * - 0 if values are strictly equal.
 * - 1 if the first value is greater (ascending) or smaller (descending).
 * - -1 if the first value is smaller (ascending) or greater (descending).
 *
 * Special handling:
 * - Considers `null` less than any other value except `undefined`.
 * - Considers `undefined` as less than any other value.
 *
 * @param {*} x - The first value to compare.
 * @param {*} y - The second value to compare.
 * @param {boolean} [isDesc=false] - If true, compares in descending order.
 * @returns {number} Comparison result: 0, 1, or -1.
 */
_types.prototype.compare = function (x, y, isDesc = false) {
  if (x === y) return 0;

  if (x === undefined) return isDesc ? 1 : -1;
  if (y === undefined) return isDesc ? -1 : 1;
  if (x === null) return isDesc ? 1 : -1;
  if (y === null) return isDesc ? -1 : 1;

  if (isDesc) {
    return x > y ? -1 : 1;
  }
  return x > y ? 1 : -1;
};

const TYPE_ALIASES = {
  int: "integer",
  integer: "integer",
  str: "string",
  string: "string",
  bool: "boolean",
  boolean: "boolean",
  float: "float",
  number: "float",
  obj: "object",
  object: "object",
  null: "null"
};

/**
 * Normalizes a type string to a canonical type alias.
 *
 * Converts common shorthand or alternative type names like "int", "str", or "bool"
 * into consistent internal representations such as "integer", "string", or "boolean".
 *
 * Supported aliases:
 * - int, integer → "integer"
 * - str, string → "string"
 * - bool, boolean → "boolean"
 * - float, number → "float"
 * - obj, object → "object"
 * - null → "null"
 *
 * If the type is unrecognized, returns the original input string.
 *
 * @param {*} typeStr - The type to normalize. If not a string, it is stringified.
 * @returns {string} Normalized type string.
 */
_types.prototype.normalizeType = function normalizeType(typeStr) {
  if (typeof typeStr !== "string") {
    typeStr = String(typeStr ?? "string");
  }
  return TYPE_ALIASES[typeStr.toLowerCase()] || typeStr;
}

/**
 * Compares two values based on the specified type.
 * Supports integer, float, IP (v4/v6), and text types.
 *
 * @param {*} a - The first value to compare.
 * @param {*} b - The second value to compare.
 * @param {string} type - The comparison type ('int', 'float', 'ip', 'ipv4', 'ipv6', 'text').
 * @returns {number} - Comparison result: -1, 0, or 1.
 */
_types.prototype.compareValues = function(a, b, type) {
  switch (type) {
    case 'int':
      return parseInt(a, 10) - parseInt(b, 10);
    case 'float':
      return parseFloat(a) - parseFloat(b);
    case 'ip':
    case 'ipv4':
    case 'ipv6':
      return this.compareIP(a, b);
    case 'text':
    default:
      return (a || '').toString().toLowerCase().localeCompare((b || '').toString().toLowerCase());
  }
};

/**
 * Compares two IP addresses, determining whether they are IPv4 or IPv6,
 * and then delegating to the appropriate comparison function.
 *
 * Mixed-type comparison treats IPv4 as lower than IPv6.
 *
 * @param {string} a - First IP address.
 * @param {string} b - Second IP address.
 * @returns {number} - Comparison result: -1, 0, or 1.
 */
_types.prototype.compareIP = function(a, b) {
  const aType = this.detectIPType(a);
  const bType = this.detectIPType(b);

  if (aType === 'ipv4' && bType === 'ipv4') return this.compareIPv4(a, b);
  if (aType === 'ipv6' && bType === 'ipv6') return this.compareIPv6(a, b);
  return aType === 'ipv4' ? -1 : 1;
};

/**
 * Detects whether a string represents an IPv4 or IPv6 address.
 *
 * @param {string} ip - The IP address to classify.
 * @returns {string} - Either 'ipv4', 'ipv6', or 'unknown'.
 */
_types.prototype.detectIPType = function(ip) {
  if (ip.includes('.')) return 'ipv4';
  if (ip.includes(':')) return 'ipv6';
  return 'unknown';
};

/**
 * Compares two IPv4 addresses by their numeric octet values.
 *
 * @param {string} a - First IPv4 address.
 * @param {string} b - Second IPv4 address.
 * @returns {number} - Comparison result: -1, 0, or 1.
 */
_types.prototype.compareIPv4 = function(a, b) {
  const aParts = a.split('.').map(n => parseInt(n, 10) || 0);
  const bParts = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 4; i++) {
    if (aParts[i] < bParts[i]) return -1;
    if (aParts[i] > bParts[i]) return 1;
  }
  return 0;
}

/**
 * Compares two IPv6 addresses after expanding their shorthand notation.
 *
 * @param {string} a - First IPv6 address.
 * @param {string} b - Second IPv6 address.
 * @returns {number} - Comparison result: -1, 0, or 1.
 */
_types.prototype.compareIPv6 = function (a, b) {
  const aParts = normalizeIPv6(a);
  const bParts = normalizeIPv6(b);

  for (let i = 0; i < 8; i++) {
    const aVal = parseInt(aParts[i], 16);
    const bVal = parseInt(bParts[i], 16);
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
  }
  return 0;
};

function normalizeIPv6(ip) {
  const parts = ip.split('::');
  let head = parts[0] ? parts[0].split(':') : [];
  let tail = parts[1] ? parts[1].split(':') : [];

  // Normalize each segment to 4-digit hex
  head = head.map(h => h.padStart(4, '0'));
  tail = tail.map(h => h.padStart(4, '0'));

  const fill = new Array(8 - head.length - tail.length).fill('0000');
  return [...head, ...fill, ...tail];
}

exports.types = _types
