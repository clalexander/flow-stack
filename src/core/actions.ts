import type { NavigationEntry, NavigationEntryMatcher } from './entries';
import type {
  NavigationDirection,
  NavigationEntryKey,
  NavigationFocusBehavior,
  NavigationInterruptPolicy,
  NavigationParams,
  NavigationRouteName,
  NavigationScrollBehavior,
  NavigationTransitionPresetName,
} from './primitives';
import type { NavigationEntryInput } from './routes';
import type { NavigationTransitionSpec } from './transitions';

/** Per-action overrides that fine-tune how a navigation action behaves. */
export interface NavigationActionOptions {
  /** Override the transition animation for this specific action. */
  transition?: NavigationTransitionPresetName | NavigationTransitionSpec;
  /** Override the animation direction for this specific action. */
  direction?: NavigationDirection;
  /** An optional string describing why this action was dispatched (useful for analytics/debugging). */
  reason?: string;
  /**
   * When `true` and the target route is already the active entry, replace it instead of
   * pushing a duplicate. Only applies to `push` actions.
   */
  replaceIfSame?: boolean;
  /** Override focus behaviour for this action. */
  focusBehavior?: NavigationFocusBehavior;
  /** Override scroll reset behaviour for this action. */
  scrollBehavior?: NavigationScrollBehavior;
  /** Override how this action is handled when another transition is already in progress. */
  interruptPolicy?: NavigationInterruptPolicy;
}

/** Action that pushes a new entry onto the stack. */
export interface NavigationPushAction<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  /** Discriminant for the push action. */
  type: 'push';
  /** The name of the route to navigate to. */
  route: TRouteName;
  /** Parameters to pass to the route. */
  params?: TParams;
  /** Per-action options overriding stack or route defaults. */
  options?: NavigationActionOptions;
}

/** Action that replaces the current active entry with a new one. */
export interface NavigationReplaceAction<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  /** Discriminant for the replace action. */
  type: 'replace';
  /** The name of the route to navigate to. */
  route: TRouteName;
  /** Parameters to pass to the route. */
  params?: TParams;
  /** Per-action options overriding stack or route defaults. */
  options?: NavigationActionOptions;
}

/** Action that pops one or more entries from the top of the stack. */
export interface NavigationPopAction {
  /** Discriminant for the pop action. */
  type: 'pop';
  /** Number of entries to pop. Defaults to `1`. */
  count?: number;
  /** Per-action options overriding stack or route defaults. */
  options?: NavigationActionOptions;
}

/** Action that pops all entries above the root, returning to the first entry. */
export interface NavigationPopToRootAction {
  /** Discriminant for the popToRoot action. */
  type: 'popToRoot';
  /** Per-action options overriding stack or route defaults. */
  options?: NavigationActionOptions;
}

/** Action that pops entries until a specific entry is reached. */
export interface NavigationPopToAction {
  /** Discriminant for the popTo action. */
  type: 'popTo';
  /** Criteria used to locate the target entry. */
  matcher: NavigationEntryMatcher;
  /** Per-action options overriding stack or route defaults. */
  options?: NavigationActionOptions;
}

/** Action that replaces the entire stack with a new set of entries. */
export interface NavigationResetAction {
  /** Discriminant for the reset action. */
  type: 'reset';
  /** The new entries to populate the stack with, in order (last entry becomes active). */
  entries: readonly NavigationEntryInput[];
  /** Per-action options overriding stack or route defaults. */
  options?: NavigationActionOptions;
}

/** Action that merges new parameters into the active entry. */
export interface NavigationSetParamsAction<
  TParams extends NavigationParams = NavigationParams,
> {
  /** Discriminant for the setParams action. */
  type: 'setParams';
  /** Partial parameters to shallow-merge into the active entry's params. */
  params: Partial<TParams>;
  /** Per-action options overriding stack or route defaults. */
  options?: NavigationActionOptions;
}

/** Action that applies an arbitrary updater function to a specific stack entry. */
export interface NavigationUpdateEntryAction {
  /** Discriminant for the updateEntry action. */
  type: 'updateEntry';
  /** The key of the entry to update. */
  entryKey: NavigationEntryKey;
  /** Pure function that receives the current entry and returns the updated entry. */
  updater: (entry: NavigationEntry) => NavigationEntry;
  /** Per-action options overriding stack or route defaults. */
  options?: NavigationActionOptions;
}

/** Action that hints the stack should prepare (preload) a route before it is navigated to. */
export interface NavigationPreloadAction<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  /** Discriminant for the preload action. */
  type: 'preload';
  /** The name of the route to preload. */
  route: TRouteName;
  /** Parameters that will be passed when the route is eventually pushed. */
  params?: TParams;
  /** Per-action options overriding stack or route defaults. */
  options?: NavigationActionOptions;
}

/** Union of all dispatchable navigation actions. */
export type NavigationAction =
  | NavigationPushAction
  | NavigationReplaceAction
  | NavigationPopAction
  | NavigationPopToRootAction
  | NavigationPopToAction
  | NavigationResetAction
  | NavigationSetParamsAction
  | NavigationUpdateEntryAction
  | NavigationPreloadAction;
