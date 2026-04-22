import { describe, it, expect } from 'vitest';

import { navigationTransitionPresets } from '../../../src/transitions/presets';
import { resolveTransition } from '../../../src/transitions/resolveTransition';
import { makeEntry } from '../../fixtures/entries';

const baseOptions = {
  action: { type: 'push' as const, route: 'Detail' },
  fromEntry: makeEntry({ routeName: 'Home' }),
  toEntry: makeEntry({ routeName: 'Detail' }),
  depth: 1,
  anchor: 'left' as const,
  orientation: 'horizontal' as const,
  presentation: 'stack' as const,
  reducedMotion: 'never' as const,
};

describe('resolveTransition', () => {
  describe('fallback presets', () => {
    it('uses slide-inline for horizontal stack presentation', () => {
      const spec = resolveTransition(baseOptions);
      expect(spec.preset).toBe('slide-inline');
    });

    it('uses slide-up for vertical orientation', () => {
      const spec = resolveTransition({
        ...baseOptions,
        orientation: 'vertical',
      });
      expect(spec.preset).toBe('slide-up');
    });

    it('uses fade for overlay presentation', () => {
      const spec = resolveTransition({
        ...baseOptions,
        presentation: 'overlay',
      });
      expect(spec.preset).toBe('fade');
    });
  });

  describe('priority chain — style merge', () => {
    it('stack transition overrides fallback', () => {
      const spec = resolveTransition({
        ...baseOptions,
        stackTransition: 'fade',
      });
      expect(spec.preset).toBe('fade');
    });

    it('route transition overrides stack transition', () => {
      const spec = resolveTransition({
        ...baseOptions,
        stackTransition: 'fade',
        routeTransition: 'slide-up',
      });
      expect(spec.preset).toBe('slide-up');
    });

    it('action transition overrides route transition', () => {
      const spec = resolveTransition({
        ...baseOptions,
        routeTransition: 'slide-up',
        action: {
          type: 'push',
          route: 'Detail',
          options: { transition: 'fade' },
        },
      });
      expect(spec.preset).toBe('fade');
    });
  });

  describe('explicit timing preservation', () => {
    it('explicit stack-level duration survives a route-level string preset', () => {
      const spec = resolveTransition({
        ...baseOptions,
        stackTransition: { preset: 'slide-inline', duration: 4000 },
        routeTransition: 'fade',
      });
      expect(spec.duration).toBe(4000);
    });

    it('route-level explicit duration overrides stack-level duration', () => {
      const spec = resolveTransition({
        ...baseOptions,
        stackTransition: { preset: 'slide-inline', duration: 4000 },
        routeTransition: { preset: 'fade', duration: 150 },
      });
      expect(spec.duration).toBe(150);
    });
  });

  describe('preset object expansion', () => {
    it('fills in preset style fields when object only specifies preset + duration', () => {
      const spec = resolveTransition({
        ...baseOptions,
        stackTransition: { preset: 'slide-inline', duration: 500 },
      });
      expect(spec.translate?.axis).toBe('x');
      expect(spec.duration).toBe(500);
    });
  });

  describe('resolver function', () => {
    it('calls the resolver with contextual args', () => {
      let called = false;
      resolveTransition({
        ...baseOptions,
        stackTransition: (ctx) => {
          called = true;
          expect(ctx.actionType).toBe('push');
          return navigationTransitionPresets['fade'];
        },
      });
      expect(called).toBe(true);
    });

    it('uses resolver return value as the spec', () => {
      const spec = resolveTransition({
        ...baseOptions,
        stackTransition: () => navigationTransitionPresets['fade'],
      });
      expect(spec.preset).toBe('fade');
    });

    it('falls back to default when resolver returns null/undefined', () => {
      const spec = resolveTransition({
        ...baseOptions,
        stackTransition: () => undefined,
      });
      // fallback is slide-inline for horizontal stack
      expect(spec.preset).toBe('slide-inline');
    });
  });
});
