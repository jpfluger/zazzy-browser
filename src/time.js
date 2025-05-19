// ---------------------------------------------------
// time
// ---------------------------------------------------

/**
 * Time Manager that controls interval timers with customizable actions,
 * automatic starting, caching, and UI element interaction.
 */
function _time() {}

/**
 * ZazzyInterval Class
 *
 * Manages a single interval timer with customizable behavior such as:
 * - Automatic start
 * - Cache management
 * - Refresh and action on each interval
 * - Pause, unpause, and clear functionality
 */
class ZazzyInterval {
  constructor(options) {
    this.options = ZazzyInterval.getDefaults(options);
    if (this.options.autostart) {
      this.start();
    }
  }

  /**
   * Returns the default options for the interval timer.
   * Merges passed options with the defaults.
   */
  static getDefaults(options) {
    const defaultOptions = {
      interval: 60000,
      autostart: false,
      id: null,
      targetClick: null,
      datacache: false,
      action: function() { console.log('ZazzyInterval no-op'); },
      _cache: null,
      _itoken: null,
      _isPaused: false
    };

    // Merge the default options with user-provided options.
    options = zzb.types.isObject(options) ? zzb.types.merge(defaultOptions, options) : defaultOptions;
    options.autostart = options.autostart === true;

    if (!zzb.types.isStringNotEmpty(options.id)) {
      options.id = zzb.uuid.newV4();
    }

    // Ensure the action is a valid function.
    if (!zzb.types.isFunction(options.action)) {
      throw new Error('The "action" option must be a function.');
    }

    // Set default methods if not provided.
    options.new = options.new || function() {
      options._itoken = setInterval(options.refresh, options.interval);
      options._isPaused = false;
    };

    options.clear = options.clear || function(doPause) {
      if (options._itoken != null) {
        clearInterval(options._itoken);
        options._itoken = null;
        if (doPause) {
          options._isPaused = true;
        }
      }
    };

    options.unpause = options.unpause || function() {
      if (options._isPaused) {
        options._itoken = setInterval(options.refresh, options.interval);
        options._isPaused = false;
      }
    };

    options.refresh = options.refresh || function() {
      if (options._itoken != null) {
        options._isPaused = false;
        options.action && options.action();
      }
    };

    return options;
  }

  /**
   * Starts the interval timer.
   */
  start() {
    if (zzb.types.isFunction(this.options.new)) {
      this.options.new();
    }
  }

  /**
   * Clears the interval timer and optionally pauses it.
   * @param {boolean} doPause - If true, pauses the interval.
   */
  clear(doPause) {
    if (zzb.types.isFunction(this.options.clear)) {
      this.options.clear(doPause);
    }
  }

  /**
   * Unpauses the interval timer if it was paused.
   */
  unpause() {
    if (zzb.types.isFunction(this.options.unpause)) {
      this.options.unpause();
    }
  }

  /**
   * Refreshes the interval and runs the action.
   */
  refresh() {
    if (zzb.types.isFunction(this.options.refresh)) {
      this.options.refresh();
    }
  }

  /**
   * Sets the cache for this interval timer.
   * @param {object} obj - The object to store in the cache.
   */
  setCache(obj) {
    this.options._cache = this.options.datacache ? obj : null;
  }

  /**
   * Gets the cache for this interval timer.
   * @returns {object|null} - The cached object or null.
   */
  getCache() {
    return this.options.datacache ? this.options._cache : null;
  }

  /**
   * Checks if this interval timer has a cached object.
   * @returns {boolean} - True if cache exists, false otherwise.
   */
  hasCache() {
    return this.options.datacache && this.options._cache != null;
  }
}

/**
 * _time Class for managing multiple ZazzyInterval instances.
 * Provides functions to add, clear, unpause, and manage intervals.
 */
_time.prototype.ZazzyInterval = ZazzyInterval;

/**
 * Retrieves a specific interval timer by its ID.
 * @param {string} id - The ID of the interval to retrieve.
 * @returns {ZazzyInterval|null} - The interval timer or null if not found.
 */
_time.prototype.getInterval = function(id) {
  if (!this.myIntervals || !zzb.types.isStringNotEmpty(id) || !this.myIntervals[id]) {
    return null;
  }
  return this.myIntervals[id];
};

