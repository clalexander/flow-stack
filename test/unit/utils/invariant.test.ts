import { describe, it, expect } from 'vitest';

import { invariant } from '../../../src/utils/invariant';

describe('invariant', () => {
  it('does not throw when condition is truthy', () => {
    expect(() => invariant(true, 'should not throw')).not.toThrow();
    expect(() => invariant(1, 'should not throw')).not.toThrow();
    expect(() => invariant('value', 'should not throw')).not.toThrow();
  });

  it('throws with the given message when condition is falsy', () => {
    expect(() => invariant(false, 'boom')).toThrow('boom');
    expect(() => invariant(0, 'zero is falsy')).toThrow('zero is falsy');
    expect(() => invariant(null, 'null check')).toThrow('null check');
  });

  it('throws an Error instance', () => {
    expect(() => invariant(false, 'err')).toThrow(Error);
  });
});
