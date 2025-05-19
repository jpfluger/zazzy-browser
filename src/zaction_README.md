# Zazzy Action (zaction.js)

ZAction is a flexible, attribute-driven JavaScript utility for declaratively managing client-server interactions, DOM updates, dialog behavior, and form inputs in dynamic web applications. It lets developers build reactive UI behaviors using HTML attributes—minimizing direct JavaScript.

---

## Usage

### Initialization
1. Add the `zaction` class to an element to enable automatic event binding.
    - This happens before the HTML is displayed.
    - New content added later will also be observed.
    - To disable this behavior at startup, add `no-autoload-zactions` to the `<body>` tag.

```html
<body class="no-autoload-zactions">
```

2. Use `zload-action` on elements to load content before the page is shown.

---

## Attribute Reference

### Event Control
- `zcall`: The DOM event to listen for (e.g., `click`, `change`). Defaults to `click`.
- `za-event`: The event name used in the internal handler and optionally sent to the server. Some events do not trigger server calls (e.g., drag-drop).
    - Built-in `za-event` values:
        - `zurl-dialog`: Opens a dialog populated with server response.
        - `zurl-confirm`: Prompts a confirmation dialog before executing the action.
        - `zurl-replace`: Replaces the HTML content of a target element.
        - `zurl-search`: Periodically refreshes a section of the page using caching.
        - `zurl-action`: Executes a standard zaction POST without UI side effects.
        - `zurl-field-update`: Updates form or field values with server-provided key-value pairs.
        - `zurl-blob-download`: Initiates download of binary data (e.g., PDFs).
        - `zurl-nav-tab`: Switches to a tab UI view.
        - `zurl-nav-self`: Replaces the current page/view with a new route.
- `zclosest`: Traverse upward to find a target element, merging in its attributes. Existing attributes are not overwritten.

### Server Communication
- `zurl`: Server endpoint URL. May include placeholders like `:event`, `:mod`, `:zid`, `:zidParent` that get dynamically replaced by attributes `za-event`, `za-mod`, `za-zid`, `za-zid-parent`.
    - Valid examples:
        - `https://example.com/path/to/page`
        - `https://example.com/:event/:zid/:mod`
        - `https://example.com/path/to/page/:zidParent`
        - `https://example.com/path/to/pdfs/:zid/:blobName`
- `za-mod`: Action modifier sent as `zaction.mod` (e.g., `delete`, `create`, `edit`).
- `za-method`: Request type to use: `getJSON`, `postJSON`, `postFORM`. Default: `postJSON`.
- `za-ignore-zurl`: If `true`, skips the URL request but still initializes other properties.

### Component Identity
- `za-zid`: Component ID sent as `zaction.zid`.
- `za-zid-parent`: Parent component ID sent as `zaction.zidParent`.
- `za-zseq`: Optional identifier for extended cases; not used by core logic but available for custom use.

### Pagination
- `za-page-on`: Active page number.
- `za-page-limit`: Number of records per page.

### Looping and Skipping
- `za-loop-type`: Loop control identifier sent as `zaction.loopType`.
- `za-loop-inject-skip-inject`: If `true` and no loopType is found, skips DOM injection even if data is returned.

### Data and Injection
- `za-data`: Defines what DOM elements to include as data. Format:
    - `label.type:selector`
    - Special types: `none`, `self`, `closest`, `selector`
    - Optional view modes: `@inner`, `@outer` (default: innerHTML)
    - Examples:
        - `za-data="none"` — ignore `zdata` entirely
        - `za-data="self"` or `za-data="self:"`
        - `za-data="label.selector:criteria"`
        - `za-data="label.closest:criteria"`
        - `za-data="label.selector@inner:criteria"`
        - `za-data="label.closest@outer:criteria"`
- `za-inject`: Target for HTML injection from the server response. Uses same format as `za-data`.
- `za-post-save`: Selector(s) to activate after a successful zaction. Similar to `zdlg-post-save` but used outside dialogs.
- `za-do-zval`: Passes the result through the zval processor after completion.

