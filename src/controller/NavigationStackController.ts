import type {
  NavigationAction,
  NavigationActionOptions,
  NavigationEntry,
  NavigationEntryInput,
  NavigationEntryKey,
  NavigationEntryMatcher,
  NavigationParams,
  NavigationRouteName,
  NavigationStackId,
  NavigationStackState,
} from '../core/public';

/**
 * The headless controller for a navigation stack.
 * Returned by `createNavigationStackController` and exposed via `useNavigationStack`.
 */
export interface NavigationStackController {
  /** The unique identifier of this stack instance. */
  readonly stackId: NavigationStackId;
  /** A snapshot of the complete current stack state. */
  readonly state: NavigationStackState;
  /** Shortcut for `state.entries`. */
  readonly entries: readonly NavigationEntry[];
  /** The currently active entry, or `null` if the stack is empty. */
  readonly activeEntry: NavigationEntry | null;
  /** Number of entries currently in the stack. */
  readonly depth: number;
  /** Whether there is at least one entry to pop back to. */
  readonly canGoBack: boolean;

  /**
   * Dispatches a raw `NavigationAction` to the stack.
   * Prefer the typed helper methods (`push`, `pop`, etc.) over calling this directly.
   *
   * @param action - The action to dispatch.
   */
  dispatch(action: NavigationAction): void;

  /**
   * Pushes a new entry for the given route onto the top of the stack.
   *
   * @param route - The name of the route to navigate to.
   * @param params - Optional parameters to pass to the route.
   * @param options - Optional per-action overrides.
   */
  push(
    route: NavigationRouteName,
    params?: NavigationParams,
    options?: NavigationActionOptions,
  ): void;

  /**
   * Replaces the current active entry with a new entry for the given route.
   *
   * @param route - The name of the route to navigate to.
   * @param params - Optional parameters to pass to the route.
   * @param options - Optional per-action overrides.
   */
  replace(
    route: NavigationRouteName,
    params?: NavigationParams,
    options?: NavigationActionOptions,
  ): void;

  /**
   * Pops one or more entries from the top of the stack.
   *
   * @param count - Number of entries to pop. Defaults to `1`.
   * @param options - Optional per-action overrides.
   */
  pop(count?: number, options?: NavigationActionOptions): void;

  /**
   * Pops all entries above the root, navigating back to the first entry.
   *
   * @param options - Optional per-action overrides.
   */
  popToRoot(options?: NavigationActionOptions): void;

  /**
   * Pops entries until the entry matched by `matcher` is reached.
   *
   * @param matcher - Criteria used to locate the target entry.
   * @param options - Optional per-action overrides.
   */
  popTo(
    matcher: NavigationEntryMatcher,
    options?: NavigationActionOptions,
  ): void;

  /**
   * Replaces the entire stack with the provided entries (last entry becomes active).
   *
   * @param entries - The new set of entries to populate the stack with.
   * @param options - Optional per-action overrides.
   */
  reset(
    entries: readonly NavigationEntryInput[],
    options?: NavigationActionOptions,
  ): void;

  /**
   * Shallow-merges new parameters into the currently active entry.
   *
   * @param params - Partial params to merge into the active entry's params.
   * @param options - Optional per-action overrides.
   */
  setParams<TParams extends NavigationParams = NavigationParams>(
    params: Partial<TParams>,
    options?: NavigationActionOptions,
  ): void;

  /**
   * Applies an arbitrary updater function to a specific stack entry.
   *
   * @param entryKey - The key of the entry to update.
   * @param updater - A pure function that receives the current entry and returns the updated entry.
   * @param options - Optional per-action overrides.
   */
  updateEntry(
    entryKey: NavigationEntryKey,
    updater: (entry: NavigationEntry) => NavigationEntry,
    options?: NavigationActionOptions,
  ): void;

  /**
   * Hints the stack to prepare (preload) a route before it is navigated to.
   * In the default implementation this is a no-op and exists as an extension point.
   *
   * @param route - The name of the route to preload.
   * @param params - Parameters that will be passed when the route is eventually pushed.
   * @param options - Optional per-action overrides.
   */
  preload(
    route: NavigationRouteName,
    params?: NavigationParams,
    options?: NavigationActionOptions,
  ): void;

  /**
   * Returns the first entry matching `matcher`, or `null` if no match is found.
   *
   * @param matcher - Criteria used to locate the entry.
   * @returns The matched entry, or `null`.
   */
  getEntry(matcher: NavigationEntryMatcher): NavigationEntry | null;
}
