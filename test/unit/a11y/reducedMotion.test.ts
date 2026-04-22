import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  resolveReducedMotionPreference,
  applyReducedMotionToTransition,
} from '../../../src/a11y/reducedMotion';
import { navigationTransitionPresets } from '../../../src/transitions/presets';

// We need window.matchMedia in node env tests too — mock it here
beforeEach(() => {
  let _matches = false;
  vi.stubGlobal('window', {
    matchMedia: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? _matches : false,
    })),
  });
  // expose setter for tests
  (globalThis as unknown as Record<string, unknown>).__setMatchMedia = (
    v: boolean,
  ) => {
    _matches = v;
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)' ? v : false,
        }) as unknown as MediaQueryList,
    );
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolveReducedMotionPreference', () => {
  it('"always" returns true regardless of system setting', () => {
    expect(resolveReducedMotionPreference('always')).toBe(true);
  });

  it('"never" returns false regardless of system setting', () => {
    expect(resolveReducedMotionPreference('never')).toBe(false);
  });

  it('"system" returns false when matchMedia does not match', () => {
    (
      globalThis as unknown as Record<string, (v: boolean) => void>
    ).__setMatchMedia(false);
    expect(resolveReducedMotionPreference('system')).toBe(false);
  });

  it('"system" returns true when matchMedia matches', () => {
    (
      globalThis as unknown as Record<string, (v: boolean) => void>
    ).__setMatchMedia(true);
    expect(resolveReducedMotionPreference('system')).toBe(true);
  });
});

describe('applyReducedMotionToTransition', () => {
  const slideSpec = navigationTransitionPresets['slide-inline'];

  it('returns original spec unchanged when preference is "never"', () => {
    const result = applyReducedMotionToTransition(slideSpec, 'never');
    expect(result).toBe(slideSpec);
  });

  it('sets duration to 0 when no reducedMotionPreset and preference is "always"', () => {
    const result = applyReducedMotionToTransition(slideSpec, 'always');
    expect(result.duration).toBe(0);
  });

  it('keeps other spec fields when setting duration to 0', () => {
    const result = applyReducedMotionToTransition(slideSpec, 'always');
    expect(result.translate).toEqual(slideSpec.translate);
  });

  it('uses reducedMotionPreset string when preference triggers reduction', () => {
    const spec = { ...slideSpec, reducedMotionPreset: 'fade' as const };
    const result = applyReducedMotionToTransition(spec, 'always');
    expect(result).toBe(navigationTransitionPresets['fade']);
  });

  it('uses reducedMotionPreset object when preference triggers reduction', () => {
    const override = { duration: 50 };
    const spec = { ...slideSpec, reducedMotionPreset: override };
    const result = applyReducedMotionToTransition(spec, 'always');
    expect(result).toBe(override);
  });
});
