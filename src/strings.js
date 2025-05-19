// ---------------------------------------------------
// strings
// ---------------------------------------------------

const _strings = function () {}

/**
 * Creates a flexible string formatting function with support for:
 * - Positional and named placeholders
 * - Nested property access (e.g., {user.name})
 * - Optional value transformers (e.g., {0!upper})
 * - Escape sequences for literal braces (e.g., {{ and }})
 *
 * Usage Examples:
 *   format('{0}, you have {1} item{2}', 'Alice', 3, 's')             → "Alice, you have 3 items"
 *   format('{name}, you have {count} item{ending}', {name: 'Bob', count: 1, ending: ''}) → "Bob, you have 1 item"
 *   format('{0.name} has {1}', [{ name: 'Sally' }, 'apples'])       → "Sally has apples"
 *
 * Notes:
 * - Supports both implicit (e.g., {0}, {1}) and explicit (e.g., {name}) placeholders,
 *   but not mixed in the same template (will throw an error).
 * - Accepts an optional transformer map (e.g., `{ upper: s => s.toUpperCase() }`)
 *   to apply transformations using the `!transform` syntax.
 *
 * @param {Object.<string, function>} transformers - Optional map of transformation functions.
 * @returns {Function} - A formatter function: (template: string, ...values) => string
 */
const formatString = function (transformers) {
  return function format(template) {
    let args = Array.prototype.slice.call(arguments, 1);
    let idx = 0;
    let state = 'UNDEFINED';

    // Normalize args: if passed as a single array, unpack it
    if (args.length === 1 && Array.isArray(args[0])) {
      args = args[0];
    }

    return template.replace(
      /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
      function (match, literal, _key, xf) {
        if (literal != null) {
          return literal; // Escaped curly braces
        }

        let key = _key;

        if (key.length > 0) {
          if (state === 'IMPLICIT') {
            throw new Error('Cannot switch from implicit to explicit numbering');
          }
          state = 'EXPLICIT';
        } else {
          if (state === 'EXPLICIT') {
            throw new Error('Cannot switch from explicit to implicit numbering');
          }
          state = 'IMPLICIT';
          key = String(idx++);
        }

        const path = key.split('.');
        const lookupPath = /^\d+$/.test(path[0]) ? path : ['0'].concat(path);

        let value = lookupPath
          .reduce((maybe, key) => {
            return maybe.reduce((_, x) => {
              if (x != null && key in Object(x)) {
                const val = x[key];
                return [typeof val === 'function' ? val() : val];
              }
              return [];
            }, []);
          }, [args])
          .reduce((_, x) => x, '');

        if (xf == null) {
          return value;
        } else if (Object.prototype.hasOwnProperty.call(transformers, xf)) {
          return transformers[xf](value);
        } else {
          throw new Error('No transformer named "' + xf + '"');
        }
      }
    );
  };
};

_strings.prototype.format = formatString({});

/**
 * Light-weight formatter that fills missing values with an empty string.
 *
 * Supports both:
 *   - Positional placeholders: '{0}', '{1}' with array args
 *   - Named placeholders: '{name}', '{count}' with object arg
 *
 * Example:
 *   formatEmpty('Hi {0}, your code is {1}', ['Alice']) → 'Hi Alice, your code is '
 *   formatEmpty('Hi {name}, your count is {count}', { name: 'Bob' }) → 'Hi Bob, your count is '
 *
 * @param {string} template - The string template containing placeholders.
 * @param {...*} args - An array of values or a single object to interpolate.
 * @returns {string} - The formatted string with missing values replaced by ''.
 */
_strings.prototype.formatEmpty = function (template) {
  let args = Array.prototype.slice.call(arguments, 1);

  // Normalize args if passed as single array (e.g., formatEmpty('{0}', ['A']))
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }

  // Handle named object replacement
  if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    const obj = args[0];
    return template.replace(/{([^{}]+)}/g, function (_, key) {
      return obj[key] != null ? obj[key] : '';
    });
  }

  // Handle positional replacements
  return template.replace(/{(\d+)}/g, function (_, index) {
    return typeof args[index] !== 'undefined' && args[index] !== null
      ? String(args[index])
      : '';
  });
};

/**
 * Appends the specified characters to a string **only if** its length exceeds a given threshold.
 *
 * Commonly used to truncate long strings and append a suffix (like '...') to indicate continuation.
 *
 * Usage Example:
 *   zzb.strings.appendIfMoreThan('some string', '...', 3)
 *   // → 'som...'
 *
 * If the input string's length is less than or equal to `ifMoreCharCount`, it is returned unchanged.
 *
 * @param {string} str - The input string to check and potentially truncate.
 * @param {string} charsToAppend - The characters to append if truncation occurs.
 * @param {number} ifMoreCharCount - The length threshold to trigger truncation.
 * @returns {string} - The original or truncated string with appended characters.
 */