/**
 * Clears all interval timers and optionally pauses them.
 * @param {boolean} doPause - If true, pauses all intervals.
 */
_time.prototype.clearAll = function(doPause) {
  if (!this.myIntervals || !zzb.types.isObject(this.myIntervals)) {
    return;
  }
  for (const key in this.myIntervals) {
    if (this.myIntervals[key] instanceof ZazzyInterval) {
      this.myIntervals[key].clear(doPause);  // Ensure it's an instance of ZazzyInterval
    }
  }
};

/**
 * Unpauses all interval timers.
 */
_time.prototype.unpauseAll = function() {
  if (!this.myIntervals || !zzb.types.isObject(this.myIntervals)) {
    return;
  }
  for (const key in this.myIntervals) {
    this.myIntervals[key].unpause();
  }
};

/**
 * Creates a new interval timer with the given options.
 * @param {object} options - The options for the new interval timer.
 * @returns {ZazzyInterval} - The newly created ZazzyInterval instance.
 * @throws {Error} - Throws an error if the interval creation fails.
 */
_time.prototype.newInterval = function(options) {
  if (!this.myIntervals) {
    this.myIntervals = {};
  }

  if (options && options.id && zzb.types.isStringNotEmpty(options.id)) {
    if (this.myIntervals[options.id]) {
      return this.myIntervals[options.id];
    }
  }

  const myInterval = new ZazzyInterval(options);  // Ensure this is an instance of ZazzyInterval
  if (myInterval && myInterval.options && zzb.types.isStringNotEmpty(myInterval.options.id)) {
    this.myIntervals[myInterval.options.id] = myInterval;
    return myInterval;
  }

  throw new Error('Failed to create ZazzyInterval');
};

/**
 * Initializes an interval tied to a UI element.
 * The element must have the `zi-*` attributes for customization.
 * @param {HTMLElement} $elem - The DOM element to associate the interval with.
 */
_time.prototype.newUIInterval = function ($elem) {
  if (!$elem) {
    return;
  }

  // Prevent re-initialization if already initialized
  if ($elem.getAttribute('zi-inited') === 'true') {
    return; // Prevent re-initialization
  }

  // Set default ID if the element doesn't already have one
  if (!zzb.types.isStringNotEmpty($elem.getAttribute('id'))) {
    $elem.setAttribute('id', zzb.uuid.newV4());  // Generate an ID if not provided
  }

  // Set the 'zi-inited' attribute to 'true' before starting the interval
  $elem.setAttribute('zi-inited', 'true');

  // Set the targetClick to the element's ID
  const targetClick = $elem.getAttribute('id');

  // Get the interval value from the element's attributes or use default if not provided
  const interval = zzb.dom.getAttributeElse($elem, 'zi-interval', 60000);  // Default to 60000ms (1 minute)

  // Get the run limit from the element's attribute (if provided)
  const runLimit = parseInt($elem.getAttribute('zi-run-limit')) || Infinity;  // Default is no limit

  // Track the number of runs
  let runCount = 0;

  // Initialize the interval
  const intervalId = setInterval(() => {

    // Skip action if any modal is open
    if (document.querySelectorAll('.modal.show').length > 0) {
      return;
    }

    // Get the element to trigger the action
    const element = document.getElementById(targetClick);
    if (!element) {
      console.warn('Element not found:', targetClick);
      return;
    }

    // Perform the action (e.g., clicking the element)
    element.setAttribute('zi-noclick', 'true');
    element.click();

    // Increment the run count
    runCount++;

    // If the run count exceeds the run limit, stop the interval
    if (runCount >= runLimit) {
      clearInterval(intervalId);  // Stop the interval
    }
  }, interval);  // Use the interval from the element or default to 60000ms

  // Store the interval ID in the element's `zi-interval-id` attribute
  $elem.setAttribute('zi-interval-id', intervalId);

  // Optionally store the interval ID in the global `myIntervals` to track it (if necessary)
  const elementId = $elem.getAttribute('id');
  if (!this.myIntervals) {
    this.myIntervals = {};
  }

  this.myIntervals[elementId] = intervalId;
};

exports.time = _time;
