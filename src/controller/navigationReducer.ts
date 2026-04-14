import type {
  NavigationAction,
  NavigationEntry,
  NavigationStackState,
} from '../core/public';
import { matchesNavigationEntry } from '../state/matchers';
import { mergeNavigationParams } from '../state/params';
import { createNavigationEntryKey } from '../utils/ids';

function normalizeEntries(
  entries: readonly NavigationEntry[],
  activeIndex: number,
): readonly NavigationEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    state: index === activeIndex ? 'active' : 'inactive',
  }));
}

function makeEntry(
  routeName: string,
  params: Record<string, unknown>,
): NavigationEntry {
  return {
    key: createNavigationEntryKey(),
    routeName,
    params,
    createdAt: Date.now(),
    state: 'active',
  };
}

export function navigationReducer(
  state: NavigationStackState,
  action: NavigationAction,
): NavigationStackState {
  switch (action.type) {
    case 'push': {
      const nextEntry = makeEntry(action.route, action.params ?? {});
      const entries = [
        ...normalizeEntries(state.entries, state.activeIndex),
        nextEntry,
      ];
      return {
        entries,
        activeIndex: entries.length - 1,
        isTransitioning: false,
        lastAction: action,
        transition: null,
      };
    }
    case 'replace': {
      if (state.entries.length === 0) {
        const entry = makeEntry(action.route, action.params ?? {});
        return {
          entries: [entry],
          activeIndex: 0,
          isTransitioning: false,
          lastAction: action,
          transition: null,
        };
      }

      const entries = [...normalizeEntries(state.entries, state.activeIndex)];
      entries[state.activeIndex] = {
        ...makeEntry(action.route, action.params ?? {}),
        key: entries[state.activeIndex]?.key ?? createNavigationEntryKey(),
      };
      return {
        entries,
        activeIndex: state.activeIndex,
        isTransitioning: false,
        lastAction: action,
        transition: null,
      };
    }
    case 'pop': {
      if (state.entries.length <= 1) {
        return state;
      }
      const count = Math.max(1, action.count ?? 1);
      const nextEntries = state.entries.slice(
        0,
        Math.max(1, state.entries.length - count),
      );
      return {
        entries: normalizeEntries(nextEntries, nextEntries.length - 1),
        activeIndex: nextEntries.length - 1,
        isTransitioning: false,
        lastAction: action,
        transition: null,
      };
    }
    case 'popToRoot': {
      if (state.entries.length <= 1) {
        return state;
      }
      const nextEntries = state.entries.slice(0, 1);
      return {
        entries: normalizeEntries(nextEntries, 0),
        activeIndex: 0,
        isTransitioning: false,
        lastAction: action,
        transition: null,
      };
    }
    case 'popTo': {
      const index = state.entries.findIndex((entry, entryIndex) =>
        matchesNavigationEntry(
          action.matcher,
          entry,
          entryIndex,
          state.entries,
        ),
      );
      if (index < 0) {
        return state;
      }
      const nextEntries = state.entries.slice(0, index + 1);
      return {
        entries: normalizeEntries(nextEntries, index),
        activeIndex: index,
        isTransitioning: false,
        lastAction: action,
        transition: null,
      };
    }
    case 'reset': {
      const entries = action.entries.map(
        (entry, index) =>
          ({
            key: createNavigationEntryKey(),
            routeName: entry.name,
            params: entry.params ?? {},
            meta: entry.meta,
            createdAt: Date.now() + index,
            state: index === action.entries.length - 1 ? 'active' : 'inactive',
          }) satisfies NavigationEntry,
      );
      return {
        entries,
        activeIndex: Math.max(0, entries.length - 1),
        isTransitioning: false,
        lastAction: action,
        transition: null,
      };
    }
    case 'setParams': {
      if (!state.entries[state.activeIndex]) {
        return state;
      }
      const entries = [...state.entries];
      const currentEntry = entries[state.activeIndex];
      if (currentEntry) {
        entries[state.activeIndex] = {
          ...currentEntry,
          params: mergeNavigationParams(currentEntry.params, action.params),
        };
      }
      return {
        ...state,
        entries,
        lastAction: action,
      };
    }
    case 'updateEntry': {
      const index = state.entries.findIndex(
        (entry) => entry.key === action.entryKey,
      );
      if (index < 0) {
        return state;
      }
      const entries = [...state.entries];
      if (entries[index]) {
        entries[index] = action.updater(entries[index]);
      }
      return {
        ...state,
        entries,
        lastAction: action,
      };
    }
    case 'preload':
      return {
        ...state,
        lastAction: action,
      };
    default:
      return state;
  }
}