_strings.prototype.appendIfMoreThan = function (str, charsToAppend, ifMoreCharCount) {
  return (str && str.length > ifMoreCharCount)
    ? str.substring(0, ifMoreCharCount) + charsToAppend
    : str;
};

/**
 * Joins array items into a single string, separated by a specified delimiter (defaults to comma).
 *
 * Optionally extracts a nested field from objects using dot-notation (e.g., "user.name").
 *
 * Examples:
 *   zzb.strings.joinArr(['a', 'b', 'c'])                         // → "a, b, c"
 *   zzb.strings.joinArr([{name:'a'},{name:'b'}], 'name')        // → "a, b"
 *   zzb.strings.joinArr([{user:{name:'a'}},{user:{name:'b'}}], 'user.name')  // → "a, b"
 *   zzb.strings.joinArr(['x', 'y'], null, ' / ')                // → "x / y"
 *
 * @param {Array} arr - The input array to join (strings or objects).
 * @param {string} [fieldPath] - Optional dot-notated field path to extract from each object.
 * @param {string} [delimiter=', '] - The delimiter used to join values.
 * @returns {string} - The joined string.
 */
_strings.prototype.joinArr = function (arr, fieldPath, delimiter) {
  if (!Array.isArray(arr) || arr.length === 0) return '';

  const sep = delimiter != null ? delimiter : ', ';

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((val, key) => {
      return val && typeof val === 'object' ? val[key] : undefined;
    }, obj);
  };

  return arr
    .map(item => {
      if (fieldPath && typeof item === 'object' && item !== null) {
        const val = getNestedValue(item, fieldPath);
        return val != null ? String(val) : '';
      }
      return String(item);
    })
    .join(sep);
};

/**
 * Converts a word to its plural form based on the given number.
 *
 * Appends an "s" or a custom suffix if the number is not 1 or -1, unless `forcePlural` is true.
 *
 * Examples:
 *   zzb.strings.toPlural('dog', 1)                      // → "dog"
 *   zzb.strings.toPlural('dog', 2)                      // → "dogs"
 *   zzb.strings.toPlural('city', 2, { suffix: 'ies' })  // → "cities"
 *
 * @param {string} word - The base word to pluralize.
 * @param {number} number - The quantity to evaluate.
 * @param {Object} [options] - Optional config: { forcePlural: boolean, suffix: string|null }
 * @returns {string} - The pluralized word.
 */
_strings.prototype.toPlural = function (word, number, options) {
  options = zzb.types.merge({ forcePlural: false, suffix: null }, options);

  if ((number === 1 || number === -1) && !options.forcePlural) {
    return word;
  }

  return word + (options.suffix || 's');
};

/**
 * Capitalizes the first character of a non-empty string.
 *
 * Examples:
 *   zzb.strings.capitalize('hello') → 'Hello'
 *
 * @param {string} target - The string to capitalize.
 * @returns {string} - Capitalized string or empty string if input is invalid.
 */
_strings.prototype.capitalize = function (target) {
  if (zzb.types.isStringNotEmpty(target)) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return '';
};

/**
 * Trims a string, capitalizes the first letter, and ensures it ends with a period.
 *
 * Examples:
 *   zzb.strings.toFirstCapitalEndPeriod('hello world') → 'Hello world.'
 *
 * @param {string} target - The input string to format.
 * @returns {string} - Formatted string or empty string if input is invalid.
 */
_strings.prototype.toFirstCapitalEndPeriod = function (target) {
  if (zzb.types.isStringNotEmpty(target)) {
    target = target.trim();
    target = zzb.strings.capitalize(target);
    if (!target.endsWith('.')) {
      target += '.';
    }
  }
  return target;
};

// Unit labels for size formatting
const sizeUnitsFormatNameSingle = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const sizeUnitsFormatNameDouble = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const sizeUnitsFormatNameFull = ['Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte', 'Petabyte', 'Exabyte', 'Zettabyte', 'Yottabyte'];
const sizeUnitsFormatNameEIC = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

