import type { ReactNode } from 'react';

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

/**
 * Props for the declarative `<NavigationStackScreen>` element.
 * The props mirror `NavigationRouteDefinition` and are collected by
 * `NavigationStackProvider` via `React.Children` — the component itself renders nothing.
 */
export interface NavigationStackScreenProps<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  /** The unique name that identifies this route. */
  name: TRouteName;
  /** The React component to render for this screen. */
  component: NavigationScreenComponent<TParams>;
  /**
   * Optional function that returns a stable identity ID from params.
   * Used to deduplicate entries for the same logical screen.
   */
  getId?: (params: TParams) => NavigationRouteId | undefined;
  /** A static title string or a function that derives the title from params. */
  title?: string | ((params: TParams) => string);
  /** Params shallow-merged with caller-supplied params at push time. */
  defaultParams?: Partial<TParams>;
  /** How this screen is presented — overrides the stack-level default. */
  presentation?: NavigationPresentation;
  /** Transition for this screen — overrides the stack-level default. */
  transition?:
    | NavigationTransitionPresetName
    | NavigationTransitionSpec
    | NavigationTransitionResolver;
  /** Guard called before this screen is entered. Return `false` to block. */
  canEnter?: NavigationEnterGuard<TParams>;
  /** Guard called before this screen is left. Return `false` to block. */
  canLeave?: NavigationLeaveGuard<TParams>;
  /** Cache strategy for this screen's component when it leaves the active position. */
  cachePolicy?: NavigationCachePolicy;
  /** Arbitrary metadata accessible in guard contexts and entry records. */
  meta?: NavigationMeta;
}

/**
 * Declarative route registration element for `NavigationStackProvider`.
 *
 * Place `<NavigationStackScreen>` elements as direct children of
 * `<NavigationStackProvider>` to register routes without a separate
 * `routes` prop. The component always renders `null`.
 */
export function NavigationStackScreen<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: NavigationStackScreenProps<TRouteName, TParams>,
): ReactNode {
  return null;
}

export type { NavigationRouteDefinition };
