import { describe, it, expect, vi } from 'vitest';

import {
  applyNavigationFocus,
  restoreNavigationFocus,
} from '../../../src/a11y/focus';

function makeEl(tag = 'div'): HTMLElement {
  return document.createElement(tag);
}

describe('applyNavigationFocus', () => {
  it('does nothing when container is null', () => {
    expect(() => applyNavigationFocus({ container: null })).not.toThrow();
  });

  it('does nothing when behavior is "preserve"', () => {
    const el = makeEl();
    document.body.appendChild(el);
    const focusSpy = vi.spyOn(el, 'focus');
    applyNavigationFocus({ container: el, behavior: 'preserve' });
    expect(focusSpy).not.toHaveBeenCalled();
    document.body.removeChild(el);
  });

  it('focuses container directly when behavior is "reset"', () => {
    const el = makeEl();
    document.body.appendChild(el);
    const focusSpy = vi.spyOn(el, 'focus');
    applyNavigationFocus({ container: el, behavior: 'reset' });
    expect(focusSpy).toHaveBeenCalled();
    document.body.removeChild(el);
  });

  it('focuses the first focusable child in "auto" mode', () => {
    const container = makeEl();
    const btn = document.createElement('button');
    container.appendChild(btn);
    document.body.appendChild(container);
    const btnSpy = vi.spyOn(btn, 'focus');
    applyNavigationFocus({ container, behavior: 'auto' });
    expect(btnSpy).toHaveBeenCalled();
    document.body.removeChild(container);
  });

  it('focuses container itself when no focusable child in "auto" mode', () => {
    const container = makeEl();
    document.body.appendChild(container);
    const containerSpy = vi.spyOn(container, 'focus');
    applyNavigationFocus({ container, behavior: 'auto' });
    expect(containerSpy).toHaveBeenCalled();
    document.body.removeChild(container);
  });

  it('defaults to "auto" behavior', () => {
    const container = makeEl();
    document.body.appendChild(container);
    const containerSpy = vi.spyOn(container, 'focus');
    applyNavigationFocus({ container });
    expect(containerSpy).toHaveBeenCalled();
    document.body.removeChild(container);
  });
});

describe('restoreNavigationFocus', () => {
  it('does nothing when container is null', () => {
    expect(() => restoreNavigationFocus(null)).not.toThrow();
  });

  it('calls focus on the container when it is provided', () => {
    const el = makeEl();
    document.body.appendChild(el);
    const focusSpy = vi.spyOn(el, 'focus');
    restoreNavigationFocus(el);
    expect(focusSpy).toHaveBeenCalled();
    document.body.removeChild(el);
  });
});
