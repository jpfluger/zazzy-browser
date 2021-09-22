# zazzy-browser (zzb)

A collection of general-purpose browser utilities used as higher-level building-blocks to assist in client-server communications.

`zzb` has no dependencies on [jquery](https://jquery.com/) or [lodash](https://lodash.com/)), unlike the prior version.
Dialogs have been retained and follow [Bootstrap5](https://getbootstrap.com/docs/5.1/components/modal/) html and css.  

> Note: versions < 2.0.0 has been placed in branch `version1`. The older versions depend on jquery, lodash and bootstrap.

## What is inside

`zzb` gets automatically loaded into the browser global cache and is referenced via `zzb`.

* zzb.types: data type operations
* zzb.uuid: uuid functions
* zzb.strings: string functions
* zzb.rob: uniform return object (rob) functions
* zzb.ajax: ajax helpers with promises
* zzb.dialogs: compatible with bootstrap5
* zzb.perms: permissions
* zzb.dom: helpful dom functions

## Usage

Include in your html page:

```html
<script src="dist/zzb.js"></script>
```

## Build

Run the `npm` script to generate javascript distribution files, including the minified version.

```bash
$ npm run dist
```

## Testing

For dialog testing, open `test/index-test.html` in a browser. You should see a dialog pop-up.

Mocha tests can be run via `npm`.

```bash
$ npm test
```

## [MIT Licensed](LICENSE)