/**
 * Converts a file size in bytes to a human-readable string using various unit styles.
 *
 * Supported `unitsFormat` options:
 * - 'single': ["K", "M", "G", ...]
 * - 'double': ["KB", "MB", "GB", ...]
 * - 'full': ["Kilobyte", "Megabyte", ...]
 * - 'eic': ["KiB", "MiB", ...]
 *
 * @param {number} bytes - The file size in bytes.
 * @param {string} [unitsFormat='single'] - The format style for units.
 * @param {boolean} [noSizeUnitSeparation=false] - Whether to omit the space between value and unit.
 * @param {number} [dp=1] - Number of decimal places.
 * @returns {string} - Human-readable file size string.
 */
_strings.prototype.sizeToHumanReadable = function (bytes, unitsFormat, noSizeUnitSeparation, dp) {
  if (!zzb.types.isStringNotEmpty(unitsFormat)) unitsFormat = 'single';
  if (!dp) dp = 1;

  let unitSeperateSpace = noSizeUnitSeparation === true ? '' : ' ';
  let thresh = 1024;

  let units, unitsBytes = 'B';
  switch (unitsFormat.toLowerCase()) {
    case 'full': units = sizeUnitsFormatNameFull; unitsBytes = 'Bytes'; break;
    case 'double': units = sizeUnitsFormatNameDouble; break;
    case 'eic': units = sizeUnitsFormatNameEIC; break;
    default: units = sizeUnitsFormatNameSingle; break;
  }

  if (Math.abs(bytes) < thresh) {
    return bytes + unitSeperateSpace + unitsBytes;
  }

  let u = -1;
  let r = Math.pow(dp, 10);

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  let valFixed = bytes.toFixed(dp) + '';
  valFixed = zzb.strings.trimSuffix(valFixed, ['.00', '.0']);

  return valFixed + unitSeperateSpace + units[u];
};

/**
 * Removes the specified prefix (or any of multiple) from the start of a string.
 *
 * @param {string} target - The input string.
 * @param {string|string[]} prefix - A prefix or array of prefixes to remove.
 * @returns {string} - The trimmed string.
 */
_strings.prototype.trimPrefix = function(target, prefix) {
  target = zzb.types.toString(target);
  let arr = Array.isArray(prefix) ? prefix : [zzb.types.toString(prefix)];
  for (let ii = 0; ii < arr.length; ii++) {
    if (target.startsWith(arr[ii])) {
      return target.slice(arr[ii].length);
    }
  }
  return target;
};

/**
 * Removes the specified suffix (or any of multiple) from the end of a string.
 *
 * @param {string} target - The input string.
 * @param {string|string[]} suffix - A suffix or array of suffixes to remove.
 * @returns {string} - The trimmed string.
 */
_strings.prototype.trimSuffix = function(target, suffix) {
  target = zzb.types.toString(target);
  let arr = Array.isArray(suffix) ? suffix : [zzb.types.toString(suffix)];
  for (let ii = 0; ii < arr.length; ii++) {
    if (target.endsWith(arr[ii])) {
      return target.slice(0, -arr[ii].length);
    }
  }
  return target;
};

/**
 * Converts a duration in milliseconds into a human-readable format like "1d 2h 3m 4.56s".
 *
 * @param {number} milliseconds - The duration in milliseconds.
 * @returns {string} - Human-readable time interval.
 */
_strings.prototype.millisecondsTimeToHumanReadable = function (milliseconds) {
  let temp = milliseconds / 1000;
  const years = Math.floor(temp / 31536000);
  const days = Math.floor((temp %= 31536000) / 86400);
  const hours = Math.floor((temp %= 86400) / 3600);
  const minutes = Math.floor((temp %= 3600) / 60);
  const seconds = temp % 60;

  if (days || hours || seconds || minutes) {
    return (years ? years + 'y ' : '') +
      (days ? days + 'd ' : '') +
      (hours ? hours + 'h ' : '') +
      (minutes ? minutes + 'm ' : '') +
      Number.parseFloat(seconds).toFixed(2) + 's';
  }

  return '< 1s';
};

/**
 * Converts various value types into a boolean.
 *
 * Recognizes:
 *   - Booleans: true, false
 *   - Numbers: 1 (true), 0 (false)
 *   - Strings: "true", "yes", "1" → true; "false", "no", "0", "" → false
 *   - All else falls back to Boolean coercion
 *
 * @param {*} target - The value to evaluate.
 * @returns {boolean}
 */
_strings.prototype.toBool = function (target) {
  if (typeof target === 'boolean') {
    return target;
  }

  if (typeof target === 'number') {
    return target === 1;
  }

  if (!zzb.types.isStringNotEmpty(target)) {
    return false;
  }

  switch (target.toLowerCase().trim()) {
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'false':
    case 'no':
    case '0':
    case '':
      return false;
    default:
      return Boolean(target);
  }
};

