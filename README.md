# zazzy-browser (zzb)

A collection of general-purpose browser utilities used as higher-level building-blocks to create [Bootstrap v3](http://getbootstrap.com/) websites and assist in client-server communications. 

Zazzy Browser depends on [jQuery](https://jquery.com/), [lodash](https://github.com/lodash/lodash) and [BootstrapDialog](https://github.com/nakupanda/bootstrap3-dialog).

Include in your html page:

```html
<script src="/zzb.js"></script>
```

Zazzy Browser gets automatically loaded into the global cache and is referenced via `zzb`.

* zzb.zzNode: tree operations
* zzb.types: data type operations: supplements lodash
* zzb.uuid: uuid functions
* zzb.strings: string functions
* zzb.ui: ui functions
* zzb.forms: form functions
* zzb.dialogs: dialog functions using `BootstrapDialog`
* zzb.rob: uniform return object (rob) functions
* zzb.ajax: ajax helpers with promises
* zzb.status: gets status info, such as user, page, role info which has been set prior in sessionStorage otherwise try getting from the server

## [MIT Licensed](LICENSE)
