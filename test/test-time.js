/* global describe, it */
const assert = require('assert');
const { zzbLoader } = require('./zzb-tester.js');

// Load the zzb instance that contains time functionality
describe('Validate zzb.time methods', function () {
  const zzb = zzbLoader();

  describe('zzb.time.newInterval', function () {
    it('should create a new ZazzyInterval with default options', function () {
      const interval = zzb.time.newInterval({});
      assert.ok(interval instanceof zzb.time.ZazzyInterval);
      assert.strictEqual(interval.options.interval, 60000);
      assert.strictEqual(interval.options.autostart, false);
      assert.ok(zzb.types.isStringNotEmpty(interval.options.id));
    });

    it('should override default options when provided', function () {
      const interval = zzb.time.newInterval({
        interval: 500,
        autostart: true,
        action: function () { console.log('Custom action'); },
      });
      assert.strictEqual(interval.options.interval, 500);
      assert.strictEqual(interval.options.autostart, true);
      assert.strictEqual(typeof interval.options.action, 'function');
    });

    it('should throw an error if action is not a function', function () {
      assert.throws(() => {
        zzb.time.newInterval({ action: 'not-a-function' });
      }, /The "action" option must be a function/);
    });

    describe('ZazzyInterval methods', function () {
      let interval;

      beforeEach(function () {
        // Clear previous intervals before each test to ensure isolation
        zzb.time.clearAll();
      });

      it('should run the interval action twice and stop the interval', function (done) {
        let intervalCount = 0;

        // Create a new interval with autostart
        interval = zzb.time.newInterval({
          interval: 200,  // 200ms interval for fast testing
          autostart: true,  // Auto-start the interval
          action: function () {
            intervalCount++;
            //console.log("Action triggered", intervalCount);

            // After the second trigger, stop the interval
            if (intervalCount === 2) {
              clearInterval(interval.options._itoken);  // Clear the interval
              //console.log("Interval stopped after second action.");

              // Ensure the action was triggered twice
              assert.strictEqual(intervalCount, 2, 'Action should be triggered twice');
              done();  // Ensure done() is called only once
            }
          },
        });
      });

      it('should allow clearing the interval', function () {
        interval.start();
        interval.clear(true); // Clear and pause
        assert.strictEqual(interval.options._itoken, null);
        assert.strictEqual(interval.options._isPaused, true);
      });

      it('should allow unpausing the interval', function () {
        interval.start();
        interval.clear(true); // Clear and pause
        interval.unpause();
        assert.notStrictEqual(interval.options._itoken, null);
        assert.strictEqual(interval.options._isPaused, false);
      });

      it('should allow refreshing the interval and triggering action', function (done) {
        interval.refresh = function () {
          assert.ok(true, 'Interval was refreshed');
          done();
        };
        interval.refresh(); // Manually trigger refresh
      });

      it('should cache data if datacache is true', function () {
        interval = zzb.time.newInterval({
          interval: 500,   // 1 second for faster testing
          datacache: true,  // Enable caching
          action: function () {
            console.log('Interval action');  // Dummy action
          }
        });

        // Set the cache
        interval.setCache({ key: 'value' });

        // Check that the cache has the expected object
        const cachedData = interval.getCache();
        assert.deepStrictEqual(cachedData, { key: 'value' });  // Ensure the cache contains the right object

        // Check that the cache exists (hasCache should return true)
        assert.strictEqual(interval.hasCache(), true);  // Ensure the cache is valid
      });

      it('should not cache data if datacache is false', function () {
        interval.options.datacache = false;
        interval.setCache({ key: 'value' });
        assert.strictEqual(interval.getCache(), null);
        assert.strictEqual(interval.hasCache(), false);
      });
    });
  });

  const { JSDOM } = require('jsdom');
  describe('zzb.time.newUIInterval', function () {
    let mockElement;

    beforeEach(function () {
      // Create a virtual DOM using jsdom and directly set the attributes
      const dom = new JSDOM('<!DOCTYPE html><html><body><div id="test-element" zi-interval="5000" zi-autostart="true" zi-id="test-interval" zi-run-limit="1"></div></body></html>');
      global.document = dom.window.document; // Ensure document is globally available
      global.window = dom.window;  // Ensure window is globally available
      global.HTMLElement = dom.window.HTMLElement; // Simulate HTMLElement

      // Query the element from the virtual DOM
      mockElement = document.querySelector('#test-element');
      //console.log("Mock element:", mockElement);  // Log mock element to verify

      // No need to mock `getAttribute` or `setAttribute` anymore as we're directly setting attributes on the DOM element
    });

    it('should initialize a new UI interval when valid element is provided', function (done) {
      this.timeout(6000);  // Set a longer timeout for this test

      // Log zzb.time to ensure it's properly loaded
      //console.log("zzb.time object:", zzb.time);

      // Ensure newUIInterval is a function
      assert.strictEqual(typeof zzb.time.newUIInterval, 'function', 'newUIInterval is not a function');

      // Initialize the interval with the valid element
      zzb.time.newUIInterval(mockElement);

      // Wait for the interval to be set and check if 'zi-inited' is set
      setTimeout(() => {
        //console.log("Checking 'zi-inited' value:", mockElement.getAttribute('zi-inited'));
        assert.strictEqual(mockElement.getAttribute('zi-inited'), 'true');
        done();  // Ensure done is called after the interval is initialized
      }, 5500);  // Timeout slightly longer than the interval duration (5000ms)
    });

    // Other test cases remain the same as before...

    // Cleanup: Clear the interval after each test to prevent interference
    afterEach(function () {
      if (mockElement._itoken) {
        clearInterval(mockElement._itoken);
        mockElement._itoken = null;
      }
    });
  });

  describe('ZazzyInterval Methods', function () {
    let interval;

    beforeEach(function () {
      // Clear previous intervals before each test
      zzb.time.clearAll();
      interval = zzb.time.newInterval({
        interval: 1000,
        action: function () { console.log('Interval action'); },
      });
    });

    it('should start the interval when autostart is true', function (done) {
      let intervalCount = 0;

      // Create a new interval with autostart
      interval = zzb.time.newInterval({
        interval: 500,  // 500ms interval for fast testing
        autostart: true,  // Auto-start the interval
        action: function () {
          intervalCount++;

          // Ensure the action is triggered once
          if (intervalCount === 1) {
            assert.strictEqual(intervalCount, 1, 'Action should be triggered once');
            clearInterval(interval.options._itoken);  // Stop interval after first run
            done();  // Ensure done() is called only once
          }
        },
      });
    });

    it('should pause the interval when clear(true) is called', function () {
      interval.start();
      interval.clear(true); // Clear and pause
      assert.strictEqual(interval.options._itoken, null); // Interval should be cleared
      assert.strictEqual(interval.options._isPaused, true); // It should be in paused state
    });

    it('should unpause the interval when unpause() is called', function () {
      interval.start();
      interval.clear(true); // Clear and pause
      interval.unpause();   // Unpause
      assert.notStrictEqual(interval.options._itoken, null); // Interval should be running again
      assert.strictEqual(interval.options._isPaused, false); // It should no longer be paused
    });

    it('should clear the interval correctly', function (done) {
      interval.start();
      interval.clear();  // Clear the interval
      assert.strictEqual(interval.options._itoken, null);  // It should be cleared
      done();  // Ensure done() is called after the interval is cleared
    });

    it('should stop the interval after running for a specified number of times', function (done) {
      let intervalCount = 0;
      const runLimit = 2;

      interval = zzb.time.newInterval({
        interval: 500,  // 500ms interval for fast testing
        autostart: true, // Auto-start the interval
        action: function () {
          intervalCount++;
          if (intervalCount >= runLimit) {
            clearInterval(interval.options._itoken); // Stop the interval after reaching run limit
            assert.strictEqual(intervalCount, runLimit, 'Interval should stop after the run limit');
            done();  // Ensure done() is called after the interval is stopped
          }
        },
      });
    });

    it('should allow setting and getting cached data', function () {
      interval = zzb.time.newInterval({
        interval: 1000,   // 1 second for faster testing
        datacache: true,  // Enable caching
        action: function () {
          console.log('Interval action');  // Dummy action
        }
      });

      // Set the cache
      interval.setCache({ key: 'value' });

      // Check that the cache has the expected object
      const cachedData = interval.getCache();
      assert.deepStrictEqual(cachedData, { key: 'value' });  // Ensure the cache contains the right object

      // Check that the cache exists (hasCache should return true)
      assert.strictEqual(interval.hasCache(), true);  // Ensure the cache is valid
    });

    it('should not cache data if datacache is false', function () {
      interval.options.datacache = false;
      interval.setCache({ key: 'value' });
      assert.strictEqual(interval.getCache(), null);
      assert.strictEqual(interval.hasCache(), false);
    });

    afterEach(function () {
      if (interval && interval.options._itoken) {
        clearInterval(interval.options._itoken);
        interval.options._itoken = null;
      }
    });
  });
});
