// ---------------------------------------------------
// strings
// ---------------------------------------------------

var _strings = function () {}

function ValueError (message) {
  var err = new Error(message)
  err.name = 'ValueError'
  return err
}

// https://github.com/davidchambers/string-format
// create :: Object -> String,*... -> String
// zzb.strings.format('{0}, you have {1} mushroom{2}', 'Piggy', 2, 's')
// zzb.strings.format('{0}, you have {1} mushroom{2}', ['Piggy', 2, 's'])
// zzb.strings.format('{name}, you have {number} mushroom{ending}', {name: 'Piggy', number: 2, ending: 's'})
var formatString = function (transformers) {
  return function (template) {
    var args = Array.prototype.slice.call(arguments, 1)
    var idx = 0
    var state = 'UNDEFINED'

    if (Array.isArray(args) && args.length > 0 && Array.isArray(args[0])) {
      var tmpArr = args[0].map(function (s) {
        return s
      })
      args = tmpArr
    }

    return template.replace(
      /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
      function (match, literal, _key, xf) {
        if (literal != null) {
          return literal
        }
        var key = _key
        if (key.length > 0) {
          if (state === 'IMPLICIT') {
            throw ValueError('cannot switch from ' +
              'implicit to explicit numbering')
          }
          state = 'EXPLICIT'
        } else {
          if (state === 'EXPLICIT') {
            throw ValueError('cannot switch from ' +
              'explicit to implicit numbering')
          }
          state = 'IMPLICIT'
          key = String(idx)
          idx += 1
        }

        //  1.  Split the key into a lookup path.
        //  2.  If the first path component is not an index, prepend '0'.
        //  3.  Reduce the lookup path to a single result. If the lookup
        //      succeeds the result is a singleton array containing the
        //      value at the lookup path; otherwise the result is [].
        //  4.  Unwrap the result by reducing with '' as the default value.
        var path = key.split('.')
        var value = (/^\d+$/.test(path[0]) ? path : ['0'].concat(path))
          .reduce(function (maybe, key) {
            return maybe.reduce(function (_, x) {
              return x != null && key in Object(x) ? [typeof x[key] === 'function' ? x[key]() : x[key]] : []
            }, [])
          }, [args])
          .reduce(function (_, x) { return x }, '')

        if (xf == null) {
          return value
        } else if (Object.prototype.hasOwnProperty.call(transformers, xf)) {
          return transformers[xf](value)
        } else {
          throw ValueError('no transformer named "' + xf + '"')
        }
      }
    )
  }
}

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
_strings.prototype.formatEmpty = function (template) {
  var args = Array.prototype.slice.call(arguments, 1)
  if (Array.isArray(args)) {
    return template.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] !== 'undefined'
        ? args[number]
        : '' // match
    })
  } else {
    return template.replace(/{((?:(?=([^{}]+|{{[^}]*}}))\2)*)}/g, function (match, key) {
      // console.log(match + '  ' + key)
      return (args.length > 0 && args[0][key]) ? args[0][key] : '' // match
    })
  }
}

/**
 * zzb.strings.appendIfMoreThan
 *
 * Usage:
 *  zzb.strings.appendIfMoreThan('some string', '...', 3)
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
_strings.prototype.appendIfMoreThan = function (str, charsToAppend, ifMoreCharCount) {
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
 *  zzb.strings.joinArrToCommas([{name:'a',{name:'b'},{name:'c'}], 'name')
 * Produces
 *  a, b, c
 *
 * @param arr
 * @returns {String}
 */
