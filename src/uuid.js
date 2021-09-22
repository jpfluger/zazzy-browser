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
 * @see https://dirask.com/posts/JavaScript-UUID-function-in-Vanilla-JS-1X9kgD
 * @returns {String} the generated uuid
 */
_uuid.prototype.newV4 = function () {
  function generateNumber(limit) {
    var value = limit * Math.random();
    return value | 0;
  }

  function generateX() {
    var value = generateNumber(16);
    return value.toString(16);
  }

  function generateXes(count) {
    var result = '';
    for(var i = 0; i < count; ++i) {
      result += generateX();
    }
    return result;
  }

  function generateVariant() {
    var value = generateNumber(16);
    var variant =  (value & 0x3) | 0x8;
    return variant.toString(16);
  }

  return generateXes(8)
    + '-' + generateXes(4)
    + '-' + '4' + generateXes(3)
    + '-' + generateVariant() + generateXes(3)
    + '-' + generateXes(12)
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

exports.uuid = _uuid
