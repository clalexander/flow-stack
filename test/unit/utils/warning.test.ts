import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { noop } from '../../../src/utils/noop';
import { warning } from '../../../src/utils/warning';

describe('noop', () => {
  it('returns undefined', () => {
    expect(noop()).toBeUndefined();
  });

  it('is callable multiple times without error', () => {
    expect(() => {
      noop();
      noop();
    }).not.toThrow();
  });
});

describe('warning', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls console.warn when condition is falsy', () => {
    warning(false, 'something went wrong');
    expect(console.warn).toHaveBeenCalledWith('something went wrong');
  });

  it('does not call console.warn when condition is truthy', () => {
    warning(true, 'should not warn');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('does not warn for null condition (falsy)', () => {
    warning(null, 'null warning');
    expect(console.warn).toHaveBeenCalledWith('null warning');
  });
});
