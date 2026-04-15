import { describe, it, expect, vi } from 'vitest';

import { normalizeRouteRegistry } from '../../../src/routes/normalizeRouteRegistry';
import { runNavigationGuards } from '../../../src/state/guards';
import { makeEntry, activeStackState } from '../../fixtures/entries';
import { simpleRegistry } from '../../fixtures/routes';

const routes = normalizeRouteRegistry(simpleRegistry);
const action = { type: 'push' as const, route: 'Detail' };

function makeState() {
  return activeStackState([makeEntry({ routeName: 'Home' })]);
}

describe('runNavigationGuards', () => {
  it('returns true when no guards are defined', async () => {
    const result = await runNavigationGuards({
      action,
      currentState: makeState(),
      currentRoute: routes['Home'],
      nextRoute: routes['Detail'],
    });
    expect(result).toBe(true);
  });

  it('returns true when canLeave returns true', async () => {
    const canLeave = vi.fn().mockReturnValue(true);
    const result = await runNavigationGuards({
      action,
      currentState: makeState(),
      currentRoute: { ...routes['Home'], canLeave },
    });
    expect(result).toBe(true);
    expect(canLeave).toHaveBeenCalled();
  });

  it('returns false when canLeave returns false', async () => {
    const canLeave = vi.fn().mockReturnValue(false);
    const result = await runNavigationGuards({
      action,
      currentState: makeState(),
      currentRoute: { ...routes['Home'], canLeave },
    });
    expect(result).toBe(false);
  });

  it('returns true when canEnter returns true', async () => {
    const canEnter = vi.fn().mockReturnValue(true);
    const result = await runNavigationGuards({
      action,
      currentState: makeState(),
      nextRoute: { ...routes['Detail'], canEnter },
    });
    expect(result).toBe(true);
  });

  it('returns false when canEnter returns false', async () => {
    const canEnter = vi.fn().mockReturnValue(false);
    const result = await runNavigationGuards({
      action,
      currentState: makeState(),
      nextRoute: { ...routes['Detail'], canEnter },
    });
    expect(result).toBe(false);
  });

  it('skips canEnter when canLeave blocks', async () => {
    const canLeave = vi.fn().mockReturnValue(false);
    const canEnter = vi.fn().mockReturnValue(true);
    const result = await runNavigationGuards({
      action,
      currentState: makeState(),
      currentRoute: { ...routes['Home'], canLeave },
      nextRoute: { ...routes['Detail'], canEnter },
    });
    expect(result).toBe(false);
    expect(canEnter).not.toHaveBeenCalled();
  });

  it('resolves async guards', async () => {
    const canEnter = vi.fn().mockResolvedValue(true);
    const result = await runNavigationGuards({
      action,
      currentState: makeState(),
      nextRoute: { ...routes['Detail'], canEnter },
    });
    expect(result).toBe(true);
  });

  it('returns false for async guard that resolves false', async () => {
    const canEnter = vi.fn().mockResolvedValue(false);
    const result = await runNavigationGuards({
      action,
      currentState: makeState(),
      nextRoute: { ...routes['Detail'], canEnter },
    });
    expect(result).toBe(false);
  });
});
