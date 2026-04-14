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

export interface NavigationStackController {
  readonly stackId: NavigationStackId;
  readonly state: NavigationStackState;
  readonly entries: readonly NavigationEntry[];
  readonly activeEntry: NavigationEntry | null;
  readonly depth: number;
  readonly canGoBack: boolean;

  dispatch(action: NavigationAction): void;

  push(
    route: NavigationRouteName,
    params?: NavigationParams,
    options?: NavigationActionOptions,
  ): void;

  replace(
    route: NavigationRouteName,
    params?: NavigationParams,
    options?: NavigationActionOptions,
  ): void;

  pop(count?: number, options?: NavigationActionOptions): void;

  popToRoot(options?: NavigationActionOptions): void;

  popTo(
    matcher: NavigationEntryMatcher,
    options?: NavigationActionOptions,
  ): void;

  reset(
    entries: readonly NavigationEntryInput[],
    options?: NavigationActionOptions,
  ): void;

  setParams<TParams extends NavigationParams = NavigationParams>(
    params: Partial<TParams>,
    options?: NavigationActionOptions,
  ): void;

  updateEntry(
    entryKey: NavigationEntryKey,
    updater: (entry: NavigationEntry) => NavigationEntry,
    options?: NavigationActionOptions,
  ): void;

  preload(
    route: NavigationRouteName,
    params?: NavigationParams,
    options?: NavigationActionOptions,
  ): void;

  getEntry(matcher: NavigationEntryMatcher): NavigationEntry | null;
}
