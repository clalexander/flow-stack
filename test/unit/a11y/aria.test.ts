import { describe, it, expect } from 'vitest';

import {
  getNavigationViewportAriaAttributes,
  getInactiveSceneAriaAttributes,
} from '../../../src/a11y/aria';

describe('getNavigationViewportAriaAttributes', () => {
  it('returns empty object when called with no arguments', () => {
    const attrs = getNavigationViewportAriaAttributes();
    expect(attrs['aria-label']).toBeUndefined();
    expect(attrs['aria-live']).toBeUndefined();
  });

  it('includes aria-label when provided', () => {
    const attrs = getNavigationViewportAriaAttributes('Navigation');
    expect(attrs['aria-label']).toBe('Navigation');
  });

  it('includes aria-live when provided', () => {
    const attrs = getNavigationViewportAriaAttributes(undefined, 'polite');
    expect(attrs['aria-live']).toBe('polite');
  });

  it('includes both when both provided', () => {
    const attrs = getNavigationViewportAriaAttributes('Nav', 'polite');
    expect(attrs['aria-label']).toBe('Nav');
    expect(attrs['aria-live']).toBe('polite');
  });
});

describe('getInactiveSceneAriaAttributes', () => {
  it('returns aria-hidden: true', () => {
    expect(getInactiveSceneAriaAttributes()).toEqual({ 'aria-hidden': true });
  });
});
