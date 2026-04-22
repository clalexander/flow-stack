import type {
  NavigationEntry,
  NavigationStackState,
} from '../../src/core/public';

let _counter = 0;

export function makeEntry(
  overrides: Partial<NavigationEntry> & { routeName?: string } = {},
): NavigationEntry {
  _counter += 1;
  return {
    key: `test-entry-${_counter}`,
    routeName: overrides.routeName ?? 'Home',
    params: {},
    createdAt: Date.now(),
    state: 'active',
    ...overrides,
  };
}

export function activeStackState(
  entries: NavigationEntry[],
  activeIndex = entries.length - 1,
): NavigationStackState {
  return {
    entries: entries.map((e, i) => ({
      ...e,
      state: i === activeIndex ? 'active' : 'inactive',
    })),
    activeIndex,
    isTransitioning: false,
    lastAction: null,
    transition: null,
  };
}
