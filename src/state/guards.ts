import type {
  NavigationAction,
  NavigationGuardResult,
  NavigationStackState,
} from '../core/public';
import type { NavigationRouteDefinition } from '../core/public';

export interface RunNavigationGuardsOptions {
  action: NavigationAction;
  currentState: NavigationStackState;
  nextState?: NavigationStackState;
  currentRoute?: NavigationRouteDefinition | null;
  nextRoute?: NavigationRouteDefinition | null;
  stackId?: string;
}

async function resolveGuard(
  result: NavigationGuardResult | undefined,
): Promise<boolean> {
  if (typeof result === 'undefined') {
    return true;
  }

  return Promise.resolve(result);
}

export async function runNavigationGuards(
  options: RunNavigationGuardsOptions,
): Promise<boolean> {
  const {
    action,
    currentState,
    nextState,
    currentRoute,
    nextRoute,
    stackId = 'default',
  } = options;
  const currentEntry = currentState.entries[currentState.activeIndex] ?? null;
  const nextEntry = nextState
    ? (nextState.entries[nextState.activeIndex] ?? null)
    : null;

  if (currentRoute?.canLeave) {
    const allowed = await resolveGuard(
      currentRoute.canLeave({
        stackId,
        currentState,
        nextState,
        currentEntry,
        nextEntry,
        params: currentEntry?.params ?? {},
        action,
      }),
    );

    if (!allowed) {
      return false;
    }
  }

  if (nextRoute?.canEnter) {
    const allowed = await resolveGuard(
      nextRoute.canEnter({
        stackId,
        currentState,
        nextState,
        currentEntry,
        nextEntry,
        params: nextEntry?.params ?? {},
        action,
      }),
    );

    if (!allowed) {
      return false;
    }
  }

  return true;
}