_strings.prototype.joinArrToCommas = function (arr, fieldName) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return ''
  }
  return arr.map(arr, function (obj, idx) {
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

/**
 * zzb.strings.toPlural
 *
 * Usage:
 *  zzb.strings.toPlural('dog', 1, options)
 *  zzb.strings.toPlural('dog', 2, options)
 * Produces
 *  dog
 *  dogs
 *
 * Appends an s or user-defined suffix (options.suffix) to a word if the number is not 1 or -1
 * @param str
 * @param charsToAppend
 * @param ifMoreCharCount
 * @returns {String}
 */
_strings.prototype.toPlural = function (word, number, options) {
  options = zzb.types.merge({ forcePlural: false, suffix: null }, options)

  if ((number === 1 || number === -1) && !options.forcePlural) {
    return word
  }

  if (options.suffix) {
    return word + options.suffix
  } else {
    return word + 's'
  }
}

_strings.prototype.capitalize = function (target) {
  if (zzb.types.isStringNotEmpty(target)) {
    return target.charAt(0).toUpperCase() + string.slice(1);
  }
  return ''
}

_strings.prototype.toFirstCapitalEndPeriod = function (target) {
  if (zzb.types.isStringNotEmpty(target)) {
    target = target.trim()
    target = zzb.strings.capitalize(target)
    if (!target.endsWith(target, '.')) {
      target += '.'
    }
  }
  return target
}

var sizeUnitsFormatNameSingle = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
var sizeUnitsFormatNameDouble = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
var sizeUnitsFormatNameFull = ['Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte', 'Petabyte', 'Exabyte', 'Zettabyte', 'Yottabyte']
var sizeUnitsFormatNameEIC = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

// From https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/10420404
//      https://ux.stackexchange.com/questions/13815/files-size-units-kib-vs-kb-vs-kb
// We standardized the above, somewhat, with https://github.com/cloudfoundry/bytefmt
// Also only divisions are with 1024 and NOT 1000
_strings.prototype.sizeToHumanReadable = function (bytes, unitsFormat, noSizeUnitSeparation, dp) {
  if (!zzb.types.isStringNotEmpty(unitsFormat)) {
    unitsFormat = 'single'
  }
  var unitSeperateSpace = ' '
  if (noSizeUnitSeparation === true) {
    unitSeperateSpace = ''
  }
  if (!dp) {
    dp = 1
  }

  var thresh = 1024 // si ? 1000 : 1024

  var units
  var unitsBytes = 'B'
  switch (unitsFormat.toLowerCase()) {
    case 'full':
      units = sizeUnitsFormatNameFull
      unitsBytes = 'Bytes'
      break
    case 'double':
      units = sizeUnitsFormatNameDouble
      break
    case 'eic':
      units = sizeUnitsFormatNameEIC
      break
    default: // single
      units = sizeUnitsFormatNameSingle
      break
  }

  if (Math.abs(bytes) < thresh) {
    return bytes + unitSeperateSpace + unitsBytes
  }

  // var units = si
  //   ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  //   : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  var u = -1
  // var r = 10 ** dp
  var r = Math.pow(dp, 10)

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  var valFixed = bytes.toFixed(dp) + ''
  valFixed = zzb.strings.trimSuffix(valFixed, ['.00', '.0'])

  return valFixed + unitSeperateSpace + units[u]
}

_strings.prototype.trimPrefix = function(target, prefix) {
  target = zzb.types.toString(target)
  var arr = []
  if (!zzb.types.isArray(prefix)) {
    arr.push(zzb.types.toString(prefix))
  } else {
    arr = prefix
  }
  for (var ii = 0; ii < arr.length; ii++) {
    if (target.startsWith(arr[ii])) {
      return target.slice(arr[ii])
    }
  }
  return target
}

_strings.prototype.trimSuffix = function(target, suffix) {
  target = zzb.types.toString(target)
  var arr = []
  if (!zzb.types.isArray(suffix)) {
    arr.push(zzb.types.toString(suffix))
  } else {
    arr = suffix
  }
  for (var ii = 0; ii < arr.length; ii++) {
    if (target.endsWith(arr[ii])) {
      return target.slice(0, arr[ii].length * -1)
    }
  }
  return target
}

// https://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
_strings.prototype.millisecondsTimeToHumanReadable = function (milliseconds) {
  var temp = milliseconds / 1000
  var years = Math.floor(temp / 31536000)
  var days = Math.floor((temp %= 31536000) / 86400)
  var hours = Math.floor((temp %= 86400) / 3600)
  var minutes = Math.floor((temp %= 3600) / 60)
  var seconds = temp % 60

  if (days || hours || seconds || minutes) {
    return (years ? years + 'y ' : '') +
      (days ? days + 'd ' : '') +
      (hours ? hours + 'h ' : '') +
      (minutes ? minutes + 'm ' : '') +
      Number.parseFloat(seconds).toFixed(2) + 's'
  }

  return '< 1s'
}

_strings.prototype.toBool = function (target) {
  if (!zzb.types.isNonEmptyString(target)) {
    return (target)
  }
  switch(target.toLowerCase().trim()){
    case "true":
    case "yes":
    case "1":
      return true;

    case "false":
    case "no":
    case "0":
    case null:
      return false;

    default:
      return Boolean(target);
  }
}

_strings.prototype.parseIntOrZero = function (target, forceArray) {
  return zzb.strings.parseTypeElse(target, 'int', 0, forceArray ? true : false)
}

_strings.prototype.parseFloatOrZero = function (target, forceArray) {
  return zzb.strings.parseTypeElse(target, 'float', 0, forceArray ? true : false)
}

_strings.prototype.parseBoolOrFalse = function (target, forceArray) {
  return zzb.strings.parseTypeElse(target, 'bool', false, forceArray ? true : false)
}

_strings.prototype.parseTypeElse = function (target, type, elseif, forceArray) {
  let makeArray = (forceArray || zzb.types.isArray(target))
  if (target === undefined || target === null) {
    if (makeArray) {
      return []
    }
    return elseif
  } else if (!zzb.types.isArray(target)) {
    target = [target]
  }
  for (let ii = 0; ii < target.length; ii++) {
    if (target[ii] == undefined || target[ii] === null) {
      target[ii] = elseif
    } else {
    // if (zzb.types.isString(target[ii])) {
    //   let isEmpty = !zzb.types.isStringNotEmpty(target[ii])
      let convertNumber = false
      switch (type) {
        case 'int':
          parsed = parseInt(target[ii])
          convertNumber = true
          break
        case 'float':
          // parsed = isEmpty ? elseif : parseFloat(target[ii])
          parsed = parseFloat(target[ii])
          convertNumber = true
          break
        case 'bool':
          target[ii] = zzb.strings.toBool(target[ii])
          break
        default:
          if (!zzb.types.isString(target[ii])) {
            if (!zzb.types.isArray(target[ii]) && !zzb.types.isObject(target[ii])) {
              target[ii] += ''
            }
          }
          break
      }
      if (convertNumber) {
        target[ii] = isNaN(parsed) ? elseif : parsed
      }
    }
  }
  if (makeArray) {
    return target
  }
  return target[0]
}

exports.strings = _strings
