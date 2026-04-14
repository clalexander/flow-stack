import type { ReactElement } from 'react';

import type {
  NavigationCachePolicy,
  NavigationMeta,
  NavigationParams,
  NavigationPresentation,
  NavigationRouteDefinition,
  NavigationRouteName,
  NavigationRouteId,
  NavigationScreenComponent,
  NavigationTransitionPresetName,
  NavigationTransitionResolver,
  NavigationTransitionSpec,
  NavigationEnterGuard,
  NavigationLeaveGuard,
} from '../core/public';

export interface NavigationStackScreenProps<
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

export function NavigationStackScreen<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: NavigationStackScreenProps<TRouteName, TParams>,
): ReactElement | null {
  return null;
}

export type { NavigationRouteDefinition };
