import { describe, it, expect } from 'vitest';

import type { NavigationTransitionPresetName } from '../../../src/core/public';
import { navigationTransitionPresets } from '../../../src/transitions/presets';

const allPresets: NavigationTransitionPresetName[] = [
  'slide-inline',
  'slide-opposite',
  'slide-up',
  'slide-down',
  'fade',
  'fade-scale',
  'none',
];

describe('navigationTransitionPresets', () => {
  it('contains all defined preset names', () => {
    for (const name of allPresets) {
      expect(navigationTransitionPresets).toHaveProperty(name);
    }
  });

  it('each preset has a duration field', () => {
    for (const [, spec] of Object.entries(navigationTransitionPresets)) {
      expect(typeof spec.duration).toBe('number');
    }
  });

  it('none preset has duration 0', () => {
    expect(navigationTransitionPresets['none'].duration).toBe(0);
  });

  it('slide-inline has translate on x axis', () => {
    const spec = navigationTransitionPresets['slide-inline'];
    expect(spec.translate?.axis).toBe('x');
    expect(spec.translate?.from).toBe('100%');
    expect(spec.translate?.to).toBe('0%');
  });

  it('slide-up has translate on y axis', () => {
    const spec = navigationTransitionPresets['slide-up'];
    expect(spec.translate?.axis).toBe('y');
    expect(spec.translate?.from).toBe('100%');
  });

  it('slide presets have reverseOnBack true', () => {
    for (const name of [
      'slide-inline',
      'slide-opposite',
      'slide-up',
      'slide-down',
    ] as const) {
      expect(navigationTransitionPresets[name].reverseOnBack).toBe(true);
    }
  });

  it('fade presets have opacity from 0 to 1', () => {
    for (const name of ['fade', 'fade-scale'] as const) {
      expect(navigationTransitionPresets[name].opacity?.from).toBe(0);
      expect(navigationTransitionPresets[name].opacity?.to).toBe(1);
    }
  });

  it('fade-scale includes scale', () => {
    const spec = navigationTransitionPresets['fade-scale'];
    expect(spec.scale?.from).toBe(0.95);
    expect(spec.scale?.to).toBe(1);
  });
});
