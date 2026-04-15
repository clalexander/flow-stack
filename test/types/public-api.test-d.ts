import { expectTypeOf } from 'vitest';

import type {
  NavigationRouteDefinition,
  NavigationScreenComponent,
  NavigationStackController,
  NavigationStackProviderProps,
  NavigationScreenRenderProps,
  UseNavigationEntryResult,
  UseNavigationStackResult,
  NavigationStackState,
} from '../../src/core/public';

// ---------------------------------------------------------------------------
// RouteDefinition — params typed through component
// ---------------------------------------------------------------------------

interface HomeParams {
  title: string;
  [key: string]: unknown;
}
type HomeRoute = NavigationRouteDefinition<'Home', HomeParams>;

declare const homeRoute: HomeRoute;
expectTypeOf(homeRoute.name).toEqualTypeOf<'Home'>();
expectTypeOf(homeRoute.component).toEqualTypeOf<
  NavigationScreenComponent<HomeParams>
>();

// ---------------------------------------------------------------------------
// NavigationScreenRenderProps generic flow
// ---------------------------------------------------------------------------

declare const renderProps: NavigationScreenRenderProps<{ id: number }>;
expectTypeOf(renderProps.params.id).toEqualTypeOf<number>();
expectTypeOf(renderProps.params.id).not.toEqualTypeOf<string>();

// ---------------------------------------------------------------------------
// NavigationStackController — push typing
// ---------------------------------------------------------------------------

declare const controller: NavigationStackController;

// push/replace/pop/popToRoot are present
expectTypeOf(controller.push).toEqualTypeOf<
  NavigationStackController['push']
>();
expectTypeOf(controller.pop).toEqualTypeOf<NavigationStackController['pop']>();

// dispatch accepts NavigationAction
controller.dispatch({ type: 'push', route: 'Home' });
controller.dispatch({ type: 'pop' });
controller.dispatch({ type: 'reset', entries: [{ name: 'Home' }] });

// @ts-expect-error — invalid action type
controller.dispatch({ type: 'INVALID' });

// ---------------------------------------------------------------------------
// UseNavigationStackResult extends NavigationStackController
// ---------------------------------------------------------------------------

declare const hookResult: UseNavigationStackResult;
expectTypeOf(hookResult.push).toEqualTypeOf<
  NavigationStackController['push']
>();

// ---------------------------------------------------------------------------
// UseNavigationEntryResult generic params
// ---------------------------------------------------------------------------

declare const entryResult: UseNavigationEntryResult<{ userId: number }>;
// params can be null (nothing pushed yet) or { userId: number }
if (entryResult.params !== null) {
  expectTypeOf(entryResult.params.userId).toEqualTypeOf<number>();
}

// ---------------------------------------------------------------------------
// Controlled provider — requires both state + onStateChange
// ---------------------------------------------------------------------------

declare const validState: NavigationStackState;
declare const handleChange: (s: NavigationStackState) => void;

// Valid controlled props — both state and onStateChange provided
const controlledProps: NavigationStackProviderProps = {
  id: 'x',
  state: validState,
  onStateChange: handleChange,
};
expectTypeOf(controlledProps).toExtend<NavigationStackProviderProps>();

// @ts-expect-error — controlled mode requires onStateChange too
const missingOnChange: NavigationStackProviderProps = {
  id: 'x',
  state: validState,
};
void missingOnChange;

// ---------------------------------------------------------------------------
// Uncontrolled provider — must not accept state or onStateChange
// ---------------------------------------------------------------------------

const uncontrolledProps: NavigationStackProviderProps = {
  id: 'x',
  initialRoute: { name: 'Home' },
};
expectTypeOf(uncontrolledProps).toExtend<NavigationStackProviderProps>();
