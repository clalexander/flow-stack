import type { ComponentType } from 'react';

import type { NavigationAction } from './actions';
import type { NavigationEntry, NavigationStackState } from './entries';
import type {
  NavigationCachePolicy,
  NavigationEntryKey,
  NavigationMeta,
  NavigationParams,
  NavigationPresentation,
  NavigationRouteId,
  NavigationRouteName,
  NavigationStackId,
  NavigationTransitionPresetName,
} from './primitives';
import type {
  NavigationTransitionResolver,
  NavigationTransitionSpec,
} from './transitions';

export interface NavigationRouteRef<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  name: TRouteName;
  params?: TParams;
}

export interface NavigationGuardContext<
  TParams extends NavigationParams = NavigationParams,
> {
  stackId: NavigationStackId;
  currentState: NavigationStackState;
  nextState?: NavigationStackState;
  currentEntry: NavigationEntry | null;
  nextEntry?: NavigationEntry | null;
  params: TParams;
  action: NavigationAction;
}

export type NavigationGuardResult = boolean | Promise<boolean>;

export type NavigationEnterGuard<
  TParams extends NavigationParams = NavigationParams,
> = (context: NavigationGuardContext<TParams>) => NavigationGuardResult;

export type NavigationLeaveGuard<
  TParams extends NavigationParams = NavigationParams,
> = (context: NavigationGuardContext<TParams>) => NavigationGuardResult;

export interface NavigationScreenRenderProps<
  TParams extends NavigationParams = NavigationParams,
> {
  entry: NavigationEntry<NavigationRouteName, TParams>;
  params: TParams;
  isActive: boolean;
  isRoot: boolean;
  index: number;
}

export type NavigationScreenComponent<
  TParams extends NavigationParams = NavigationParams,
> = ComponentType<NavigationScreenRenderProps<TParams>>;

export interface NavigationRouteDefinition<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  name: TRouteName;
  component: NavigationScreenComponent<TParams>;
  getId?: (params: TParams) => NavigationRouteId | undefined;
  title?: string | ((params: TParams) => string);
  defaultParams?: Partial<TParams>;
  presentation?: NavigationPresentation;
  transition?:
    | NavigationTransitionPresetName
    | NavigationTransitionSpec
    | NavigationTransitionResolver;
  canEnter?: NavigationEnterGuard<TParams>;
  canLeave?: NavigationLeaveGuard<TParams>;
  cachePolicy?: NavigationCachePolicy;
  meta?: NavigationMeta;
}

export type NavigationRouteRegistry =
  | readonly NavigationRouteDefinition<NavigationRouteName, any>[]
  | Readonly<
      Record<
        NavigationRouteName,
        NavigationRouteDefinition<NavigationRouteName, any>
      >
    >;

export interface NavigationEntryInput<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  name: TRouteName;
  params?: TParams;
  meta?: NavigationMeta;
}

export type NavigationRouteKeyResolver = (args: {
  stackId: NavigationStackId;
  routeName: NavigationRouteName;
  params: NavigationParams;
  id?: NavigationRouteId;
  existingEntries: readonly NavigationEntry[];
}) => NavigationEntryKey;
