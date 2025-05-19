# ZUI Splitter System (`zzb.zui`)

The **Zazzy UI (ZUI)** library provides a modular and responsive system for managing dynamic UI elements, including **splitters**, **element initialization**, **responsive behavior**, and **locale-based formatting**. The most prominent feature is the ability to control element visibility and width interactively or programmatically via **splitters**.

---

## Splitter Overview

ZUI includes an intelligent splitter mechanism that allows UI panes to be resized or toggled between widths. Splitters are defined using declarative HTML attributes and can support:

* **Pixel widths** (e.g., `200`, `400`)
* **Percentage widths** (e.g., `100%`)
* Persistent cache state (via DOM-local storage)
* Toggle button + drag-to-resize support
* Responsive hiding/showing based on breakpoints

---

## Usage

### Splitter Setup

Add a `div` element with the `zsplitter` class and directional attribute:

```html
<div id="mySplitter" class="zsplitter" zsplitter-left="200,400,100%" zsplitter-show="open">
  <a href="#" zsplitter-toggable><i class="bi bi-three-dots-vertical"></i></a>
</div>
```

* `zsplitter-left="..."` or `zsplitter-right="..."`: comma-separated toggle values.
* `zsplitter-show="open"` (or `"close"`): initial visibility.
* Optional: `id` is used for persistent cache state.

### Width Units

* **Numeric values** (e.g., `"200"`) are interpreted as **pixels**.
* **Values ending in `%`** (e.g., `"100%"`) are treated as **percent of available space**, automatically accounting for the splitter width.

Example:

```html
zsplitter-left="200,100%"  <!-- Toggles between 200px and fullscreen -->
```

### Click Toggle Behavior

* Include an inner element with `zsplitter-toggable` to cycle widths.
* After the last toggle value, the target panel is hidden (`width: 0`), allowing re-expansion.

---

## Architecture & Internals

### Core API

| Method                                               | Description                                                |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `zzb.zui.initZSplitter($resizer, direction, widths)` | Initializes a splitter on a target element.                |
| `zzb.zui.getZSplitter(id)`                           | Retrieves the splitter object (includes `.toggle(state)`). |
| `zzb.zui.setZSplitter(id, obj)`                      | Sets or replaces a splitter instance.                      |
| `zzb.zui.toggleZSplitterById(id, state)`             | Triggers a splitter open/close/dismiss toggle.             |
| `zzb.zui.destroyZSplitter(id)`                       | Cleans up a registered splitter.                           |
| `zzb.zui.triggerZSplitterResize()`                   | Manually invokes all splitter resize handlers.             |

---

### Toggle States

You can manually toggle a splitter:

```js
zzb.zui.toggleZSplitterById('mySplitter', 'open')   // Show and expand
zzb.zui.toggleZSplitterById('mySplitter', 'close')  // Collapse width to 0
zzb.zui.toggleZSplitterById('mySplitter', 'dismiss') // Hide entirely via `d-none`
```

---

## Smart Features

* **Responsive Awareness**: You can define breakpoints (e.g., `rsize="md"`) and ZUI will use `isViewportGTRSize()` to determine whether to show or hide a panel at load.
* **Cache Persistence**: Splitters with IDs are remembered across reloads using local cache.
* **Drag-to-Resize**: Clicking and dragging anywhere on the splitter (outside the `zsplitter-toggable` button) resizes the target panel dynamically.
* **Auto-Layout**: Percentage widths account for the splitter’s own width to avoid layout overflow.

---

## Custom Element Initialization

To support dynamic elements, use:

```js
zzb.zui.setElemIniter({ name: 'customIniter', fn: function ($root) {
  // your logic here
}})
```

This is automatically triggered via `zzb.zui.onElemInit()`.

---

## Locale Support

ZUI includes internal locale config (`enLocale`) for use in components like calendars and pickers. You can customize using:

```js
zzb.zui.setLocale(myLocaleObject)
zzb.zui.getLocale('en', callback)
```

---

## Initialization via `onZUIReady()`

Call this method during your app’s startup flow to initialize Zazzy UI behaviors.

```js
zzb.zui.onZUIReady();
````

### What It Does

The `onZUIReady()` function prepares the UI layer by:

* Registering default element initializers (`__registerBuiltins()`)
* Running `onLoadInit()` to apply layout prep and preloading strategies
* Executing `onElemInit()` to attach UI behaviors to DOM elements
* Running `onZLoadSection()` to trigger dynamic actions (e.g., `zinterval`, `zloadsection`)

> **Note:** This function does *not* attach any global event listeners.
> Use it in tandem with a `DOMContentLoaded` hook or custom deferral pattern.

### Customizing Initialization

To hook into the setup process—e.g., to register your own zaction handlers or defer timing—see the advanced setup example in [zaction_README.md](zaction_README.md#custom-initialization-example-html-override).

---

## Maintenance Notes

* When using `%` widths, the splitter element’s own width is subtracted to avoid overflow issues.
* The splitter toggle index resets on each init, and is preserved via `zsplitter.id` cache (if defined).
* If dragging appears laggy, ensure you're not binding conflicting mouse handlers on child elements (like the toggle button).
