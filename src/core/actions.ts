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

export interface NavigationActionOptions {
  transition?: NavigationTransitionPresetName | NavigationTransitionSpec;
  direction?: NavigationDirection;
  reason?: string;
  replaceIfSame?: boolean;
  focusBehavior?: NavigationFocusBehavior;
  scrollBehavior?: NavigationScrollBehavior;
  interruptPolicy?: NavigationInterruptPolicy;
}

export interface NavigationPushAction<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  type: 'push';
  route: TRouteName;
  params?: TParams;
  options?: NavigationActionOptions;
}

export interface NavigationReplaceAction<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  type: 'replace';
  route: TRouteName;
  params?: TParams;
  options?: NavigationActionOptions;
}

export interface NavigationPopAction {
  type: 'pop';
  count?: number;
  options?: NavigationActionOptions;
}

export interface NavigationPopToRootAction {
  type: 'popToRoot';
  options?: NavigationActionOptions;
}

export interface NavigationPopToAction {
  type: 'popTo';
  matcher: NavigationEntryMatcher;
  options?: NavigationActionOptions;
}

export interface NavigationResetAction {
  type: 'reset';
  entries: readonly NavigationEntryInput[];
  options?: NavigationActionOptions;
}

export interface NavigationSetParamsAction<
  TParams extends NavigationParams = NavigationParams,
> {
  type: 'setParams';
  params: Partial<TParams>;
  options?: NavigationActionOptions;
}

export interface NavigationUpdateEntryAction {
  type: 'updateEntry';
  entryKey: NavigationEntryKey;
  updater: (entry: NavigationEntry) => NavigationEntry;
  options?: NavigationActionOptions;
}

export interface NavigationPreloadAction<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  type: 'preload';
  route: TRouteName;
  params?: TParams;
  options?: NavigationActionOptions;
}

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
