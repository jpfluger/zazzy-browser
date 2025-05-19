/* global describe, it */
var assert = require('assert');
var zzbLoader = require('./zzb-tester.js').zzbLoader;

describe('Validate zzb.types methods', function () {
  var zzb = zzbLoader();

  describe('baseToString', function () {
    it('should return same string when input is already a string', function () {
      assert.strictEqual(zzb.types.baseToString('hello'), 'hello');
    });

    it('should convert numbers to strings', function () {
      assert.strictEqual(zzb.types.baseToString(123), '123');
      assert.strictEqual(zzb.types.baseToString(-456), '-456');
      assert.strictEqual(zzb.types.baseToString(0), '0');
      assert.strictEqual(zzb.types.baseToString(-0), '0');
    });

    it('should return empty string for null and undefined', function () {
      assert.strictEqual(zzb.types.baseToString(null), '');
      assert.strictEqual(zzb.types.baseToString(undefined), '');
    });

    it('should convert boolean values correctly', function () {
      assert.strictEqual(zzb.types.baseToString(true), 'true');
      assert.strictEqual(zzb.types.baseToString(false), 'false');
    });

    it('should convert objects to strings', function () {
      assert.strictEqual(zzb.types.baseToString({}), '[object Object]');
      assert.strictEqual(zzb.types.baseToString({ key: 'value' }), '[object Object]');
    });

    it('should convert arrays to strings', function () {
      assert.strictEqual(zzb.types.baseToString([]), '');
      assert.strictEqual(zzb.types.baseToString([1, 2, 3]), '1,2,3');
    });
  });

  describe('merge', function () {
    it('should deeply merge two objects', function () {
      const defaults = { a: 1, nested: { x: 1, y: 2 } };
      const options = { b: 2, nested: { y: 3, z: 4 } };
      const merged = zzb.types.merge(defaults, options);
      assert.deepStrictEqual(merged, { a: 1, b: 2, nested: { x: 1, y: 3, z: 4 } });
    });

    it('should handle merging with empty objects', function () {
      assert.deepStrictEqual(zzb.types.merge({}, { a: 1 }), { a: 1 });
      assert.deepStrictEqual(zzb.types.merge({ a: 1 }, {}), { a: 1 });
    });

    it('should handle non-object arguments gracefully', function () {
      assert.deepStrictEqual(zzb.types.merge(null, { a: 1 }), { a: 1 });
      assert.deepStrictEqual(zzb.types.merge({ a: 1 }, null), { a: 1 });
    });
  });

  describe('truncate', function () {
    it('should truncate number to specified decimal places', function () {
      assert.strictEqual(zzb.types.truncate(123.4567, 2), '123.45');
      assert.strictEqual(zzb.types.truncate(123.4, 2), '123.4');
    });

    it('should return integer as-is when no decimal point', function () {
      assert.strictEqual(zzb.types.truncate(123, 2), '123');
    });

    it('should return integer part if decimal is zero', function () {
      assert.strictEqual(zzb.types.truncate(123.456, 0), '123');
    });

    it('should handle negative numbers correctly', function () {
      assert.strictEqual(zzb.types.truncate(-123.4567, 3), '-123.456');
    });

    it('should return empty string for invalid inputs', function () {
      assert.strictEqual(zzb.types.truncate('abc', 2), '');
      assert.strictEqual(zzb.types.truncate(123.456, -1), '');
    });
  });

  describe('escapeHtml', function () {
    it('should escape special HTML characters', function () {
      assert.strictEqual(
        zzb.types.escapeHtml('<div>"Hello" & \'World\'</div>'),
        '&lt;div&gt;&quot;Hello&quot; &amp; &#039;World&#039;&lt;/div&gt;'
      );
    });

    it('should return empty string for null or undefined input', function () {
      assert.strictEqual(zzb.types.escapeHtml(null), '');
      assert.strictEqual(zzb.types.escapeHtml(undefined), '');
    });

    it('should return empty string for non-string inputs', function () {
      assert.strictEqual(zzb.types.escapeHtml(123), '');
      assert.strictEqual(zzb.types.escapeHtml({}), '');
    });

    it('should return input as-is if no characters need escaping', function () {
      assert.strictEqual(zzb.types.escapeHtml('hello'), 'hello');
    });
  });

  describe('toString', function () {
    it('should convert various inputs to primitive strings', function () {
      assert.strictEqual(zzb.types.toString('test'), 'test');
      assert.strictEqual(zzb.types.toString(123), '123');
      assert.strictEqual(zzb.types.toString(null), '');
      assert.strictEqual(zzb.types.toString(undefined), '');
      assert.strictEqual(zzb.types.toString(true), 'true');
    });
  });

  describe('isArray', function () {
    it('should correctly identify arrays', function () {
      assert.strictEqual(zzb.types.isArray([1, 2, 3]), true);
      assert.strictEqual(zzb.types.isArray('string'), false);
      assert.strictEqual(zzb.types.isArray({}), false);
    });
  });

  describe('isArrayHasRecords', function () {
    it('should correctly identify non-empty arrays', function () {
      assert.strictEqual(zzb.types.isArrayHasRecords([1]), true);
      assert.strictEqual(zzb.types.isArrayHasRecords([]), false);
      assert.strictEqual(zzb.types.isArrayHasRecords(null), false);
    });
  });

  describe('isObject', function () {
    it('should correctly identify plain objects', function () {
      assert.strictEqual(zzb.types.isObject({}), true);
      assert.strictEqual(zzb.types.isObject(null), false);
      assert.strictEqual(zzb.types.isObject([]), false);
      assert.strictEqual(zzb.types.isObject('string'), false);
    });
  });

  describe('isNumber', function () {
    it('should correctly identify valid numbers', function () {
      assert.strictEqual(zzb.types.isNumber(123), true);
      assert.strictEqual(zzb.types.isNumber(0), true);
      assert.strictEqual(zzb.types.isNumber(NaN), false);
      assert.strictEqual(zzb.types.isNumber('123'), false);
    });
  });

  describe('isStringNotEmpty', function () {
    it('should correctly identify non-empty strings', function () {
      assert.strictEqual(zzb.types.isStringNotEmpty('hello'), true);
      assert.strictEqual(zzb.types.isStringNotEmpty('   '), false);
      assert.strictEqual(zzb.types.isStringNotEmpty(''), false);
      assert.strictEqual(zzb.types.isStringNotEmpty(null), false);
    });
  });

  describe('isStringEmpty', function () {
    it('should correctly identify empty or whitespace-only strings', function () {
      assert.strictEqual(zzb.types.isStringEmpty(''), true);
      assert.strictEqual(zzb.types.isStringEmpty('   '), true);
      assert.strictEqual(zzb.types.isStringEmpty('hello'), false);
      assert.strictEqual(zzb.types.isStringEmpty(null), false);
    });
  });

  describe('isString', function () {
    it('should correctly identify string types', function () {
      assert.strictEqual(zzb.types.isString(''), true);
      assert.strictEqual(zzb.types.isString('test'), true);
      assert.strictEqual(zzb.types.isString(null), false);
      assert.strictEqual(zzb.types.isString(123), false);
    });
  });

  describe('isFunction', function () {
    it('should correctly identify function types', function () {
      assert.strictEqual(zzb.types.isFunction(function(){}), true);
      assert.strictEqual(zzb.types.isFunction(() => {}), true);
      assert.strictEqual(zzb.types.isFunction(null), false);
      assert.strictEqual(zzb.types.isFunction({}), false);
    });
  });

  describe('isBoolean', function () {
    it('should correctly identify boolean types', function () {
      assert.strictEqual(zzb.types.isBoolean(true), true);
      assert.strictEqual(zzb.types.isBoolean(false), true);
      assert.strictEqual(zzb.types.isBoolean(0), false);
      assert.strictEqual(zzb.types.isBoolean('true'), false);
    });
  });

  describe('compare', function () {
    it('should return 0 when values are strictly equal', function () {
      assert.strictEqual(zzb.types.compare(1, 1), 0);
      assert.strictEqual(zzb.types.compare('a', 'a'), 0);
    });

    it('should correctly compare numbers in ascending order (default)', function () {
      assert.strictEqual(zzb.types.compare(2, 1), 1);
      assert.strictEqual(zzb.types.compare(1, 2), -1);
    });

    it('should correctly compare numbers in descending order', function () {
      assert.strictEqual(zzb.types.compare(2, 1, true), -1);
      assert.strictEqual(zzb.types.compare(1, 2, true), 1);
    });

    it('should correctly compare strings in ascending order', function () {
      assert.strictEqual(zzb.types.compare('b', 'a'), 1);
      assert.strictEqual(zzb.types.compare('a', 'b'), -1);
    });

    it('should correctly compare strings in descending order', function () {
      assert.strictEqual(zzb.types.compare('b', 'a', true), -1);
      assert.strictEqual(zzb.types.compare('a', 'b', true), 1);
    });

    it('should handle mixed-type comparisons predictably', function () {
      assert.strictEqual(zzb.types.compare('2', 1), 1); // string vs. number comparison
      assert.strictEqual(zzb.types.compare(1, '2'), -1);
    });

    it('should correctly handle edge cases with special values', function () {
      assert.strictEqual(zzb.types.compare(null, undefined), 1);
      assert.strictEqual(zzb.types.compare(undefined, null), -1);
      assert.strictEqual(zzb.types.compare(null, null), 0);
      assert.strictEqual(zzb.types.compare(undefined, undefined), 0);
      assert.strictEqual(zzb.types.compare(null, 0), -1);
      assert.strictEqual(zzb.types.compare(undefined, 0), -1);
    });
  });
  describe('compareValues', function () {
    it('should compare integers numerically', function () {
      assert.strictEqual(zzb.types.compareValues('5', '3', 'int'), 2);
      assert.strictEqual(zzb.types.compareValues('3', '5', 'int'), -2);
      assert.strictEqual(zzb.types.compareValues('5', '5', 'int'), 0);
    });

    it('should compare floats numerically', function () {
      assert.strictEqual(zzb.types.compareValues('2.5', '2.0', 'float'), 0.5);
      assert.strictEqual(zzb.types.compareValues('1.2', '3.4', 'float'), -2.2);
    });

    it('should compare text case-insensitively', function () {
      assert.strictEqual(zzb.types.compareValues('apple', 'Banana', 'text') < 0, true);
      assert.strictEqual(zzb.types.compareValues('Carrot', 'carrot', 'text'), 0);
    });

    it('should default to text comparison for unknown type', function () {
      assert.strictEqual(zzb.types.compareValues('a', 'b', 'unknown') < 0, true);
    });

    it('should compare IP addresses appropriately', function () {
      assert.strictEqual(zzb.types.compareValues('1.1.1.1', '1.1.1.2', 'ip'), -1);
      assert.strictEqual(zzb.types.compareValues('fe80::1', 'fe80::2', 'ipv6'), -1);
    });
  });

  describe('detectIPType', function () {
    it('should detect ipv4 format', function () {
      assert.strictEqual(zzb.types.detectIPType('192.168.0.1'), 'ipv4');
    });

    it('should detect ipv6 format', function () {
      assert.strictEqual(zzb.types.detectIPType('fe80::1'), 'ipv6');
    });

    it('should return unknown for malformed input', function () {
      assert.strictEqual(zzb.types.detectIPType('not-an-ip'), 'unknown');
    });
  });

  describe('compareIPv4', function () {
    it('should return -1 if a < b', function () {
      assert.strictEqual(zzb.types.compareIPv4('192.168.0.1', '192.168.0.2'), -1);
    });

    it('should return 1 if a > b', function () {
      assert.strictEqual(zzb.types.compareIPv4('10.0.0.2', '10.0.0.1'), 1);
    });

    it('should return 0 if a equals b', function () {
      assert.strictEqual(zzb.types.compareIPv4('127.0.0.1', '127.0.0.1'), 0);
    });

    it('should treat missing or invalid octets as zero', function () {
      assert.strictEqual(zzb.types.compareIPv4('10.0', '10.0.0.0'), 0);
    });
  });

  describe('compareIPv6', function () {
    it('should compare expanded ipv6 correctly', function () {
      assert.strictEqual(zzb.types.compareIPv6('2001:0db8::1', '2001:0db8::2'), -1);
    });

    it('should return 0 if both are equivalent', function () {
      assert.strictEqual(zzb.types.compareIPv6('2001:db8::1', '2001:0db8:0:0:0:0:0:1'), 0);
    });

    it('should correctly order multiple segments', function () {
      assert.strictEqual(zzb.types.compareIPv6('2001:db8::1', '2001:db8::ffff'), -1);
    });
  });

  describe('compareIP', function () {
    it('should compare two ipv4 addresses', function () {
      assert.strictEqual(zzb.types.compareIP('10.0.0.1', '10.0.0.2'), -1);
    });

    it('should compare two ipv6 addresses', function () {
      assert.strictEqual(zzb.types.compareIP('fe80::1', 'fe80::2'), -1);
    });

    it('should treat ipv4 as less than ipv6', function () {
      assert.strictEqual(zzb.types.compareIP('10.0.0.1', 'fe80::1'), -1);
      assert.strictEqual(zzb.types.compareIP('fe80::1', '10.0.0.1'), 1);
    });
  });

  describe('isDigit', function () {
    it('should return true for numbers between 0 and 9', function () {
      assert.strictEqual(zzb.types.isDigit(0), true);
      assert.strictEqual(zzb.types.isDigit(5), true);
      assert.strictEqual(zzb.types.isDigit(9), true);
    });

    it('should return false for numbers outside 0-9', function () {
      assert.strictEqual(zzb.types.isDigit(10), false);
      assert.strictEqual(zzb.types.isDigit(-1), false);
      assert.strictEqual(zzb.types.isDigit(1.5), false);
    });

    it('should return false for non-digit strings', function () {
      assert.strictEqual(zzb.types.isDigit('a'), false);
      assert.strictEqual(zzb.types.isDigit(''), false);
      assert.strictEqual(zzb.types.isDigit('10'), false);
    });

    it('should return false for other types', function () {
      assert.strictEqual(zzb.types.isDigit(null), false);
      assert.strictEqual(zzb.types.isDigit(undefined), false);
      assert.strictEqual(zzb.types.isDigit({}), false);
    });
  });
});
