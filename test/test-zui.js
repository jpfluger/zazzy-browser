/* global describe, it */
const assert = require('assert');
const { zzbLoader } = require('./zzb-tester.js');

describe('Validate zzb.zui methods', function () {
  const zzb = zzbLoader();

  describe('zzb.zui.getDefaultRWidth', function () {
    it('should return a default responsive width of 576', function () {
      const result = zzb.zui.getDefaultRWidth();
      assert.strictEqual(result, 576);
    });
  });

  describe('zzb.zui.isViewportGTRSize', function () {
    it('should return a boolean indicating viewport size', function () {
      const result = zzb.zui.isViewportGTRSize(300);
      assert.strictEqual(typeof result, 'boolean');
    });

    it('should accept a named breakpoint and return a boolean', function () {
      const result = zzb.zui.isViewportGTRSize('sm');
      assert.strictEqual(typeof result, 'boolean');
    });
  });

  describe('zzb.zui.getViewportLabel', function () {
    it('should return one of xs, sm, md, lg, xl', function () {
      const label = zzb.zui.getViewportLabel();
      assert.match(label, /^(xs|sm|md|lg|xl)$/);
    });
  });
});