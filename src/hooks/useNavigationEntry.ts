import type {
  NavigationEntry,
  NavigationEntryKey,
  NavigationParams,
  NavigationRouteName,
  NavigationStackId,
} from '../core/public';

import { useNavigationStack } from './useNavigationStack';

/**
 * Snapshot of the currently active stack entry returned by `useNavigationEntry`.
 */
export interface UseNavigationEntryResult<
  TParams extends NavigationParams = NavigationParams,
> {
  /** The full active entry object, or `null` if the stack is empty. */
  entry: NavigationEntry<NavigationRouteName, TParams> | null;
  /** Shortcut to `entry.routeName`, or `null` if the stack is empty. */
  routeName: NavigationRouteName | null;
  /** Shortcut to `entry.params`, or `null` if the stack is empty. */
  params: TParams | null;
  /** Shortcut to `entry.key`, or `null` if the stack is empty. */
  entryKey: NavigationEntryKey | null;
  /** Zero-based index of the active entry in the stack. */
  index: number;
  /** Whether the stack has an active entry (`true` when not empty). */
  isActive: boolean;
  /** Whether the active entry is the first (root) entry in the stack. */
  isRoot: boolean;
}

/**
 * Returns a snapshot of the currently active entry for the resolved stack.
 *
 * @param stackId - Optional ID of a specific stack to target. When omitted, uses the nearest provider.
 * @returns A snapshot of the active entry and its derived properties.
 */
export function useNavigationEntry<
  TParams extends NavigationParams = NavigationParams,
>(stackId?: NavigationStackId): UseNavigationEntryResult<TParams> {
  const navigation = useNavigationStack(stackId);
  const entry = navigation.activeEntry as NavigationEntry<
    NavigationRouteName,
    TParams
  > | null;
  const index = navigation.state.activeIndex;

  return {
    entry,
    routeName: entry?.routeName ?? null,
    params: entry?.params ?? null,
    entryKey: entry?.key ?? null,
    index,
    isActive: entry !== null,
    isRoot: index <= 0,
  };
}