### Input Monitoring (`zinput` system)
- `zinput`: Marks container element for input change tracking.
- `zinput-event`: Event type to monitor (`input` by default, or `change`).
- `zinput-field`: Marked inputs inside `zinput` container to monitor (`input`, `select`, `textarea`).
- `ztoggler`: ID of the target element to show or activate when changes are detected.
- `ztoggler-display`: Determines visibility mode: `none` (default) or `disabled`.
- `zref-zinput-ptr`: Auto-added to `ztoggler` to link back to the `zinput` container.

### Dialog Support (`za-dlg` and `zdlg-*`)
- `za-dlg`: Selector for the dialog element. Accepts same syntax as `za-data`.
- Dialog attribute support:
    - `zdlg-post-save`: Run post-save logic (like `za-post-save` but for dialogs)
    - `zdlg-title`, `zdlg-alt-title`: Static or fallback titles
    - `zdlg-body`: Dialog content body (fallback priority: element > server.html > server.js.body)
    - `zdlg-noHeaderCloseButton`: Hide close button if set to `true`
    - `zdlg-type`, `zdlg-alt-type`: Dialog theme variants (e.g. `primary`, `success`, `danger`, etc.)
    - `zdlg-theme`, `zdlg-alt-theme`: Quick config for button themes
    - `zdlg-buttons`: Define custom buttons (`LABEL|THEME|ZTRIGGER`), separated by `;`
    - `zdlg-class`, `zdlg-alt-class`: Classes for the modal dialog
    - `zdlg-class-backdrop`, `zdlg-alt-class-backdrop`: Backdrop class control
    - `zdlg-class-width-mod`, `zdlg-alt-class-width-mod`: Size modifiers (e.g., `sm`, `lg`, `xl`)
    - `zdlg-class-fullscreen-mod`, `zdlg-alt-class-fullscreen-mod`: Fullscreen breakpoints
    - `zdlg-is-scrollable`, `zdlg-alt-is-scrollable`: Toggle scroll behavior
    - `zdlg-is-fullscreen`, `zdlg-alt-is-fullscreen`: Enable fullscreen mode
    - `zdlg-is-no-footer`, `zdlg-alt-is-no-footer`: Remove dialog footer

---

## Custom Initialization Example (HTML Override)

To delay setup until after you register handlers or load additional logic:

```html
<script>
  function handleZAction(zaction, callback) {
    let isHandled = false;
    switch (zaction.getOptions().zaction.event) {
      case 'custom-fn':
        // Do something app-specific here
        isHandled = true;
        break;
      default:
        console.log('Unhandled zaction event from SAMPLE:', zaction.getOptions().zaction.event);
        break;
    }
    return isHandled;
  }

  window.zzbReady = function (bootstrap) {
    console.log('override pre')
    zzb.zaction.registerHandler({ id: 'vehicleDispatch', handler: handleZAction });
    bootstrap(); // continue with ZAction/ZUI setup
    console.log('override post')
  };
</script>

<!-- Load core -->
<script src="/dist/zzb.ui.js"></script>
```

This ensures:

* `zzbReady()` is called *after* DOMContentLoaded
* Your app-specific handler is registered *before* ZAction starts listening
* You can modify or replace the default behavior

---

## Advanced Notes
- If the selected `za-data` target is a form, `FormData` is automatically created.
- If `zurl`, `zid`, and `zidParent` are not directly specified, zaction tries to infer them from the `za-data` element.
- Built-in server responses may update `results.html`, `results.js`, or field-level values.

---

## Removed / Deprecated
- `za-post-inject-action`: Previously allowed post-injection actions (e.g., `delete`). Now deprecated and removed.

---

## Security
- While server-side sanitization is expected, be cautious when inserting raw HTML from server responses.
- Use DOM sanitizers if injecting untrusted content (`DOMPurify`, etc).
