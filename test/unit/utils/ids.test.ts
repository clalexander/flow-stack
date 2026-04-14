import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ids module', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('createNavigationId returns a string starting with "nav-"', async () => {
    const { createNavigationId } = await import('../../../src/utils/ids');
    expect(createNavigationId()).toMatch(/^nav-\d+$/);
  });

  it('createNavigationEntryKey returns a string starting with "entry-"', async () => {
    const { createNavigationEntryKey } = await import('../../../src/utils/ids');
    expect(createNavigationEntryKey()).toMatch(/^entry-\d+$/);
  });

  it('createNavigationId produces monotonically increasing values', async () => {
    const { createNavigationId } = await import('../../../src/utils/ids');
    const a = createNavigationId();
    const b = createNavigationId();
    const numA = parseInt(a.replace('nav-', ''), 10);
    const numB = parseInt(b.replace('nav-', ''), 10);
    expect(numB).toBe(numA + 1);
  });

  it('createNavigationEntryKey produces monotonically increasing values', async () => {
    const { createNavigationEntryKey } = await import('../../../src/utils/ids');
    const a = createNavigationEntryKey();
    const b = createNavigationEntryKey();
    const numA = parseInt(a.replace('entry-', ''), 10);
    const numB = parseInt(b.replace('entry-', ''), 10);
    expect(numB).toBe(numA + 1);
  });

  it('counters are independent', async () => {
    const { createNavigationId, createNavigationEntryKey } =
      await import('../../../src/utils/ids');
    const id = createNavigationId();
    const key = createNavigationEntryKey();
    // Both start at 1 after module reset; they don't share a counter
    expect(id).toBe('nav-1');
    expect(key).toBe('entry-1');
  });
});
