import { useContext } from 'react';

import { NavigationStackContext } from '../context/NavigationStackContext';
import { NavigationStackRegistryContext } from '../context/NavigationStackRegistryContext';
import type {
  NavigationStackController,
  NavigationStackId,
} from '../core/public';

/**
 * The return type of `useNavigationStack`.
 * Extends `NavigationStackController` with the full navigation API.
 */
export interface UseNavigationStackResult extends NavigationStackController {}

/**
 * Returns the `NavigationStackController` for the nearest `NavigationStackProvider`
 * ancestor, or for a specific stack when `stackId` is supplied.
 *
 * Throws if no matching stack is found in the tree.
 *
 * @param stackId - Optional ID of a specific stack to target. When omitted, uses the nearest provider.
 * @returns The controller for the resolved stack.
 */
export function useNavigationStack(
  stackId?: NavigationStackId,
): UseNavigationStackResult {
  const stackContext = useContext(NavigationStackContext);
  const registry = useContext(NavigationStackRegistryContext);

  if (!stackId && stackContext) {
    return stackContext.controller;
  }

  if (stackId && registry?.has(stackId)) {
    const controller = registry.get(stackId);
    if (controller) {
      return controller;
    }
  }

  if (stackId && stackContext?.controller.stackId === stackId) {
    return stackContext.controller;
  }

  throw new Error(
    'No navigation stack is available for the requested stackId.',
  );
}
