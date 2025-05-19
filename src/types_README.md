# `zzb.types` – Type Utilities and Data Helpers

The `zzb.types` utility provides a suite of **type-checking**, **comparison**, **string-conversion**, and **object manipulation** helpers. It is designed to simplify data validation, normalization, and sorting logic across the `zzb` framework.

This module is accessible via:

```js
zzb.types
```

---

## Highlights

* Type checks: array, object, string, number, boolean, digit, etc.
* Deep merging of objects
* HTML escaping
* String coercion with safeguards
* Comparison of values (including IPs)
* Type normalization helpers

---

## Object Manipulation

### `types.merge(defaults, overrides)`

Performs a deep merge of two objects, giving priority to `overrides`.

```js
const result = zzb.types.merge({a: 1}, {b: 2});
// → { a: 1, b: 2 }
```

---

## Type Checking Helpers

| Method                   | Returns `true` if…                                  |
| ------------------------ | --------------------------------------------------- |
| `isArray(val)`           | Value is an array                                   |
| `isArrayHasRecords(val)` | Value is a non-empty array                          |
| `isObject(val)`          | Value is a plain object (not null/array)            |
| `isString(val)`          | Value is of type string                             |
| `isStringNotEmpty(val)`  | Value is a non-empty, trimmed string                |
| `isStringEmpty(val)`     | Value is empty or whitespace-only string            |
| `isNumber(val)`          | Value is a number (excludes `NaN`)                  |
| `isBoolean(val)`         | Value is a boolean                                  |
| `isFunction(val)`        | Value is a function                                 |
| `isDigit(val)`           | Value is a numeric digit (0–9), as string or number |

```js
zzb.types.isDigit('5'); // true
zzb.types.isDigit(3);   // true
zzb.types.isDigit('42'); // false
```

---

## String Utilities

### `toString(val)` and `baseToString(val)`

Converts various types to strings, defaulting to `''` for null or undefined.

```js
zzb.types.toString(42);     // "42"
zzb.types.toString(null);   // ""
```

### `escapeHtml(unsafe)`

Escapes HTML-special characters:

```js
zzb.types.escapeHtml('<div>') // "&lt;div&gt;"
```

---

## Number Utilities

### `truncate(num, decimal)`

Truncates (not rounds) a number to a fixed number of decimal places.

```js
zzb.types.truncate(1.98765, 2);  // "1.98"
```

---

## Value Comparison

### `compare(a, b, isDesc)`

Performs safe comparison of two values with optional descending logic. Handles `null` and `undefined` cleanly.

### `compareValues(a, b, type)`

Compare based on type:

| `type`               | Behavior                           |
| -------------------- | ---------------------------------- |
| `int`                | Compares as integers               |
| `float`              | Compares as floats                 |
| `ip`, `ipv4`, `ipv6` | Compares as IP addresses           |
| `text` (default)     | Case-insensitive string comparison |

---

## IP Address Comparison

Compare IPv4 and IPv6 addresses, including mixed comparisons (IPv4 is treated as less than IPv6).

```js
zzb.types.compareIP('10.0.0.1', '10.0.0.2'); // -1
zzb.types.compareIP('fe80::1', '10.0.0.1');  // 1
```

Internally uses:

* `compareIPv4(a, b)`
* `compareIPv6(a, b)`
* `detectIPType(val)` to detect `ipv4`, `ipv6`, or `unknown`

---

## Type Normalization

### `normalizeType(str)`

Maps common aliases to standard internal types.

| Alias             | Normalized To |
| ----------------- | ------------- |
| `int`, `integer`  | `"integer"`   |
| `str`, `string`   | `"string"`    |
| `bool`, `boolean` | `"boolean"`   |
| `number`, `float` | `"float"`     |
| `obj`, `object`   | `"object"`    |
| `null`            | `"null"`      |

```js
zzb.types.normalizeType('bool'); // "boolean"
```

---

## Best Practices

* Use `merge()` for safe option merging in plugins/components.
* Prefer `toString()` when coercing unknown values to avoid `undefined`.
* Use `compareValues()` and `normalizeType()` for custom sort implementations.
* Use `escapeHtml()` when injecting content into the DOM to avoid XSS.

---

## Example: Sorting a Mixed-Type Table

```js
rows.sort((a, b) => {
  return zzb.types.compareValues(a.score, b.score, 'float');
});
```

Or for IP addresses:

```js
rows.sort((a, b) => {
  return zzb.types.compareValues(a.ip, b.ip, 'ip');
});
```