/**
 * Parses the input into an integer, or returns 0 as fallback.
 * Optionally handles arrays of values if `forceArray` is true.
 *
 * @param {*} target - The value or array of values to parse.
 * @param {boolean} [forceArray=false] - Whether to always return an array.
 * @returns {number|number[]} - Parsed integer(s) or 0/array of 0s if parsing fails.
 */
_strings.prototype.parseIntOrZero = function (target, forceArray) {
  return this.parseTypeElse(target, 'int', 0, !!forceArray);
};

/**
 * Parses the input into a float, or returns 0.0 as fallback.
 * Optionally handles arrays of values if `forceArray` is true.
 *
 * @param {*} target - The value or array of values to parse.
 * @param {boolean} [forceArray=false] - Whether to always return an array.
 * @returns {number|number[]} - Parsed float(s) or 0.0/array of 0.0s if parsing fails.
 */
_strings.prototype.parseFloatOrZero = function (target, forceArray) {
  return this.parseTypeElse(target, 'float', 0.0, !!forceArray);
};

/**
 * Parses the input into a boolean, or returns false as fallback.
 * Optionally handles arrays of values if `forceArray` is true.
 *
 * @param {*} target - The value or array of values to parse.
 * @param {boolean} [forceArray=false] - Whether to always return an array.
 * @returns {boolean|boolean[]} - Parsed boolean(s) or false/array of false if parsing fails.
 */
_strings.prototype.parseBoolOrFalse = function (target, forceArray) {
  return this.parseTypeElse(target, 'bool', false, !!forceArray);
};

/**
 * Attempts to parse a value (or array of values) into a specified type, with fallback support.
 *
 * Normalizes the provided type using `zzb.types.normalizeType`, which supports aliases like:
 *   - 'int', 'integer' → 'integer'
 *   - 'str', 'string' → 'string'
 *   - 'bool', 'boolean' → 'boolean'
 *   - 'float', 'number' → 'float'
 *   - 'obj', 'object' → 'object'
 *   - 'null' → 'null'
 *
 * If the value is null or undefined, or if parsing fails, the fallback is used.
 *
 * If `forceArray` is true (or `target` is already an array), all values are parsed and an array is returned.
 * Otherwise, the function returns a single parsed value.
 *
 * @param {*} target - The value or array of values to parse.
 * @param {string} type - The desired type to parse into (e.g., "int", "string", "bool").
 * @param {*} fallback - A fallback value used when parsing fails or input is invalid.
 * @param {boolean} [forceArray=false] - Whether to always return an array of results.
 * @returns {*} - Parsed value(s) as the specified type, or fallback(s) if parsing fails.
 */
_strings.prototype.parseTypeElse = function (target, type, fallback, forceArray) {
  const makeArray = forceArray || zzb.types.isArray(target);
  const values = zzb.types.isArray(target) ? target.slice() : [target];

  const normalizedType = zzb.types.normalizeType(type);

  const output = values.map(val => {
    if (val === undefined || val === null) return fallback;

    let parsed;

    switch (normalizedType) {
      case 'integer':
        parsed = parseInt(val);
        return isNaN(parsed) ? fallback : parsed;

      case 'float':
        parsed = parseFloat(val);
        return isNaN(parsed) ? fallback : parsed;

      case 'boolean':
        return zzb.strings.toBool(val);

      case 'string':
        return zzb.types.isString(val) ? val : String(val ?? fallback);

      case 'object':
        return typeof val === 'object' ? val : fallback;

      case 'null':
        return null;

      case 'date':
      case 'date-iso':
        return zzb.types.isStringNotEmpty(val) ? val : fallback;

      default:
        // fallback for unrecognized types
        return zzb.types.isString(val) ? val : String(val ?? fallback);
    }
  });

  return makeArray ? output : output[0];
}

/**
 * Formats a string using a primary or fallback value.
 * If the `value` is not a non-empty string, the `fallback` is used instead.
 * If neither is valid, returns an empty string.
 *
 * @param {string} template - The string template to format (e.g., 'Hello, {0}!').
 * @param {string} value - The primary value to insert into the template.
 * @param {string} fallback - A fallback value used if the primary value is empty or invalid.
 * @returns {string} - The formatted string, or an empty string if both inputs are empty.
 */
_strings.prototype.formatElseEmpty = function (template, value, fallback) {
  let finalValue = value
  if (!zzb.types.isStringNotEmpty(finalValue)) {
    finalValue = fallback
    if (!zzb.types.isStringNotEmpty(finalValue)) {
      return ''
    }
  }
  return zzb.strings.format(template, finalValue)
}

exports.strings = _strings
