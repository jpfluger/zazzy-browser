# zazzy-browser (`zzb`)

**Zazzy Browser** (`zzb`) is a collection of modular, high-level browser utilities designed to simplify client-server interactions and user interface behaviors. It is built using **vanilla JavaScript**—with no dependencies on libraries like [jQuery](https://jquery.com/) or [Lodash](https://lodash.com/).

The utilities are designed to complement [Bootstrap 5](https://getbootstrap.com/) and support modern, declarative HTML development through attribute-driven interaction patterns.

> For legacy support, versions prior to `2.0.0` are maintained in the `version1` branch. Those versions rely on jQuery, Lodash, and older Bootstrap versions.

---

## Features

The `zzb` global object is automatically available in the browser and includes the following modules:

### Core Modules

* [zzb.types](src/types_README.md) – Utilities for type-checking, value parsing, comparison, and normalization.
* `zzb.uuid` – UUID generation utilities.
* `zzb.strings` – String manipulation helpers.
* `zzb.dom` – Safe DOM accessors and attribute utilities.
* `zzb.dialogs` – Dialog and modal rendering, fully compatible with Bootstrap 5.
* `zzb.perms` – Permission and access control helpers.
* `zzb.rob` – "Return Object Block" (ROB) utilities for uniform API responses.
* `zzb.ajax` – Lightweight AJAX wrappers using Promises.

### UI Modules (loaded via `zzb.ui`)

* `zzb.time` – Interval-based refresh controls, smart data caching, and auto-updating widgets.
* [zzb.zaction](src/zaction_README.md) – Declarative event binding and DOM-server interaction via `za-*` attributes.
* [zzb.zui](src/zui_README.md) – Utilities for enhanced UI rendering, input tracking, and layout helpers.

---

## CSS Integration

The [`zzb.zui`](zui_README.md) module includes optional splitter functionality for resizable side panels, triggered by elements with the `.zsplitter` class. This CSS is intended to work alongside Bootstrap’s flex layout system:

```css
.zsplitter {
  flex: none;
  width: 17px;
}
.zsplitter a {
  color: #ADFF2F;
}
.zsplitter a:hover {
  color: #84c01b;
}
.zsplitter-resize {
  cursor: col-resize;
}
```

---

## Installation

Include the library in your HTML via:

```html
<script src="/dist/zzb.js"></script>
```

To include UI modules such as `zzb.zaction` or `zzb.zui`, use:

```html
<script src="/dist/zzb.ui.js"></script>
```

---

## Custom Setup

To customize the initialization (e.g., to register custom handlers or defer setup), use the `window.zzbReady` hook. See the full example in [`zaction_README.md`](src/zaction_README.md#custom-initialization-example-html-override).

---

## Development

### Build

To generate the distribution files (including the minified bundle):

```bash
npm run dist
```

### Testing

To run UI-related tests (e.g., dialogs), open `test/index-test.html` in a browser.

To execute unit tests with Mocha:

```bash
npm test
```

---

## License

[MIT Licensed](LICENSE)
© Your Company / Project Name
