import type {
  NavigationEntry,
  NavigationEntryInput,
  NavigationStackState,
} from '../core/public';
import { createNavigationEntryKey } from '../utils/ids';

export function getActiveEntry(
  state: NavigationStackState,
): NavigationEntry | null {
  return state.entries[state.activeIndex] ?? null;
}

export function getStackDepth(state: NavigationStackState): number {
  return state.entries.length;
}

export function canPop(state: NavigationStackState): boolean {
  return state.entries.length > 1 && state.activeIndex > 0;
}

export function createEntriesFromInputs(
  inputs: readonly NavigationEntryInput[],
): readonly NavigationEntry[] {
  const now = Date.now();
  return inputs.map((input, index) => ({
    key: createNavigationEntryKey(),
    routeName: input.name,
    params: input.params ?? {},
    meta: input.meta,
    createdAt: now + index,
    state: index === inputs.length - 1 ? 'active' : 'inactive',
  }));
}
